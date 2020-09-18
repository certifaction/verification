import axios from 'axios'
import LegacySmartContractABI from '../../src/eth/LegacySmartContract.abi'
import ClaimSmartContractABI from '../../src/eth/ClaimSmartContract.abi'
import CertifactionEthClient from '../../src/eth/CertifactionEthClient'
import EthMock from './mocks/EthMock'
import LegacyContractMock from './mocks/LegacyContractMock'
import ClaimContractMock from './mocks/ClaimContractMock'

jest.mock('axios')

const eth = new EthMock('https://ropsten.infura.io/v3/4876e0df8d31475799c8239ba2538c4c')
const legacyContract = new LegacyContractMock(LegacySmartContractABI)
const claimContract = new ClaimContractMock(ClaimSmartContractABI)

const certifactionEthClient = new CertifactionEthClient(
    eth,
    legacyContract,
    claimContract,
    '0xD354996e15E436c7c032A7be2d6218c38afEAc1a',
    'https://api.dev.testnet.certifaction.io/'
)

const mockRawClaimResponses = {
    [claimContract.createHexValue(1, 64)]: {
        data: { message: 'entity not found' },
        status: 404
    },
    [claimContract.createHexValue(2, 64)]: {
        data: {
            '@context': 'https://schema.certifaction.io/claim/v1',
            '@id': 'cert:hash:' + claimContract.createHexValue(2, 64),
            exp: { value: 0 },
            proof: {
                creator: '0xD5Eb698e839a4890Cb80FfD527ea813C7a7964B0',
                nonce: 'H2GHnhxVPYf73uDGZnXsMZgDSXMAV1RW',
                signatureValue: '89289aff0348d05d2dded4bbaf7afd573e2134a54ae7acd8b1b917349030d8731db96241ddb3530d3eee7697f05d4bc8e9e9b2f35716c60e9ab4c73cc95046f200',
                type: 'ECDSA'
            },
            scope: 'register'
        },
        status: 200
    }
}

// describe('CertifactionEthClient::verifyFileByLegacyContract()', () => {
//     test('unregistered file', async () => {
//         const verifiedFile = await certifactionEthClient.verifyFileContractBased(contract.createHexValue(1, 64))
//
//         expect(verifiedFile.issuerAddress).toBeNull()
//         expect(verifiedFile.revoked).toBeFalsy()
//         expect(verifiedFile.issuerVerified).toBeFalsy()
//         expect(verifiedFile.issuerName).toMatch('')
//     })
//
//     test('registered file - verified issuer', async () => {
//         const verifiedFile = await certifactionEthClient.verifyFileContractBased(contract.createHexValue(2, 64))
//
//         expect(verifiedFile.issuerAddress).toMatch(contract.createHexValue(1, 40))
//         expect(verifiedFile.revoked).toBeFalsy()
//         expect(verifiedFile.issuerVerified).toBeTruthy()
//         expect(verifiedFile.issuerName).toMatch('Verified Issuer')
//     })
//
//     test('registered file - unverified issuer', async () => {
//         const verifiedFile = await certifactionEthClient.verifyFileContractBased(contract.createHexValue(3, 64))
//
//         expect(verifiedFile.issuerAddress).toMatch(contract.createHexValue(2, 40))
//         expect(verifiedFile.revoked).toBeFalsy()
//         expect(verifiedFile.issuerVerified).toBeFalsy()
//         expect(verifiedFile.issuerName).toMatch('Unverified Issuer')
//     })
//
//     test('revoked file - verified issuer', async () => {
//         const verifiedFile = await certifactionEthClient.verifyFileContractBased(contract.createHexValue(4, 64))
//
//         expect(verifiedFile.issuerAddress).toMatch(contract.createHexValue(1, 40))
//         expect(verifiedFile.revoked).toBeTruthy()
//         expect(verifiedFile.issuerVerified).toBeTruthy()
//         expect(verifiedFile.issuerName).toMatch('Verified Issuer')
//     })
//
//     test('revoked file - unverified issuer', async () => {
//         const verifiedFile = await certifactionEthClient.verifyFileContractBased(contract.createHexValue(5, 64))
//
//         expect(verifiedFile.issuerAddress).toMatch(contract.createHexValue(2, 40))
//         expect(verifiedFile.revoked).toBeTruthy()
//         expect(verifiedFile.issuerVerified).toBeFalsy()
//         expect(verifiedFile.issuerName).toMatch('Unverified Issuer')
//     })
// })

// describe('CertifactionEthClient::verifyIssuerByLegacyContract()', () => {
//     test('verified issuer', async () => {
//         const verifiedIssuer = await certifactionEthClient.verifyIssuerByContract(contract.createHexValue(1, 40))
//
//         expect(verifiedIssuer.issuerVerified).toBeTruthy()
//         expect(verifiedIssuer.issuerName).toMatch('Verified Issuer')
//     })
//
//     test('unverified issuer', async () => {
//         const verifiedIssuer = await certifactionEthClient.verifyIssuerByContract(contract.createHexValue(2, 40))
//
//         expect(verifiedIssuer.issuerVerified).toBeFalsy()
//         expect(verifiedIssuer.issuerName).toMatch('Unverified Issuer')
//     })
// })

// describe('CertifactionEthClient::getRawClaim()', () => {
//     test('unavailable claim', async () => {
//         const claimHash = claimContract.createHexValue(1, 64)
//
//         axios.get.mockRejectedValueOnce({ response: mockRawClaimResponses[claimHash] })
//
//         const rawClaim = await certifactionEthClient.getRawClaim(claimHash)
//
//         expect(rawClaim).toBeNull()
//     })
//
//     test('available claim', async () => {
//         const claimHash = claimContract.createHexValue(2, 64)
//
//         axios.get.mockResolvedValueOnce(mockRawClaimResponses[claimHash])
//
//         const rawClaim = await certifactionEthClient.getRawClaim(claimHash)
//
//         expect(rawClaim['@id']).toMatch('cert:hash:' + claimHash)
//     })
// })

// describe('CertifactionEthClient::verifySignatureAndGetPubkey()', () => {
//     test('verified signature', async () => {
//         const claimHash = claimContract.createHexValue(2, 64)
//         axios.get.mockResolvedValueOnce(mockRawClaimResponses[claimHash])
//         const rawClaim = await certifactionEthClient.getRawClaim(claimHash)
//     })
// })

// describe('CertifactionEthClient::resolveAndValidateFileClaim()', () => {
//     test('unregistered file', async () => {
//         const claimHash = claimContract.createHexValue(1, 64)
//
//         const verifiedFile = await certifactionEthClient.resolveAndValidateFileClaim(claimHash)
//
//         expect(verifiedFile.issuerAddress).toBeUndefined()
//         expect(verifiedFile.revoked).toBeFalsy()
//         expect(verifiedFile.issuerVerified).toBeUndefined()
//         expect(verifiedFile.issuerName).toBeUndefined()
//     })
//
//     test('registered file - verified issuer', async () => {
//         const claimHash = claimContract.createHexValue(2, 64)
//
//         axios.get.mockResolvedValueOnce(mockRawClaimResponses[claimHash])
//
//         const verifiedFile = await certifactionEthClient.resolveAndValidateFileClaim(claimHash)
//         console.log(verifiedFile)
//
//         // expect(verifiedFile.issuerAddress).toMatch(contract.createHexValue(1, 40))
//         // expect(verifiedFile.revoked).toBeFalsy()
//         // expect(verifiedFile.issuerVerified).toBeTruthy()
//         // expect(verifiedFile.issuerName).toMatch('Verified Issuer')
//     })
// })
