import { type Web3Eth } from 'web3-eth'
import { type Contract } from 'web3-eth-contract'
import { hexToBytes, hexToUtf8 } from 'web3-utils'
import { type FileVerification } from '../verifier/CertifactionClaimVerifier.ts'
import { type LegacySmartContractABI } from './LegacySmartContract.abi.ts'
import { type ClaimSmartContractABI } from './ClaimSmartContract.abi.ts'

// Let's nullify all empty hex strings for beauty
const nullValue40 = '0x0000000000000000000000000000000000000000'
const nullValue64 = '0x0000000000000000000000000000000000000000000000000000000000000000'

export default class CertifactionEthClient {
    eth: Web3Eth
    legacyContract: Contract<typeof LegacySmartContractABI>
    fallbackLegacyContracts: Contract<typeof LegacySmartContractABI>[]
    claimContract: Contract<typeof ClaimSmartContractABI>
    ethScanUrl: string

    /**
     * Represents a Certifaction Ethereum smart contract client
     *
     * @constructor
     */
    constructor(
        eth: Web3Eth,
        legacyContract: Contract<typeof LegacySmartContractABI>,
        fallbackLegacyContracts: Contract<typeof LegacySmartContractABI>[],
        claimContract: Contract<typeof ClaimSmartContractABI>,
    ) {
        this.eth = eth
        this.legacyContract = legacyContract
        this.fallbackLegacyContracts = fallbackLegacyContracts
        this.claimContract = claimContract

        let ethScanUrlPrefix = ''
        if (this.eth.currentProvider.clientUrl.indexOf('goerli') >= 0) {
            ethScanUrlPrefix = 'goerli.'
        }
        this.ethScanUrl = `https://${ethScanUrlPrefix}etherscan.io`
    }

    /**
     * Verifies a file hash on the legacy smart contract
     */
    async verifyFileByLegacyContract(fileHash: string): Promise<FileVerification | null> {
        const result = await this.legacyContract.methods.verifyFile(fileHash).call()

        let { issuer, issuerName, issuerImg, issuerVerified, revoked, expiry } = result
        const issuerVerifiedBy = null
        const issuerVerifiedImg = null
        const events = []

        // Transform from hex representation
        const issuerAddress = issuer === nullValue40 ? null : issuer
        issuerName = issuerName === nullValue64 ? null : hexToUtf8(issuerName)
        issuerImg = issuerImg === nullValue64 ? null : hexToBytes(issuerImg)
        expiry = expiry > 0 ? new Date(Number(expiry) * 1000) : null

        if (issuerAddress === null) {
            return null
        }

        // Get registration event and block
        const registrationEvent = await this.getRegistrationEvent(fileHash)
        const registrationBlock = registrationEvent ? await this.getBlock(registrationEvent.blockHash) : null

        if (registrationBlock === null) {
            return null
        }

        events.push({
            scope: 'register',
            date: new Date(Number(registrationBlock.timestamp) * 1000).toISOString(),
            issuer: {
                id: issuerAddress,
                name: issuerName,
            },
            on_blockchain: {
                type: 'ethereum',
                contract_address: registrationEvent.address,
                tx_hash: registrationEvent.transactionHash,
            },
        })

        let revocationEvent = null
        let revocationBlock = null

        if (revoked === true) {
            // Get revoked event and block
            revocationEvent = await this.getRevocationEvent(fileHash)
            revocationBlock = revocationEvent ? await this.getBlock(revocationEvent.blockHash) : null

            const event = {
                scope: 'revoke',
                issuer: {
                    id: issuerAddress,
                    name: issuerName,
                },
            }

            if (revocationBlock !== null) {
                event.date = new Date(Number(revocationBlock.timestamp) * 1000).toISOString()
                event.on_blockchain = {
                    type: 'ethereum',
                    contract_address: revocationEvent.address,
                    tx_hash: revocationEvent.transactionHash,
                }
            } else {
                // Really old documents don't have a revocation event
                event.date = '-'
                event.on_blockchain = {
                    tx_hash: '-',
                }
            }

            events.push(event)
        }

        return {
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
        }
    }

    /**
     * Verifies an issuer on the legacy smart contract
     */
    async verifyIssuerByLegacyContract(issuerAddress: string): Promise<object> {
        const result = await this.legacyContract.methods.verifyIssuer(issuerAddress).call()

        let { issuerVerified, issuerName, issuerImg } = result

        // Transform from hex representation
        issuerName = issuerName === nullValue64 ? null : hexToUtf8(issuerName)
        issuerImg = issuerImg === nullValue64 ? null : hexToBytes(issuerImg)

        return { issuerName, issuerImg, issuerVerified }
    }

    /**
     * Get the claim events for the given file hash
     */
    async getClaimEvents(fileHash: string): Promise<object[] | null> {
        // Get Events for file hash
        const claimEvents = await this.claimContract.getPastEvents('Claim', {
            filter: { file: fileHash },
            fromBlock: 0,
        })

        if (claimEvents.length === 0) {
            return null
        }

        return claimEvents
    }

    /**
     * Gets the past events from the legacy contract, also checks the fallback contracts
     *
     * @returns events
     */
    async legacyContractGetPastEvents(event: string, options?: object): Promise<object[]> {
        let events = await this.legacyContract.getPastEvents(event, options)
        if (events.length === 0) {
            console.log(
                `No events found on legacy contract "${this.legacyContract.options.address}", checking fallback contracts...`,
            )
            let fallbackContractKey = 0
            while (this.fallbackLegacyContracts[fallbackContractKey] && events.length === 0) {
                events = await this.fallbackLegacyContracts[fallbackContractKey].getPastEvents(event, options)
                console.log(
                    `Found ${events.length} events on fallback legacy contract "${this.fallbackLegacyContracts[fallbackContractKey].options.address}".`,
                )
                fallbackContractKey++
            }
        }

        return events
    }

    /**
     * Returns information about the transaction that registered the credential from the legacy contract
     */
    async getRegistrationEvent(fileHash: string): Promise<object | null> {
        const events = await this.legacyContractGetPastEvents('FileRegisteredEvent', {
            filter: { hash: fileHash },
            fromBlock: 0,
        })

        return events[0] || null
    }

    /**
     * Returns information about the transaction that registered the credential from the legacy contract
     */
    async getRevocationEvent(fileHash: string): Promise<object | null> {
        const events = await this.legacyContractGetPastEvents('FileRevokedEvent', {
            filter: { hash: fileHash },
            fromBlock: 0,
        })

        return events[0] || null
    }

    /**
     * Returns a block matching the block hash
     */
    async getBlock(blockHash: string): Promise<object> {
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
