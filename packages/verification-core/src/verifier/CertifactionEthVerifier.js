import Eth from 'web3-eth'
import PdfService from '../pdf/PdfService'
import LegacySmartContractABI from '../eth/LegacySmartContract.abi'
import ClaimSmartContractABI from '../eth/ClaimSmartContract.abi'
import CertifactionEthClient from '../eth/CertifactionEthClient'
import hashingService from '../hashing/hashing.service'

export default class CertifactionEthVerifier {
    /**
     * Certifaction Ethereum Verifier
     *
     * @constructor
     *
     * @param {string} pdfWasmUrl URL to the PDF WebAssembly file
     * @param {boolean} enableClaims
     * @param {string} providerUrl
     * @param {string} legacyContractAddress contract address in HEX format (ex. 0x010...)
     * @param {string[]} legacyContractFallbackAddresses
     * @param {string} claimContractAddress claim contract address in HEX format (ex. 0x010...)
     * @param {string} acceptedIssuerKey in HEX format (ex. 0x010...)
     * @param {string} certifactionApiUrl
     */
    constructor(
        pdfWasmUrl,
        enableClaims = true,
        providerUrl = 'https://mainnet.infura.io/v3/4876e0df8d31475799c8239ba2538c4c',
        legacyContractAddress = '0xdc1d2c136cad73e10ae367d075995185edd68cae',
        legacyContractFallbackAddresses = ['0xf73e27c5008ff487803d2337fc3ac4016f6526e4', '0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244'],
        claimContractAddress = '0x5532ba4add77dd25fa11acc5a84e5f183f57525e',
        acceptedIssuerKey = '0x3f647d9f6a22768EA9c91C299d0AD5924c6164Be',
        certifactionApiUrl = 'https://api.certifaction.io/'
    ) {
        this.pdfService = new PdfService(pdfWasmUrl)

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

    readPdfBytes(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => {
                resolve(new Uint8Array(reader.result))
            }

            reader.onerror = (error) => {
                reject(error)
            }

            reader.readAsArrayBuffer(file)
        })
    }

    async verify(fileHash) {
        const pdfBytes = await this.readPdfBytes(file)
        const encryptionKeys = await this.pdfService.extractEncryptionKeys(pdfBytes)
        console.log('CertifactionEthVerifier::verify()', encryptionKeys)

        let verification = {
            hash: fileHash
        }

        try {
            let fileVerification

            if (this.enableClaims) {
                console.log('Verifying with claim method...')
                fileVerification = await this.certifactionEthClient.verifyFile(fileHash, encryptionKeys.privateKey)
            } else {
                console.log('Verifying with contract method...')
                fileVerification = await this.certifactionEthClient.verifyFileByLegacyContract(fileHash)
            }

            if (fileVerification && fileVerification.events.length > 0) {
                verification.onBlockchain = true
            }

            verification = { ...verification, ...fileVerification }
        } catch (e) {
            console.log(`Error while verifying fileHash "${fileHash}":`, e)
            verification.error = e
        }

        return verification
    }
}
