import Eth from 'web3-eth'
import LegacySmartContractABI from '../eth/LegacySmartContract.abi'
import ClaimSmartContractABI from '../eth/ClaimSmartContract.abi'
import CertifactionEthClient from '../eth/CertifactionEthClient'

export default class CertifactionEthVerifier {
    /**
     * Certifaction Ethereum Verifier
     *
     * @constructor
     *
     * @param {boolean} enableClaims
     * @param {string} providerUrl
     * @param {string} legacyContractAddress contract address in HEX format (ex. 0x010...)
     * @param {string[]} legacyContractFallbackAddresses
     * @param {string} claimContractAddress claim contract address in HEX format (ex. 0x010...)
     * @param {string} acceptedIssuerKey in HEX format (ex. 0x010...)
     * @param {string} certifactionApiUrl
     */
    constructor(
        enableClaims = true,
        providerUrl = 'https://mainnet.infura.io/v3/4876e0df8d31475799c8239ba2538c4c',
        legacyContractAddress = '0xdc1d2c136cad73e10ae367d075995185edd68cae',
        legacyContractFallbackAddresses = ['0xf73e27c5008ff487803d2337fc3ac4016f6526e4', '0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244'],
        claimContractAddress = '0x5532ba4add77dd25fa11acc5a84e5f183f57525e',
        acceptedIssuerKey = '0x3b031733e215e4edf7565e11f2aba907a826aadc',
        certifactionApiUrl = 'https://api.certifaction.io/'
    ) {
        this.enableClaims = (enableClaims !== false)
        if (this.enableClaims) {
            console.log('Certifaction ETH verifier instanciated to use claims.')
        }

        const eth = new Eth(providerUrl)
        const legacyContract = new eth.Contract(LegacySmartContractABI, legacyContractAddress)
        const fallbackLegacyContracts = legacyContractFallbackAddresses.map(
            legacyContractFallbackAddress => new eth.Contract(LegacySmartContractABI, legacyContractFallbackAddress)
        )
        const claimContract = new eth.Contract(ClaimSmartContractABI, claimContractAddress)

        this.certifactionEthClient = new CertifactionEthClient(
            eth,
            legacyContract,
            fallbackLegacyContracts,
            claimContract,
            acceptedIssuerKey,
            certifactionApiUrl
        )
    }

    async verify(fileHash) {
        let verification

        try {
            if (this.enableClaims) {
                console.log('Verifying with claim method...')
                verification = await this.certifactionEthClient.verifyFile(fileHash)
            } else {
                console.log('Verifying with contract method...')
                verification = await this.certifactionEthClient.verifyFileByLegacyContract(fileHash)
            }
        } catch (error) {
            console.log(`Error while verifying fileHash "${fileHash}":`, error)
            verification = null
        }

        const verificationItem = {
            hash: fileHash,
            ...verification
        }

        if (verification !== null && verification.issuerAddress !== null) {
            verificationItem.onBlockchain = true
        }

        return verificationItem
    }
}
