/**
 * A file verification object from the smart contract
 *
 * @typedef {Object} FileVerification
 *
 * @property {string} issuerAddress
 * @property {string} issuerName
 * @property {string} issuerImg
 * @property {boolean} issuerVerified
 * @property {boolean} revoked
 * @property {number} expiry
 * @property {Object} registrationEvent
 * @property {Object} registrationBlock
 * @property {Object} revocationEvent
 * @property {Object} revocationBlock
 */

import { hexToBytes, hexToUtf8 } from 'web3-utils'
import axios from 'axios'
import { ecdsaToEth } from '../utils'
import { hash, recover } from 'eth-crypto'

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
     * @return {FileVerification}
     */
    async verifyFile(fileHash) {
        let fileVerification = await this.verifyFileByClaims(fileHash)

        // If claim-based (verifyFileClaimBased) returns results, use validated infos
        if (fileVerification.issuerAddress === undefined) {
            // If not, try verifyFileContractBased instead and use those infos
            console.log('No claims found, fallback to contract based verification')
            fileVerification = await this.verifyFileByLegacyContract(fileHash)
        }

        if (fileVerification.issuerVerified === undefined && fileVerification.issuerAddress !== undefined) {
            console.log('Issuer not verified by claims, try to verify by contract...')
            const verifiedIssuer = await this.verifyIssuerByLegacyContract(fileVerification.issuerAddress)
            if (verifiedIssuer.issuerVerified === true) {
                fileVerification.issuerName = verifiedIssuer.issuerName
                fileVerification.issuerImg = verifiedIssuer.issuerImg
                fileVerification.issuerVerified = verifiedIssuer.issuerVerified
            }
        }

        return fileVerification
    }

    /**
     * Verifies a file hash on the legacy smart contract
     *
     * @param {string} fileHash
     *
     * @return {Promise<FileVerification>}
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
                let registrationEvent = null
                let registrationBlock = null
                let revocationEvent = null
                let revocationBlock = null

                // Transform from hex representation
                const issuerAddress = issuer === nullValue40 ? null : issuer
                issuerName = issuerName === nullValue40 ? null : hexToUtf8(issuerName)
                issuerImg = issuerImg === nullValue64 ? null : hexToBytes(issuerImg)
                expiry = expiry._hex === '0x00' ? null : expiry._hex

                if (issuerAddress !== null) {
                    // Get registration event and block
                    registrationEvent = await this.getRegistrationEvent(fileHash)
                    registrationBlock = (registrationEvent) ? await this.getBlock(registrationEvent.blockHash) : null
                    console.log('registrationBlock', registrationBlock)

                    if (revoked === true) {
                        // Get revoked event and block
                        revocationEvent = await this.getRevocationEvent(fileHash)
                        revocationBlock = (revocationEvent) ? await this.getBlock(revocationEvent.blockHash) : null
                    }
                }

                resolve({
                    issuerAddress,
                    issuerName,
                    issuerImg,
                    issuerVerified,
                    revoked,
                    expiry,
                    registrationEvent,
                    registrationBlock,
                    revocationEvent,
                    revocationBlock
                })
            })
        })
    }

    /**
     * Verifies a file hash by claims
     *
     * @param {string} fileHash
     *
     * @return {Promise<FileVerification>}
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
                issuerName = issuerName === nullValue40 ? null : hexToUtf8(issuerName)
                issuerImg = issuerImg === nullValue64 ? null : hexToBytes(issuerImg)

                resolve({ issuerName, issuerImg, issuerVerified })
            })
        })
    }

    /**
     * Resolve and validate the file claims for the given file hash
     *
     * @param {string} fileHash
     *
     * @returns {Promise<FileVerification>}
     */
    async resolveAndValidateFileClaim(fileHash) {
        // Get Events for Filehash
        const fileEvents = await this.claimContract.getPastEvents(
            'Claim', {
                filter: { file: fileHash },
                fromBlock: 0
            }
        )

        let registered = false
        let revoked = false
        let expiry
        let issuerAddress = null
        let issuerName
        let issuerVerified
        let issuerImg
        let registrationEvent = null
        let registrationBlock = null
        let revocationEvent = null
        let revocationBlock = null

        console.log(fileEvents.length + ' event(s) found on Blockchain for File ' + fileHash)
        // For Each Event
        for (const fileEvent of fileEvents) {
            console.log('---------')

            // Get Claim Hash from Event
            const claimFileHash = fileEvent.returnValues.file
            const claimHash = fileEvent.returnValues.hash
            if (fileHash !== claimFileHash) {
                console.error('Hashes NOT matching, event is not for this File, discarding.')
                continue
            }

            console.log('Event is for File.')
            console.log('File event: ', fileEvent)
            console.log('Etherscan link to Tx: ' + this.ethScanUrl + '/tx/' + fileEvent.transactionHash)
            console.log('File is associated with Claim Hash: ' + claimHash)

            // Get Claim from endpoint for Claimhash
            let claim
            try {
                claim = await this.getRawClaim(claimHash)
            } catch (e) {
                console.error('Could not retrieve Claim by Hash, discarding.', e)
                continue
            }
            const claimString = JSON.stringify(claim)
            console.log('Raw JSON Claim: ' + claimString)

            if (!claim) {
                console.warn('Claim not found')
                continue
            }

            // Verify Claim (hashes to claimhash, belongs to file, Has right content/type)
            if (claim['@id'] !== 'cert:hash:' + claimFileHash) {
                console.error('Hashes NOT matching, Claim is NOT for this File, discarding.')
                continue
            }
            console.log('Hashes matching, Claim is for this File.')

            // Get Issuer Hash from Address from Signature
            issuerAddress = await this.verifySignatureAndGetPubkey(claim)
            console.log('Recovered Signer address:', issuerAddress)

            if (issuerAddress !== claim.proof.creator) {
                console.error('Signer Address does NOT match Claim Creator attribute, discarding.')
                issuerAddress = null
                continue
            }
            console.log('Signer Address matches Claim Creator attribute')

            // Identity claims not implemented yet
            // issuerName = await this.resolveAndVerifyIssuerIdentity(issuerAddress)
            // if (issuerName !== undefined) {
            //     issuerVerified = true
            // }

            switch (claim.scope) {
                case 'register':
                    console.log('It\'s a registration claim!')
                    registered = true
                    registrationEvent = fileEvent
                    registrationBlock = await this.getBlock(registrationEvent.blockHash)
                    break

                case 'revoke':
                    console.log('It\'s a revocation claim')
                    revoked = true
                    revocationEvent = fileEvent
                    revocationBlock = await this.getBlock(revocationEvent.blockHash)
                    break

                default:
                    console.error('Is an unknown claim type, discarding.')
                    break
            }
        }

        console.log('Consolidated Verification Result for File ' + fileHash + ':')
        console.log('IssuerAddress: ' + issuerAddress +
            '\nIssuerName: ' + issuerName +
            '\nIssuerVerified: ' + issuerVerified +
            '\nRegistered: ' + registered +
            '\nExpiry: ' + expiry +
            '\nRevoked: ' + revoked)

        return {
            issuerAddress,
            issuerName,
            issuerImg,
            issuerVerified,
            revoked,
            expiry,
            registrationEvent,
            registrationBlock,
            revocationEvent,
            revocationBlock
        }
    }

    // Identity claims not implemented yet, implementation will probably be different
    // async resolveAndVerifyIssuerIdentity(fileHash) {
    //     // Get Events for Filehash
    //     const identityEvents = await this.claimContract.getPastEvents(
    //         'Claim', {
    //             filter: { file: fileHash },
    //             fromBlock: 0
    //         }
    //     )
    //
    //     for (const identityEvent of identityEvents) {
    //         // Get Claim Hash from Event
    //         const identityHash = identityEvent.returnValues.file
    //         const claimHash = identityEvent.returnValues.hash
    //         console.log(identityHash + ' >> ' + claimHash)
    //
    //         // Get Claim from endpoint for claimhash
    //         const claim = this.getRawClaim(claimHash)
    //
    //         // Verify Claim (hashes to claimhash, belongs to file, Has right content/type)
    //         if (claim.id === 'cert:addr:0x' + identityHash) {
    //             // Get Issuer Hash from Address from Signature
    //             const issuerHash = this.verifySignatureAndGetPubkey(claim)
    //
    //             // Only Certifaction is allowed to issue ID claims
    //             if (issuerHash === this.acceptedIssuerKey) {
    //                 return claim.name
    //             }
    //         }
    //     }
    // }

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
     * Verify signature and get public key from given claim
     *
     * @param {Object} claim
     *
     * @returns {string}
     */
    verifySignatureAndGetPubkey(claim) {
        console.log('Verifying Signature...')

        // Transform standard ECDSA signature's recovery id to Ethereum standard for verification
        const ethereumSignature = ecdsaToEth(claim.proof.signatureValue)
        console.log('Signature Value (Hex): ' + ethereumSignature)

        delete claim.proof.signatureValue
        const JSONstring = JSON.stringify(claim)
        console.log('Unsigned JSON Claim: ' + JSONstring)

        const unsignedClaimHash = hash.keccak256(JSONstring)
        console.log('Unsigned ClaimHash: ' + unsignedClaimHash)

        return recover(ethereumSignature, unsignedClaimHash)
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
        console.log('Searching for registration events...')
        const events = await this.legacyContractGetPastEvents(
            'FileRegisteredEvent', {
                filter: { hash: fileHash },
                fromBlock: 0
            }
        )
        console.log('CertifactionEthClient:getRegistrationEvent()', events)

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
        console.log('Searching for revocation events...')
        const events = await this.legacyContractGetPastEvents(
            'FileRevokedEvent', {
                filter: { hash: fileHash },
                fromBlock: 0
            }
        )
        console.log('CertifactionEthClient:getRevocationEvent()', events)

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
        return this.eth.getBlock(blockHash)
    }

    /**
     * Closes the Websocket connection of the current provider.
     * Does nothing for HttpProviders.
     */
    close() {
        return this.eth.currentProvider.connection.close()
    }
}
