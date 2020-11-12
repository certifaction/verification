/**
 * A file verification object from the smart contract
 *
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

import { hexToUtf8, hexToBytes } from 'web3-utils'
import EthCrypto from 'eth-crypto'
import axios from 'axios'

// Let's nullify all empty hex strings for beauty
const nullValue40 = '0x0000000000000000000000000000000000000000'
const nullValue64 = '0x0000000000000000000000000000000000000000000000000000000000000000'

export default class CertifactionEthClient {
    /**
     * Represents a Certifaction Ethereum smart contract client
     *
     * @constructor
     *
     * @param {Object} eth Instance of web3.eth
     * @param {Object} legacyContract Instance of web3.eth.Contract
     * @param {Object} claimContract Instance of web3.eth.Contract
     * @param {Object[]} fallbackLegacyContracts An array of web3.eth.Contract instances
     * @param {string} acceptedIssuerKey in HEX format (ex. 0x010...)
     * @param {string} certifactionApiUrl
     */
    constructor(eth, legacyContract, fallbackLegacyContracts, claimContract, acceptedIssuerKey, certifactionApiUrl) {
        this.eth = eth
        this.legacyContract = legacyContract
        this.fallbackLegacyContracts = fallbackLegacyContracts
        this.claimContract = claimContract
        this.acceptedIssuerKey = acceptedIssuerKey
        this.certifactionAPIUrl = certifactionApiUrl

        this.ethScanUrl = 'https://' + ((this.eth.currentProvider.host.indexOf('ropsten') >= 0) ? 'ropsten.etherscan.io' : 'etherscan.io')
    }

    /**
     * Verifies a file hash on the smart contract
     *
     * @param {string} fileHash
     *
     * @return {FileVerification|null}
     */
    async verifyFile(fileHash) {
        let fileVerification = await this.verifyFileByClaims(fileHash)

        if (
            fileVerification !== null &&
            fileVerification.issuerAddress &&
            fileVerification.issuerVerified === false
        ) {
            console.log('Issuer not verified by claims, try to verify by legacy contract...')
            const verifiedIssuer = await this.verifyIssuerByLegacyContract(fileVerification.issuerAddress)
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

        // If verifyFileByClaims doesn't return a result, try verifyFileByLegacyContract
        if (fileVerification === null) {
            console.log('No claims found, fallback to legacy contract based verification')
            fileVerification = await this.verifyFileByLegacyContract(fileHash)
        }

        return fileVerification
    }

    /**
     * Verifies a file hash on the legacy smart contract
     *
     * @param {string} fileHash
     *
     * @return {Promise<FileVerification|null>}
     */
    async verifyFileByLegacyContract(fileHash) {
        return new Promise((resolve, reject) => {
            this.legacyContract.methods.verifyFile(fileHash).call({}, async (error, result) => {
                if (error) {
                    return reject(error)
                }

                let {
                    issuer,
                    issuerName,
                    issuerImg,
                    issuerVerified,
                    revoked,
                    expiry
                } = result
                const issuerVerifiedBy = null
                const issuerVerifiedImg = null
                const events = []

                // Transform from hex representation
                const issuerAddress = issuer === nullValue40 ? null : issuer
                issuerName = issuerName === nullValue64 ? null : hexToUtf8(issuerName)
                issuerImg = issuerImg === nullValue64 ? null : hexToBytes(issuerImg)
                expiry = (expiry === '0') ? null : new Date(parseInt(expiry) * 1000)

                if (issuerAddress === null) {
                    return resolve(null)
                }

                // Get registration event and block
                const registrationEvent = await this.getRegistrationEvent(fileHash)
                const registrationBlock = (registrationEvent) ? await this.getBlock(registrationEvent.blockHash) : null

                events.push({
                    scope: 'register',
                    date: new Date(registrationBlock.timestamp * 1000),
                    issuer: issuerName,
                    identityVerifier: null,
                    transactionHash: registrationEvent.transactionHash
                })

                let revocationEvent = null
                let revocationBlock = null

                if (revoked === true) {
                    // Get revoked event and block
                    revocationEvent = await this.getRevocationEvent(fileHash)
                    revocationBlock = (revocationEvent) ? await this.getBlock(revocationEvent.blockHash) : null

                    events.push({
                        scope: 'revoke',
                        date: new Date(revocationBlock.timestamp * 1000),
                        issuer: issuerName,
                        identityVerifier: null,
                        transactionHash: revocationEvent.transactionHash
                    })
                }

                return resolve({
                    issuerAddress,
                    issuerName,
                    issuerImg,
                    issuerVerified,
                    issuerVerifiedBy,
                    issuerVerifiedImg,
                    revoked,
                    expiry,
                    registrationEvent,
                    registrationBlock,
                    revocationEvent,
                    revocationBlock,
                    events
                })
            })
        })
    }

    /**
     * Verifies a file hash by claims
     *
     * @param {string} fileHash
     *
     * @return {Promise<FileVerification|null>}
     */
    async verifyFileByClaims(fileHash) {
        return await this.resolveAndValidateFileClaim(fileHash)
    }

    /**
     * Verifies an issuer on the legacy smart contract
     *
     * @param {string} issuerAddress
     *
     * @returns {Promise<Object>}
     */
    async verifyIssuerByLegacyContract(issuerAddress) {
        return new Promise((resolve, reject) => {
            this.legacyContract.methods.verifyIssuer(issuerAddress).call({}, function(error, result) {
                if (error) {
                    return reject(error)
                }

                let {
                    issuerVerified,
                    issuerName,
                    issuerImg
                } = result

                // Transform from hex representation
                issuerName = issuerName === nullValue64 ? null : hexToUtf8(issuerName)
                issuerImg = issuerImg === nullValue64 ? null : hexToBytes(issuerImg)

                return resolve({ issuerName, issuerImg, issuerVerified })
            })
        })
    }

    /**
     * Resolve and validate the file claims for the given file hash
     *
     * @param {string} fileHash
     *
     * @returns {Promise<FileVerification|null>}
     */
    async resolveAndValidateFileClaim(fileHash) {
        // Get Events for Filehash
        const claimEvents = await this.claimContract.getPastEvents(
            'Claim', {
                filter: { file: fileHash },
                fromBlock: 0
            }
        )

        if (claimEvents.length === 0) {
            return null
        }

        let issuerAddress = null
        let issuerName = null
        const issuerImg = null
        let issuerVerified = false
        let issuerVerifiedBy = null
        let issuerVerifiedImg = null
        let revoked = false
        let expiry = null
        let registrationEvent = null
        let registrationBlock = null
        let revocationEvent = null
        let revocationBlock = null
        const events = []
        const claims = []

        console.log(claimEvents.length + ' event(s) found on Blockchain for File ' + fileHash)
        // For Each Event
        for (const claimEvent of claimEvents) {
            console.log('---------')

            // Get Claim Hash from Event
            const claimFileHash = claimEvent.returnValues.file
            const claimHash = claimEvent.returnValues.hash
            if (fileHash !== claimFileHash) {
                console.error('Hashes NOT matching, event is not for this File, discarding.')
                continue
            }

            console.log('Event is for File.')
            console.log('File event: ', claimEvent)
            console.log('Etherscan link to Tx: ' + this.ethScanUrl + '/tx/' + claimEvent.transactionHash)
            console.log('File is associated with Claim Hash: ' + claimHash)

            // Get Claim from endpoint for Claimhash
            let claim = null
            try {
                claim = await this.getRawClaim(claimHash)
            } catch (e) {
                console.error('Could not retrieve Claim by Hash, discarding.', e)
                continue
            }

            if (!claim) {
                console.warn('Claim not found')
                continue
            }

            claims.push(claim)

            if (!this.verifyRawClaim(claim, claimHash, claimFileHash)) {
                console.error('The raw claim couldn\'t be verified, discarding.')
                continue
            }

            // Get Issuer Hash from Address from Signature
            issuerAddress = await this.verifySignatureAndGetPubkey(claim)
            console.log('Recovered Signer address:', issuerAddress)

            if (issuerAddress !== claim.proof.creator) {
                console.error('Signer Address does NOT match Claim Creator attribute, discarding.')
                issuerAddress = null
                continue
            }
            console.log('Signer Address matches Claim Creator attribute')

            let issuerIdentity = null
            if (claim.idclaims !== undefined) {
                issuerIdentity = await this.resolveAndVerifyIssuerIdentity(claim.idclaims, issuerAddress)
                if (issuerIdentity !== null) {
                    issuerName = issuerIdentity.issuer

                    if (issuerIdentity.identityVerifier !== null) {
                        issuerVerified = true

                        if (issuerIdentity.identityVerifier.name) {
                            issuerVerifiedBy = issuerIdentity.identityVerifier.name
                        }
                        if (issuerIdentity.identityVerifier.image) {
                            issuerVerifiedImg = issuerIdentity.identityVerifier.image
                        }
                    }
                }
            }

            const claimBlock = await this.getBlock(claimEvent.blockHash)

            const fileEvent = {
                ref: claim['@id'],
                scope: claim.scope,
                date: new Date(claimBlock.timestamp * 1000),
                expiry: (claim.exp !== undefined && claim.exp.value !== 0) ? new Date(claim.exp.value) : null,
                issuer: (issuerIdentity) ? issuerIdentity.issuer : null,
                identityVerifier: (issuerIdentity) ? issuerIdentity.identityVerifier : null,
                transactionHash: claimEvent.transactionHash
            }

            switch (claim.scope) {
                case 'register':
                case 'sign': // BP-2450: Handle "sign" claims like "register" claims for the moment
                case 'certify': // BP-2457: Verification Tool: Update the verification tool to accept "certify" claims as valid
                    console.log('It\'s a registration claim!')
                    expiry = fileEvent.expiry
                    registrationEvent = claimEvent
                    registrationBlock = await this.getBlock(registrationEvent.blockHash)
                    break

                case 'revoke':
                    console.log('It\'s a revocation claim')
                    revoked = true
                    revocationEvent = claimEvent
                    revocationBlock = await this.getBlock(revocationEvent.blockHash)
                    break
            }

            events.push(fileEvent)
        }

        if (events.length === 0) {
            return null
        }

        const fileVerification = {
            issuerAddress,
            issuerName,
            issuerImg,
            issuerVerified,
            issuerVerifiedBy,
            issuerVerifiedImg,
            revoked,
            expiry,
            registrationEvent,
            registrationBlock,
            revocationEvent,
            revocationBlock,
            events,
            claims
        }

        console.log('Consolidated Verification Result for File ' + fileHash + ':')
        console.log(fileVerification)

        return fileVerification
    }

    async getRawClaim(claimHash) {
        try {
            const res = await axios.get(`${this.certifactionAPIUrl}claim/${claimHash}`)
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
     * Validates the given raw claim
     *
     * @param {Object} rawClaim
     * @param {string} validClaimHash Only use the claim hash coming from the blockchain
     * @param {string} validFileHash Only use the file hash coming from the blockchain
     *
     * @returns {boolean}
     */
    verifyRawClaim(rawClaim, validClaimHash, validFileHash) {
        const rawClaimJsonString = JSON.stringify(rawClaim)
        console.log('Raw Claim JSON: ' + rawClaimJsonString)

        // Verify if the raw claim hash matches the claim hash from the blockchain
        const rawClaimHash = EthCrypto.hash.keccak256(rawClaimJsonString)
        if (rawClaimHash !== validClaimHash) {
            console.error(`The keccak256-hash from the raw claim (${rawClaimHash}) doesn't match the valid claim hash (${validClaimHash}).`)
            return false
        }
        console.log('Claim hashes matching, claim is valid.')

        // Verify if the file hash from the raw claim matches the file hash from the blockchain
        if (rawClaim['@id'].toLowerCase() !== 'cert:hash:' + validFileHash.toLowerCase()) {
            console.error('Hashes NOT matching, Claim is NOT for this File.')
            return false
        }
        console.log('File hashes matching, Claim is for this File.')

        return true
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

        const unsignedClaimJsonString = JSON.stringify(unsignedClaim)
        console.log('Unsigned JSON Claim: ' + unsignedClaimJsonString)

        const unsignedClaimHash = EthCrypto.hash.keccak256(unsignedClaimJsonString)
        console.log('Unsigned ClaimHash: ' + unsignedClaimHash)

        return EthCrypto.recover(ethereuSignature, unsignedClaimHash)
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
     * Gets the past events from the legacy contract, also checks the fallback contracts
     *
     * @param {string} event
     * @param {Object} options (optional)
     *
     * @returns {Promise<Array>} events
     */
    async legacyContractGetPastEvents(event, options) {
        let events = await this.legacyContract.getPastEvents(event, options)
        if (events.length === 0) {
            console.log('No events found on legacy contract "' + this.legacyContract.options.address + '", checking fallback contracts...')
            let fallbackContractKey = 0
            while (this.fallbackLegacyContracts[fallbackContractKey] && events.length === 0) {
                events = await this.fallbackLegacyContracts[fallbackContractKey].getPastEvents(event, options)
                console.log('Found ' + events.length + ' events on fallback legacy contract "' + this.fallbackLegacyContracts[fallbackContractKey].options.address + '".')
                fallbackContractKey++
            }
        }

        return events
    }

    /**
     * Returns information about the transaction that registered the credential from the legacy contract
     *
     * @param {string} fileHash
     *
     * @return {Promise<Object|null>}
     */
    async getRegistrationEvent(fileHash) {
        const events = await this.legacyContractGetPastEvents(
            'FileRegisteredEvent', {
                filter: { hash: fileHash },
                fromBlock: 0
            }
        )

        return events[0] || null
    }

    /**
     * Returns information about the transaction that registered the credential from the legacy contract
     *
     * @param {string} fileHash
     *
     * @return {Promise<Object|null>}
     */
    async getRevocationEvent(fileHash) {
        const events = await this.legacyContractGetPastEvents(
            'FileRevokedEvent', {
                filter: { hash: fileHash },
                fromBlock: 0
            }
        )

        return events[0] || null
    }

    /**
     * Returns a block matching the block hash
     *
     * @param {string} blockHash
     *
     * @returns {Promise<Object>}
     */
    async getBlock(blockHash) {
        return await this.eth.getBlock(blockHash)
    }

    /**
     * Closes the Websocket connection of the current provider.
     * Does nothing for HttpProviders.
     */
    close() {
        return this.eth.currentProvider.connection.close()
    }
}
