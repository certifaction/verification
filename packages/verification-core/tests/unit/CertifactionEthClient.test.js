import axios from 'axios'
import LegacySmartContractABI from '../../src/eth/LegacySmartContract.abi'
import ClaimSmartContractABI from '../../src/eth/ClaimSmartContract.abi'
import CertifactionEthClient from '../../src/eth/CertifactionEthClient'
import EthMock from './mocks/EthMock'
import LegacyContractMock from './mocks/LegacyContractMock'
import ClaimContractMock from './mocks/ClaimContractMock'
import {
    blockHash,
    contractAddressLegacy,
    contractAddressLegacyFallback1,
    contractAddressLegacyFallback2,
    fileHashLegacyFallback1Registered,
    fileHashLegacyFallback1Revoked,
    fileHashLegacyFallback2Registered,
    fileHashLegacyFallback2Revoked,
    fileHashLegacyRegisteredUnverifiedIssuer,
    fileHashLegacyRegisteredVerifiedIssuer,
    fileHashLegacyRevokedUnverifiedIssuer,
    fileHashLegacyRevokedVerifiedIssuer,
    issuerAddressUnverified,
    issuerAddressVerified,
    nullValue64,
    txHash
} from './mocks/hashes'

jest.mock('axios')

const eth = new EthMock('https://ropsten.infura.io/v3/4876e0df8d31475799c8239ba2538c4c')
const legacyContract = new LegacyContractMock(LegacySmartContractABI, contractAddressLegacy)
const fallbackLegacyContracts = [contractAddressLegacyFallback1, contractAddressLegacyFallback2].map(
    legacyContractFallbackAddress => new LegacyContractMock(LegacySmartContractABI, legacyContractFallbackAddress)
)
const claimContract = new ClaimContractMock(ClaimSmartContractABI)

const certifactionEthClient = new CertifactionEthClient(
    eth,
    legacyContract,
    fallbackLegacyContracts,
    claimContract,
    '0xD354996e15E436c7c032A7be2d6218c38afEAc1a',
    'https://api.dev.testnet.certifaction.io/'
)

describe('CertifactionEthClient::getRegistrationEvent()', () => {
    test('no registration event', async () => {
        const registrationEvent = await certifactionEthClient.getRegistrationEvent(nullValue64)

        expect(registrationEvent).toBeNull()
    })

    test('existing registration event (legacy)', async () => {
        const registrationEvent = await certifactionEthClient.getRegistrationEvent(fileHashLegacyRegisteredVerifiedIssuer)

        expect(registrationEvent).toBeInstanceOf(Object)
        expect(registrationEvent.blockHash).toMatch(blockHash)
        expect(registrationEvent.transactionHash).toMatch(txHash)
    })

    test('existing registration event (legacy fallback 1)', async () => {
        const registrationEvent = await certifactionEthClient.getRegistrationEvent(fileHashLegacyFallback1Registered)

        expect(registrationEvent).toBeInstanceOf(Object)
        expect(registrationEvent.blockHash).toMatch(blockHash)
        expect(registrationEvent.transactionHash).toMatch(txHash)
    })

    test('existing registration event (legacy fallback 2)', async () => {
        const registrationEvent = await certifactionEthClient.getRegistrationEvent(fileHashLegacyFallback2Registered)

        expect(registrationEvent).toBeInstanceOf(Object)
        expect(registrationEvent.blockHash).toMatch(blockHash)
        expect(registrationEvent.transactionHash).toMatch(txHash)
    })
})

describe('CertifactionEthClient::getRevocationEvent()', () => {
    test('no revocation event', async () => {
        const revocationEvent = await certifactionEthClient.getRevocationEvent(nullValue64)

        expect(revocationEvent).toBeNull()
    })

    test('existing revocation event (legacy)', async () => {
        const revocationEvent = await certifactionEthClient.getRevocationEvent(fileHashLegacyRevokedVerifiedIssuer)

        expect(revocationEvent).toBeInstanceOf(Object)
        expect(revocationEvent.blockHash).toMatch(blockHash)
        expect(revocationEvent.transactionHash).toMatch(txHash)
    })

    test('existing revocation event (legacy fallback 1)', async () => {
        const revocationEvent = await certifactionEthClient.getRevocationEvent(fileHashLegacyFallback1Revoked)

        expect(revocationEvent).toBeInstanceOf(Object)
        expect(revocationEvent.blockHash).toMatch(blockHash)
        expect(revocationEvent.transactionHash).toMatch(txHash)
    })

    test('existing revocation event (legacy fallback 2)', async () => {
        const revocationEvent = await certifactionEthClient.getRevocationEvent(fileHashLegacyFallback2Revoked)

        expect(revocationEvent).toBeInstanceOf(Object)
        expect(revocationEvent.blockHash).toMatch(blockHash)
        expect(revocationEvent.transactionHash).toMatch(txHash)
    })
})

describe('CertifactionEthClient::getBlock()', () => {
    test('no block', async () => {
        const block = await certifactionEthClient.getBlock(nullValue64)

        expect(block).toBeNull()
    })

    test('existing block', async () => {
        const block = await certifactionEthClient.getBlock(blockHash)

        expect(block).toBeInstanceOf(Object)
        expect(block.number).toEqual(100)
        expect(block.timestamp).toEqual(1577833200)
    })
})

describe('CertifactionEthClient::verifyIssuerByLegacyContract()', () => {
    test('verified issuer', async () => {
        const issuer = await certifactionEthClient.verifyIssuerByLegacyContract(issuerAddressVerified)

        expect(issuer.issuerVerified).toBeTruthy()
        expect(issuer.issuerName).toMatch('Verified Issuer')
    })

    test('unverified issuer', async () => {
        const issuer = await certifactionEthClient.verifyIssuerByLegacyContract(issuerAddressUnverified)

        expect(issuer.issuerVerified).toBeFalsy()
        expect(issuer.issuerName).toMatch('Unverified Issuer')
    })
})

describe('CertifactionEthClient::verifyFileByLegacyContract()', () => {
    test('unregistered file', async () => {
        const verifiedFile = await certifactionEthClient.verifyFileByLegacyContract(nullValue64)

        expect(verifiedFile.issuerAddress).toBeNull()
        expect(verifiedFile.revoked).toBeFalsy()
        expect(verifiedFile.issuerVerified).toBeFalsy()
        expect(verifiedFile.issuerName).toMatch('')
        expect(verifiedFile.registrationEvent).toBeNull()
        expect(verifiedFile.registrationBlock).toBeNull()
        expect(verifiedFile.revocationEvent).toBeNull()
        expect(verifiedFile.revocationBlock).toBeNull()
    })

    test('registered file - verified issuer', async () => {
        const verifiedFile = await certifactionEthClient.verifyFileByLegacyContract(fileHashLegacyRegisteredVerifiedIssuer)

        expect(verifiedFile.issuerAddress).toMatch(issuerAddressVerified)
        expect(verifiedFile.revoked).toBeFalsy()
        expect(verifiedFile.issuerVerified).toBeTruthy()
        expect(verifiedFile.issuerName).toMatch('Verified Issuer')
        expect(verifiedFile.registrationEvent).toBeInstanceOf(Object)
        expect(verifiedFile.registrationEvent.transactionHash).toMatch(txHash)
        expect(verifiedFile.registrationBlock).toBeInstanceOf(Object)
        expect(verifiedFile.registrationBlock.timestamp).toEqual(1577833200)
        expect(verifiedFile.revocationEvent).toBeNull()
        expect(verifiedFile.revocationBlock).toBeNull()
    })

    test('registered file - unverified issuer', async () => {
        const verifiedFile = await certifactionEthClient.verifyFileByLegacyContract(fileHashLegacyRegisteredUnverifiedIssuer)

        expect(verifiedFile.issuerAddress).toMatch(issuerAddressUnverified)
        expect(verifiedFile.revoked).toBeFalsy()
        expect(verifiedFile.issuerVerified).toBeFalsy()
        expect(verifiedFile.issuerName).toMatch('Unverified Issuer')
        expect(verifiedFile.registrationEvent).toBeInstanceOf(Object)
        expect(verifiedFile.registrationEvent.transactionHash).toMatch(txHash)
        expect(verifiedFile.registrationBlock).toBeInstanceOf(Object)
        expect(verifiedFile.registrationBlock.timestamp).toEqual(1577833200)
        expect(verifiedFile.revocationEvent).toBeNull()
        expect(verifiedFile.revocationBlock).toBeNull()
    })

    test('revoked file - verified issuer', async () => {
        const verifiedFile = await certifactionEthClient.verifyFileByLegacyContract(fileHashLegacyRevokedVerifiedIssuer)

        expect(verifiedFile.issuerAddress).toMatch(issuerAddressVerified)
        expect(verifiedFile.revoked).toBeTruthy()
        expect(verifiedFile.issuerVerified).toBeTruthy()
        expect(verifiedFile.issuerName).toMatch('Verified Issuer')
        expect(verifiedFile.registrationEvent).toBeInstanceOf(Object)
        expect(verifiedFile.registrationEvent.transactionHash).toMatch(txHash)
        expect(verifiedFile.registrationBlock).toBeInstanceOf(Object)
        expect(verifiedFile.registrationBlock.timestamp).toEqual(1577833200)
        expect(verifiedFile.revocationEvent).toBeInstanceOf(Object)
        expect(verifiedFile.revocationEvent.transactionHash).toMatch(txHash)
        expect(verifiedFile.revocationBlock).toBeInstanceOf(Object)
        expect(verifiedFile.revocationBlock.timestamp).toEqual(1577833200)
    })

    test('revoked file - unverified issuer', async () => {
        const verifiedFile = await certifactionEthClient.verifyFileByLegacyContract(fileHashLegacyRevokedUnverifiedIssuer)

        expect(verifiedFile.issuerAddress).toMatch(issuerAddressUnverified)
        expect(verifiedFile.revoked).toBeTruthy()
        expect(verifiedFile.issuerVerified).toBeFalsy()
        expect(verifiedFile.issuerName).toMatch('Unverified Issuer')
        expect(verifiedFile.registrationEvent).toBeInstanceOf(Object)
        expect(verifiedFile.registrationEvent.transactionHash).toMatch(txHash)
        expect(verifiedFile.registrationBlock).toBeInstanceOf(Object)
        expect(verifiedFile.registrationBlock.timestamp).toEqual(1577833200)
        expect(verifiedFile.revocationEvent).toBeInstanceOf(Object)
        expect(verifiedFile.revocationEvent.transactionHash).toMatch(txHash)
        expect(verifiedFile.revocationBlock).toBeInstanceOf(Object)
        expect(verifiedFile.revocationBlock.timestamp).toEqual(1577833200)
    })
})

// describe('CertifactionEthClient::getRawClaim()', () => {
//     test('unavailable claim', async () => {
//         const claimHash = createHexValue(1, 64)
//
//         axios.get.mockRejectedValueOnce({ response: mockRawClaimResponses[claimHash] })
//
//         const rawClaim = await certifactionEthClient.getRawClaim(claimHash)
//
//         expect(rawClaim).toBeNull()
//     })
//
//     test('available claim', async () => {
//         const claimHash = createHexValue(2, 64)
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
//         const claimHash = createHexValue(2, 64)
//         axios.get.mockResolvedValueOnce(mockRawClaimResponses[claimHash])
//         const rawClaim = await certifactionEthClient.getRawClaim(claimHash)
//     })
// })

// describe('CertifactionEthClient::resolveAndValidateFileClaim()', () => {
//     test('unregistered file', async () => {
//         const claimHash = createHexValue(1, 64)
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
//         const claimHash = createHexValue(2, 64)
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
