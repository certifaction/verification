import { Buffer } from 'node:buffer'
import EthCrypto from 'eth-crypto'
import { decrypt as eciesDecrypt } from 'ecies-geth'
import axios from 'axios'
import type CertifactionEthClient from '../eth/CertifactionEthClient.ts'

export interface FileVerification {
    issuerAddress: string
    issuerName: string
    issuerImg: string
    issuerVerified: boolean
    issuerVerifiedBy: string
    issuerVerifiedImg: string
    revoked: boolean
    registrationEvent: object
    registrationBlock: object
    revocationEvent: object
    revocationBlock: object
    events: FileEvent[]
    claims: object[]
}

export interface FileEvent {
    ref: string
    scope: string
    rfc3339: string
    issuer: Issuer
    on_blockchain: OnBlockchain
}

export interface Issuer {
    id: string
    name: string
    name_verified: boolean
    email: string
    email_verified: boolean
    verified_by: VerifiedBy
}

export interface VerifiedBy {
    name: string
    image: string
}

export interface OnBlockchain {
    type: string
    contract_address: string
    tx_hash: string
}

export const SIGNATURE_LEVEL_STANDARD = 'standard'
export const SIGNATURE_LEVEL_QES = 'QES'

export default class CertifactionClaimVerifier {
    acceptedIssuerKey: string
    certifactionEthClient: CertifactionEthClient
    certifactionApiUrl: string | null

    /**
     * Certifaction Claim Verifier
     *
     * If only the acceptedIssuerKey is provided, verify() can't be used, but resolveAndVerifyClaims() is still usable.
     *
     * @constructor
     *
     * @param acceptedIssuerKey in HEX format (ex. 0x010...)
     * @param certifactionEthClient
     * @param certifactionApiUrl
     */
    constructor(
        acceptedIssuerKey: string,
        certifactionEthClient: CertifactionEthClient = null,
        certifactionApiUrl: string | null = null,
    ) {
        this.acceptedIssuerKey = acceptedIssuerKey
        this.certifactionEthClient = certifactionEthClient
        this.certifactionApiUrl = certifactionApiUrl
    }

    /**
     * Verify the given file hash with claims
     */
    async verify(fileHash: string, decryptionKey: string): Promise<FileVerification | null> {
        const claimEvents = await this.certifactionEthClient.getClaimEvents(fileHash)
        if (claimEvents === null) {
            return null
        }

        console.log(`${claimEvents.length} event(s) found on Blockchain for File ${fileHash}`)

        const claims = await this.getClaims(claimEvents, fileHash)
        if (claims.length === 0) {
            return null
        }

        const fileVerification = await this.resolveAndVerifyClaims(claims, decryptionKey, claimEvents)

        if (fileVerification !== null && fileVerification.issuerAddress && fileVerification.issuerVerified === false) {
            console.log('Issuer not verified by claims, try to verify by legacy contract...')
            const verifiedIssuer = await this.certifactionEthClient.verifyIssuerByLegacyContract(
                fileVerification.issuerAddress,
            )
            if (verifiedIssuer.issuerVerified === true) {
                fileVerification.issuerName = verifiedIssuer.issuerName
                fileVerification.issuerImg = verifiedIssuer.issuerImg
                fileVerification.issuerVerified = verifiedIssuer.issuerVerified
                fileVerification.issuerVerifiedBy = 'Certifaction AG'

                fileVerification.events = fileVerification.events.map((event) => {
                    const newEvent = { ...event }
                    newEvent.issuer.name = verifiedIssuer.issuerName
                    newEvent.issuer.verified = true
                    newEvent.issuer.verified_by = {
                        name: 'Certifaction AG',
                    }

                    return newEvent
                })
            }
        }

        return fileVerification
    }

    /**
     * Get the claims for the given claim events and file hash
     *
     * @param claimEvents Claim events from the blockchain
     * @param fileHash
     */
    async getClaims(claimEvents: object[], fileHash: string): Promise<object[]> {
        const claims = []

        for (const claimEvent of claimEvents) {
            console.log('---------')

            const claimFileHash = claimEvent.returnValues.file
            const claimHash = claimEvent.returnValues.hash
            if (fileHash !== claimFileHash) {
                console.error('Hashes NOT matching, event is not for this file, discarding.')
                continue
            }

            console.log('Event is for file.')
            console.log('File event:', claimEvent)
            console.log(
                `Etherscan link to Tx: ${this.certifactionEthClient.ethScanUrl}/tx/${claimEvent.transactionHash}`,
            )
            console.log(`File is associated with claim hash: ${claimHash}`)

            const claim = await this.getClaim(claimHash)

            if (!claim) {
                console.warn('No claim found')
                continue
            }

            if (!this.verifyClaim(claim, claimHash, claimFileHash)) {
                console.error("The claim couldn't be verified, discarding.")
                continue
            }

            claims.push(claim)
        }

        return claims
    }

    /**
     * Get the claim from the Certifaction API for the given claim hash
     */
    async getClaim(claimHash: string): Promise<object> {
        try {
            const res = await axios.get(`${this.certifactionApiUrl}/claim/${claimHash}`)
            if (res.status === 200) {
                return res.data
            }
            throw new Error(`Unexpected status ${res.status}`)
        } catch (e) {
            if (e.response && e.response.status === 404) {
                return null
            }
            throw e
        }
    }

    /**
     * Validates the given claim
     *
     * @param claim
     * @param validClaimHash Only use the claim hash coming from the blockchain
     * @param validFileHash Only use the file hash coming from the blockchain
     */
    verifyClaim(claim: object, validClaimHash: string, validFileHash: string): boolean {
        // Verify if the claim hash matches the claim hash from the blockchain
        const claimHash = this.getClaimHash(claim)
        if (claimHash !== validClaimHash) {
            console.error(
                `The keccak256-hash from the claim (${claimHash}) doesn't match the valid claim hash (${validClaimHash}).`,
                claim,
            )
            return false
        }
        console.log('Claim hashes matching, claim is valid.', claim)

        // Verify if the file hash from the claim matches the file hash from the blockchain
        if (claim['@id'].toLowerCase() !== 'cert:hash:' + validFileHash.toLowerCase()) {
            console.error('Hashes NOT matching, claim is NOT for this File.', claim)
            return false
        }
        console.log('File hashes matching, claim is for this File.')

        return true
    }

    /**
     * Resolve and verify the given claims
     *
     * @param claims
     * @param decryptionKey Private key from the PDF file (if available)
     * @param claimEvents Claim events from the blockchain
     */
    async resolveAndVerifyClaims(
        claims: object[],
        decryptionKey: string,
        claimEvents?: object[],
    ): Promise<FileVerification | null> {
        const fileVerification = {
            issuerAddress: null,
            issuerName: null,
            issuerImg: null,
            issuerVerified: false,
            issuerVerifiedBy: null,
            issuerVerifiedImg: null,
            revoked: false,
            events: [],
            claims,
        }

        for (let claim of claims) {
            const claimHash = this.getClaimHash(claim)

            switch (claim['@context']) {
                case 'https://schema.certifaction.io/encryptedclaim/v1':
                    if (!decryptionKey) {
                        console.error('Found encrypted claim, but no decryption key was provided, discarding.')
                        continue
                    }

                    try {
                        console.log("It's an encrypted claim, trying to decrypt it...")
                        claim = await this.decryptClaim(claim, decryptionKey)
                        console.log('Decrypted claim:', claim)
                    } catch (e) {
                        console.error(`Error while decrypting encrypted claim, discarding. ${e.name} - ${e.message}`)
                        continue
                    }
                    break
            }

            // Get issuer address from signature
            const issuerAddress = await this.verifySignatureAndGetPubKey(claim)
            if (!issuerAddress) {
                console.error("Signature couldn't be verified, discarding.")
                continue
            }
            console.log('Signer address matches Claim Creator attribute')
            fileVerification.issuerAddress = issuerAddress

            let issuerIdentity = null
            if (claim.idclaims instanceof Array) {
                issuerIdentity = await this.resolveAndVerifyIssuerIdentity(claim.idclaims, issuerAddress)
                if (issuerIdentity !== null) {
                    if (issuerIdentity.name) {
                        fileVerification.issuerName = issuerIdentity.name
                    }

                    if (issuerIdentity.verified_by) {
                        fileVerification.issuerVerified = true

                        if (issuerIdentity.verified_by.name) {
                            fileVerification.issuerVerifiedBy = issuerIdentity.verified_by.name
                        }
                        if (issuerIdentity.verified_by.image) {
                            fileVerification.issuerVerifiedImg = issuerIdentity.verified_by.image
                        }
                    }
                }
            }

            const fileEvent = {
                ref: claimHash,
                scope: claim.scope,
                issuer: {
                    id: issuerAddress,
                },
            }
            if (issuerIdentity) {
                fileEvent.issuer = issuerIdentity
            }

            if (fileEvent.scope === 'retract') {
                fileEvent.note = claim.note
            }

            const signature = {}
            if (claim.level) {
                signature.level = claim.level
            } else if (claim.scope === 'sign') {
                signature.level = SIGNATURE_LEVEL_STANDARD
            }
            if (claim.jurisdiction) {
                signature.jurisdiction = claim.jurisdiction
            }
            if (claim.level === SIGNATURE_LEVEL_QES && claim.jurisdiction && Array.isArray(claim.proof)) {
                const proof = claim.proof.find((proof) => proof.type === claim.level + '-' + claim.jurisdiction)
                signature.pkcs7_data = proof.signatureValue
            }
            if (Object.keys(signature).length > 0) {
                fileEvent.signature = signature
            }

            const claimEvent = claimEvents ? claimEvents.find((event) => event.returnValues.hash === claimHash) : null
            let claimBlock = null
            if (claimEvent) {
                claimBlock = await this.certifactionEthClient.getBlock(claimEvent.blockHash)

                fileEvent.date = new Date(Number(claimBlock.timestamp) * 1000).toISOString()
                fileEvent.on_blockchain = {
                    type: 'ethereum',
                    contract_address: claimEvent.address,
                    tx_hash: claimEvent.transactionHash,
                }
            }

            console.log(`Claim scope: ${claim.scope}`)
            switch (claim.scope) {
                case 'register':
                case 'sign': // BP-2450: Handle "sign" claims like "register" claims for the moment
                case 'certify': // BP-2457: Verification Tool: Update the verification tool to accept "certify" claims as valid
                    // TODO(Cyrill): Remove when using only events
                    if (claimEvent) {
                        fileVerification.registrationEvent = claimEvent
                        fileVerification.registrationBlock = claimBlock
                    }
                    break

                case 'revoke':
                    fileVerification.revoked = true
                    // TODO(Cyrill): Remove when using only events
                    if (claimEvent) {
                        fileVerification.revocationEvent = claimEvent
                        fileVerification.revocationBlock = claimBlock
                    }
                    break
            }

            const duplicateEvent = fileVerification.events.find((event) => event.ref === claimHash)

            if (!duplicateEvent) {
                fileVerification.events.push(fileEvent)
            }
        }

        if (fileVerification.events.length === 0) {
            return null
        }

        return fileVerification
    }

    /**
     * Calculate the hash for the given claim
     *
     * @returns keccak256 hash
     */
    getClaimHash(claim: object): string {
        const claimJsonString = JSON.stringify(claim)

        return EthCrypto.hash.keccak256(claimJsonString)
    }

    /**
     * Decrypt and verify the given claim
     */
    async decryptClaim(encryptedClaim: object, decryptionKey: string): Promise<object> {
        switch (encryptedClaim.algorithm) {
            case 'ECIES': {
                const privateKey = Buffer.from(decryptionKey, 'hex')
                const decryptedClaimJson = await eciesDecrypt(privateKey, Buffer.from(encryptedClaim.claim, 'base64'))
                const decryptedClaim = JSON.parse(decryptedClaimJson.toString())

                // Verify if the @id from the encrypted claim matches matches with the decrypted claim
                if (decryptedClaim['@id'].toLowerCase() !== encryptedClaim['@id'].toLowerCase()) {
                    throw new Error(
                        `The @id from the decrypted claim (${decryptedClaim['@id']}) doesn't match with the encrypted claim (${encryptedClaim['@id']}).`,
                    )
                }

                return decryptedClaim
            }

            default:
                throw new Error(`Algorithm not supported: ${encryptedClaim.algorithm}`)
        }
    }

    /**
     * Finds the issuer in the given idClaims and verifies it
     */
    async resolveAndVerifyIssuerIdentity(idClaims: object[], claimIssuerAddress: string): Promise<Issuer | null> {
        const issuer: Issuer = {}

        for (const idClaim of idClaims) {
            if (idClaim['@id'].toLowerCase() !== 'cert:addr:' + claimIssuerAddress.toLowerCase()) {
                console.error(
                    'Addresses NOT matching, IdClaim is NOT for this claim issuer.',
                    idClaim['@id'],
                    claimIssuerAddress,
                )
                continue
            }

            const issuerAddress = await this.verifySignatureAndGetPubKey(idClaim)
            if (!issuerAddress) {
                console.error('IdClaim signature couldn\t be verified, discarding.')
                continue
            }

            if (issuerAddress !== this.acceptedIssuerKey) {
                console.error('Signer address does NOT match the accepted issuer address, discarding.')
                continue
            }

            issuer.id = claimIssuerAddress

            if (idClaim.name !== undefined) {
                issuer.name = idClaim.name
                issuer.name_verified = false

                if (idClaim.name_verified !== undefined) {
                    issuer.name_verified = idClaim.name_verified
                }
            }

            if (idClaim.email !== undefined) {
                issuer.email = idClaim.email
                issuer.email_verified = false

                if (idClaim.email_verified !== undefined) {
                    issuer.email_verified = idClaim.email_verified
                }
            }

            if (idClaim.verifiedBy !== undefined) {
                issuer.verified = true
                issuer.verified_by = { name: idClaim.verifiedBy }

                // TODO(Cyrill): Add verifier image
            }

            return issuer
        }

        return null
    }

    /**
     * Verify signature and get public key from given claim
     */
    verifySignatureAndGetPubKey(claim: object): string | null {
        console.log('Verifying Signature...')

        let proofs = claim.proof
        if (!Array.isArray(proofs)) {
            proofs = [proofs]
        }

        const unsignedClaim = JSON.parse(JSON.stringify(claim))
        if (Array.isArray(unsignedClaim.proof)) {
            const unsignedProofs = JSON.parse(JSON.stringify(unsignedClaim.proof))
            for (const key in unsignedProofs) {
                if (Object.prototype.hasOwnProperty.call(unsignedProofs, key)) {
                    delete unsignedProofs[key].signatureValue
                }
            }
            unsignedClaim.proof = unsignedProofs
        } else {
            delete unsignedClaim.proof.signatureValue
        }
        if (unsignedClaim.idclaims !== undefined) {
            delete unsignedClaim.idclaims
        }

        const unsignedClaimHash = this.getClaimHash(unsignedClaim)

        let pubKey = null

        for (const proof of proofs) {
            switch (proof.type) {
                case 'ECDSA': {
                    // Transform standard ECDSA signature's recovery id to Ethereum standard for verification
                    const plainSignature = proof.signatureValue.slice(0, 128)
                    const recoveryId = proof.signatureValue.slice(128, 130)
                    const fixedRecoveryId = parseInt(recoveryId, 16) + 27
                    const ethereuSignature = '0x' + plainSignature + fixedRecoveryId.toString(16)
                    console.log('Signature Value (Hex): ' + ethereuSignature)
                    console.log('Unsigned ClaimHash: ' + unsignedClaimHash)

                    pubKey = EthCrypto.recover(ethereuSignature, unsignedClaimHash)
                    console.log('Recovered public key: ' + pubKey)

                    if (pubKey !== proof.creator) {
                        console.error(
                            `Public key (${pubKey}) does NOT match Claim creator attribute (${proof.creator}.`,
                        )
                        return null
                    }
                    break
                }

                case 'QES-eIDAS':
                    // Ignore QES-eIDAS for the moment
                    break
            }
        }

        return pubKey
    }
}
