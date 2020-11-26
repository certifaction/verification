/**
 * @typedef {Object} FileVerification
 *
 * @property {string} issuerAddress
 * @property {string} issuerName
 * @property {string} issuerImg
 * @property {boolean} issuerVerified
 * @property {string} issuerVerifiedBy
 * @property {string} issuerVerifiedImg
 * @property {boolean} revoked
 * @property {number} expiry
 * @property {Object} registrationEvent
 * @property {Object} registrationBlock
 * @property {Object} revocationEvent
 * @property {Object} revocationBlock
 * @property {FileEvent[]} events
 * @property {Array} claims
 */

/**
 * @typedef {Object} FileEvent
 *
 * @property {string} ref
 * @property {string} scope
 * @property {Date} date
 * @property {Date} expiry
 * @property {string} issuer
 * @property {IdentityVerifier} identityVerifier
 * @property {Object} claimEvent
 * @property {Object} claimBlock
 */

/**
 * @typedef {Object} IssuerIdentity
 *
 * @property {string} issuer
 * @property {IdentityVerifier} identityVerifier
 */

/**
 * @typedef {Object} IdentityVerifier
 *
 * @property {string} name
 * @property {string} image
 */

import EthCrypto from 'eth-crypto'
import { decrypt as eciesDecrypt } from 'ecies-geth'
import axios from 'axios'

export default class CertifactionClaimVerifier {
    /**
     * Certifaction Claim Verifier
     *
     * If only the acceptedIssuerKey is provided, verify() can't be used, but resolveAndVerifyClaims() is still usable.
     *
     * @constructor
     *
     * @param {string} acceptedIssuerKey in HEX format (ex. 0x010...)
     * @param {CertifactionEthClient} certifactionEthClient (optional) Instance of the CertifactionEthClient
     * @param {string|null} certifactionApiUrl (optional)
     */
    constructor(acceptedIssuerKey, certifactionEthClient = null, certifactionApiUrl = null) {
        this.acceptedIssuerKey = acceptedIssuerKey
        this.certifactionEthClient = certifactionEthClient
        this.certifactionApiUrl = certifactionApiUrl
    }

    /**
     * Verify the given file hash with claims
     *
     * @param {string} fileHash
     * @param {string} decryptionKey
     *
     * @returns {Promise<FileVerification|null>}
     */
    async verify(fileHash, decryptionKey) {
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

        if (
            fileVerification !== null &&
            fileVerification.issuerAddress &&
            fileVerification.issuerVerified === false
        ) {
            console.log('Issuer not verified by claims, try to verify by legacy contract...')
            const verifiedIssuer = await this.certifactionEthClient.verifyIssuerByLegacyContract(fileVerification.issuerAddress)
            if (verifiedIssuer.issuerVerified === true) {
                fileVerification.issuerName = verifiedIssuer.issuerName
                fileVerification.issuerImg = verifiedIssuer.issuerImg
                fileVerification.issuerVerified = verifiedIssuer.issuerVerified

                fileVerification.events = fileVerification.events.map(event => {
                    return {
                        ...event,
                        issuer: verifiedIssuer.issuerName
                    }
                })
            }
        }

        return fileVerification
    }

    /**
     * Get the claims for the given claim events and file hash
     *
     * @param {Object[]} claimEvents Claim events from the blockchain
     * @param {string} fileHash
     *
     * @returns {Promise<Object[]>}
     */
    async getClaims(claimEvents, fileHash) {
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
            console.log(`Etherscan link to Tx: ${this.certifactionEthClient.ethScanUrl}/tx/${claimEvent.transactionHash}`)
            console.log(`File is associated with claim hash: ${claimHash}`)

            let claim = null
            try {
                claim = await this.getClaim(claimHash)
            } catch (e) {
                console.error(`Could not retrieve claim by hash, discarding. ${e.name} - ${e.message}`)
                continue
            }

            if (!claim) {
                console.warn('No claim found')
                continue
            }

            if (!this.verifyClaim(claim, claimHash, claimFileHash)) {
                console.error('The claim couldn\'t be verified, discarding.')
                continue
            }

            claims.push(claim)
        }

        return claims
    }

    /**
     * Get the claim from the Certifaction API for the given claim hash
     *
     * @param claimHash
     *
     * @returns {Promise<Object>}
     */
    async getClaim(claimHash) {
        try {
            const res = await axios.get(`${this.certifactionApiUrl}claim/${claimHash}`)
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
     * @param {Object} claim
     * @param {string} validClaimHash Only use the claim hash coming from the blockchain
     * @param {string} validFileHash Only use the file hash coming from the blockchain
     *
     * @returns {boolean}
     */
    verifyClaim(claim, validClaimHash, validFileHash) {
        // Verify if the claim hash matches the claim hash from the blockchain
        const claimHash = this.getClaimHash(claim)
        if (claimHash !== validClaimHash) {
            console.error(`The keccak256-hash from the claim (${claimHash}) doesn't match the valid claim hash (${validClaimHash}).`, claim)
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
     * @param {Object[]} claims
     * @param {string} decryptionKey Private key from the PDF file (if available)
     * @param {Object[]} claimEvents (optional) Claim events from the blockchain
     *
     * @returns {Promise<FileVerification|null>}
     */
    async resolveAndVerifyClaims(claims, decryptionKey, claimEvents) {
        const fileVerification = {
            issuerAddress: null,
            issuerName: null,
            issuerImg: null,
            issuerVerified: false,
            issuerVerifiedBy: null,
            issuerVerifiedImg: null,
            revoked: false,
            expiry: null,
            events: [],
            claims: []
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
                        console.log('It\'s an encrypted claim, trying to decrypt it...')
                        claim = await this.decryptClaim(claim, decryptionKey)
                        console.log('Decrypted claim:', claim)
                    } catch (e) {
                        console.error(`Error while decrypting encrypted claim, discarding. ${e.name} - ${e.message}`)
                        continue
                    }
                    break
            }

            fileVerification.claims.push(claim)

            // Get Issuer Hash from Address from Signature
            const issuerAddress = await this.verifySignatureAndGetPubkey(claim)
            console.log('Recovered Signer address:', issuerAddress)

            if (issuerAddress !== claim.proof.creator) {
                console.error('Signer Address does NOT match Claim Creator attribute, discarding.')
                continue
            }
            fileVerification.issuerAddress = issuerAddress
            console.log('Signer Address matches Claim Creator attribute')

            let issuerIdentity = null
            if (claim.idclaims instanceof Array) {
                issuerIdentity = await this.resolveAndVerifyIssuerIdentity(claim.idclaims, issuerAddress)
                if (issuerIdentity !== null) {
                    fileVerification.issuerName = issuerIdentity.issuer

                    if (issuerIdentity.identityVerifier !== null) {
                        fileVerification.issuerVerified = true

                        if (issuerIdentity.identityVerifier.name) {
                            fileVerification.issuerVerifiedBy = issuerIdentity.identityVerifier.name
                        }
                        if (issuerIdentity.identityVerifier.image) {
                            fileVerification.issuerVerifiedImg = issuerIdentity.identityVerifier.image
                        }
                    }
                }
            }

            const fileEvent = {
                ref: claim['@id'],
                scope: claim.scope,
                expiry: (claim.exp !== undefined && claim.exp.value !== 0) ? new Date(claim.exp.value) : null,
                issuerAddress
            }
            if (issuerIdentity) {
                fileEvent.issuer = issuerIdentity.issuer
                fileEvent.identityVerifier = issuerIdentity.identityVerifier
            }

            const claimEvent = (claimEvents) ? claimEvents.find(event => event.returnValues.hash === claimHash) : null
            let claimBlock = null
            if (claimEvent) {
                claimBlock = await this.certifactionEthClient.getBlock(claimEvent.blockHash)

                fileEvent.date = new Date(claimBlock.timestamp * 1000)
                fileEvent.smartContractAddress = claimEvent.address
                fileEvent.transactionHash = claimEvent.transactionHash
            }

            switch (claim.scope) {
                case 'register':
                case 'sign': // BP-2450: Handle "sign" claims like "register" claims for the moment
                case 'certify': // BP-2457: Verification Tool: Update the verification tool to accept "certify" claims as valid
                    console.log('It\'s a registration claim!')
                    fileVerification.expiry = fileEvent.expiry
                    // TODO(Cyrill): Remove when using only events
                    if (claimEvent) {
                        fileVerification.registrationEvent = claimEvent
                        fileVerification.registrationBlock = claimBlock
                    }
                    break

                case 'revoke':
                    console.log('It\'s a revocation claim')
                    fileVerification.revoked = true
                    // TODO(Cyrill): Remove when using only events
                    if (claimEvent) {
                        fileVerification.revocationEvent = claimEvent
                        fileVerification.revocationBlock = claimBlock
                    }
                    break
            }

            fileVerification.events.push(fileEvent)
        }

        if (fileVerification.events.length === 0) {
            return null
        }

        return fileVerification
    }

    /**
     * Calculate the hash for the given claim
     *
     * @param {Object} claim
     *
     * @returns {string} keccak256 hash
     */
    getClaimHash(claim) {
        const claimJsonString = JSON.stringify(claim)

        return EthCrypto.hash.keccak256(claimJsonString)
    }

    /**
     * Decrypt and verify the given claim
     *
     * @param {Object} encryptedClaim
     * @param {string} decryptionKey
     *
     * @returns {Promise<Object>}
     */
    async decryptClaim(encryptedClaim, decryptionKey) {
        switch (encryptedClaim['algorithm']) {
            case 'ECIES':
                const privateKey = Buffer.from(decryptionKey, 'hex')
                const decryptedClaimJson = await eciesDecrypt(privateKey, Buffer.from(encryptedClaim['claim'], 'base64'))
                const decryptedClaim = JSON.parse(decryptedClaimJson.toString())

                // Verify if the @id from the encrypted claim matches matches with the decrypted claim
                if (decryptedClaim['@id'].toLowerCase() !== encryptedClaim['@id'].toLowerCase()) {
                    throw new Error(`The @id from the decrypted claim (${decryptedClaim['@id']}) doesn't match with the encrypted claim (${encryptedClaim['@id']}).`)
                }

                return decryptedClaim

            default:
                throw new Error(`Algorithm not supported: ${encryptedClaim['algorithm']}`)
        }
    }

    /**
     * Finds the issuer in the given idClaims and verifies it
     *
     * @param idClaims
     * @param claimIssuerAddress
     *
     * @returns {Promise<IssuerIdentity|null>}
     */
    async resolveAndVerifyIssuerIdentity(idClaims, claimIssuerAddress) {
        let issuer = null
        let identityVerifier = null

        for (const idClaim of idClaims) {
            if (idClaim['@id'].toLowerCase() !== 'cert:addr:' + claimIssuerAddress.toLowerCase()) {
                console.error('Addresses NOT matching, IdClaim is NOT for this claim issuer.', idClaim['@id'], claimIssuerAddress)
                continue
            }

            const issuerAddress = await this.verifySignatureAndGetPubkey(idClaim)
            if (issuerAddress !== idClaim.proof.creator) {
                console.error('Signer Address does NOT match IdClaim Creator attribute, discarding.')
                continue
            }

            if (issuerAddress !== this.acceptedIssuerKey) {
                console.error('Signer address does NOT match the accepted issuer address, discarding.')
                continue
            }

            if (idClaim.name !== undefined) {
                issuer = idClaim.name
            }

            if (idClaim.verifiedBy !== undefined) {
                identityVerifier = { name: idClaim.verifiedBy }

                // TODO(Cyrill): Add verifier image
            }

            return { issuer, identityVerifier }
        }

        return null
    }

    /**
     * Verify signature and get public key from given claim
     *
     * @param {Object} claim
     *
     * @returns {string}
     */
    verifySignatureAndGetPubkey(claim) {
        console.log('Verifying Signature...')

        // Transform standard ECDSA signature's recovery id to Ethereum standard for verification
        const plainSignature = claim.proof.signatureValue.slice(0, 128)
        const recoveryId = claim.proof.signatureValue.slice(128, 130)
        const fixedRecoveryId = parseInt(recoveryId, 16) + 27
        const ethereuSignature = '0x' + plainSignature + (fixedRecoveryId.toString(16))
        console.log('Signature Value (Hex): ' + ethereuSignature)

        const unsignedClaim = JSON.parse(JSON.stringify(claim))
        delete unsignedClaim.proof.signatureValue
        if (unsignedClaim.idclaims !== undefined) {
            delete unsignedClaim.idclaims
        }

        const unsignedClaimHash = this.getClaimHash(unsignedClaim)
        console.log('Unsigned ClaimHash: ' + unsignedClaimHash)

        return EthCrypto.recover(ethereuSignature, unsignedClaimHash)
    }
}