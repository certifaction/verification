import { hexToBytes, hexToUtf8 } from 'web3-utils'

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
     * @param {Object[]} fallbackLegacyContracts An array of web3.eth.Contract instances
     * @param {Object} claimContract Instance of web3.eth.Contract
     */
    constructor(eth, legacyContract, fallbackLegacyContracts, claimContract) {
        this.eth = eth
        this.legacyContract = legacyContract
        this.fallbackLegacyContracts = fallbackLegacyContracts
        this.claimContract = claimContract

        this.ethScanUrl = 'https://' + ((this.eth.currentProvider.host.indexOf('ropsten') >= 0) ? 'ropsten.etherscan.io' : 'etherscan.io')
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
                    issuerAddress,
                    issuer: issuerName,
                    identityVerifier: null,
                    smartContractAddress: registrationEvent.address,
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
                        issuerAddress,
                        issuer: issuerName,
                        identityVerifier: null,
                        smartContractAddress: revocationEvent.address,
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
     * Get the claim events for the given file hash
     *
     * @param {string} fileHash
     *
     * @returns {Promise<Object[]|null>}
     */
    async getClaimEvents(fileHash) {
        // Get Events for file hash
        const claimEvents = await this.claimContract.getPastEvents(
            'Claim', {
                filter: { file: fileHash },
                fromBlock: 0
            }
        )

        if (claimEvents.length === 0) {
            return null
        }

        return claimEvents
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
