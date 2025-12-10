import { Web3Eth } from 'web3-eth'
import { Contract } from 'web3-eth-contract'
import { LegacySmartContractABI } from '../eth/LegacySmartContract.abi.ts'
import { ClaimSmartContractABI } from '../eth/ClaimSmartContract.abi.ts'
import CertifactionEthClient from '../eth/CertifactionEthClient.ts'
import CertifactionClaimVerifier from './CertifactionClaimVerifier.ts'

export default class CertifactionEthVerifier {
    certifactionEthClient: CertifactionEthClient
    certifactionClaimVerifier: CertifactionClaimVerifier

    /**
     * Certifaction Ethereum Verifier
     *
     * @constructor
     *
     * @param providerUrl
     * @param legacyContractAddress contract address in HEX format (ex. 0x010...)
     * @param legacyContractFallbackAddresses
     * @param claimContractAddress claim contract address in HEX format (ex. 0x010...)
     * @param acceptedIssuerKey in HEX format (ex. 0x010...)
     * @param certifactionApiUrl
     */
    constructor(
        providerUrl: string = 'https://mainnet.infura.io/v3/4559d381898847c0b13ced86a45a4ec0',
        legacyContractAddress: string = '0xdc1d2c136cad73e10ae367d075995185edd68cae',
        legacyContractFallbackAddresses: string[] = [
            '0xf73e27c5008ff487803d2337fc3ac4016f6526e4',
            '0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244',
        ],
        claimContractAddress: string = '0x5532ba4add77dd25fa11acc5a84e5f183f57525e',
        acceptedIssuerKey: string = '0x3f647d9f6a22768EA9c91C299d0AD5924c6164Be',
        certifactionApiUrl: string = 'https://api.certifaction.io',
    ) {
        const eth = new Web3Eth(providerUrl)
        const legacyContract = new Contract(LegacySmartContractABI, legacyContractAddress, eth)
        const fallbackLegacyContracts = legacyContractFallbackAddresses.map(
            (legacyContractFallbackAddress) => new Contract(LegacySmartContractABI, legacyContractFallbackAddress, eth),
        )
        const claimContract = new Contract(ClaimSmartContractABI, claimContractAddress, eth)

        this.certifactionEthClient = new CertifactionEthClient(
            eth,
            legacyContract,
            fallbackLegacyContracts,
            claimContract,
        )
        this.certifactionClaimVerifier = new CertifactionClaimVerifier(
            acceptedIssuerKey,
            this.certifactionEthClient,
            certifactionApiUrl,
        )
    }

    /**
     * Verify the given file hash using claims and legacy contract
     */
    async verify(fileHash: string, decryptionKey: string): Promise<object> {
        let verification = {
            hash: fileHash,
        }

        try {
            console.log('Verifying with claims...')
            let fileVerification = await this.certifactionClaimVerifier.verify(fileHash, decryptionKey)

            if (fileVerification === null) {
                // If the claim verifier doesn't return a result, try verifying by legacy contracts
                console.log('No claims found, fallback to legacy contract based verification')
                console.log('Verifying with legacy contract...')
                fileVerification = await this.certifactionEthClient.verifyFileByLegacyContract(fileHash)
            }

            if (fileVerification && fileVerification.events.length > 0) {
                verification.on_blockchain = true
            }

            verification = { ...verification, ...fileVerification }

            console.log(`Consolidated verification result for file ${fileHash}:`, verification)
        } catch (e) {
            console.error(`Error while verifying file hash "${fileHash}": ${e.name} - ${e.message}`, e)
            verification.error = e
        }

        return verification
    }
}
