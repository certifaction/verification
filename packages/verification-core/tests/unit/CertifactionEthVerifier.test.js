import CertifactionEthVerifier from '../../src/verifier/CertifactionEthVerifier'

const certifactionEthVerifier = new CertifactionEthVerifier()

const unverifiableHash = '0x1111111111111111111111111111111111111111111111111111111111111111'
const verifiableHashLegecyContract201912 = '0xbc7a5e289e182932832d35bffa77927628522451bb7c4db099aeb5058cf1e3d0'
const verifiableHashLegacyContract202005 = '0x6ef64114243aff7f4a11c7c909582ad9d548049f30bb5b153cb299370b0f656f'
const verifiableHashClaim = '0xc0d46254f2e97f2b1dc3c8ae792a839bcc93e1e8b1529532b90eecf623c0f2c8'

describe('Integration tests: CertifactionEthVerifier.verify()', () => {
    test('unverifiable hash', async () => {
        const verification = await certifactionEthVerifier.verify(unverifiableHash)

        expect(verification.hash).toMatch(unverifiableHash)
        expect(verification.on_blockchain).toBeFalsy()
        expect(verification.issuerAddress).toBeNull()
    })

    test('verifiable hash from December 2019 (legacy contract)', async () => {
        const verification = await certifactionEthVerifier.verify(verifiableHashLegecyContract201912)

        expect(verification.hash).toMatch(verifiableHashLegecyContract201912)
        expect(verification.on_blockchain).toBeTruthy()
        expect(verification.revoked).toBeFalsy()
        expect(verification.issuerAddress).toMatch('0xD5Eb698e839a4890Cb80FfD527ea813C7a7964B0')
        expect(verification.issuerVerified).toBeTruthy()
        expect(verification.registrationEvent).toBeInstanceOf(Object)
        expect(verification.registrationEvent.transactionHash).toMatch('0x34527c091a0af292da38f5fc24855efcc6c4d57bbbb21138e5462429eab3cd7f')
        expect(verification.registrationBlock).toBeInstanceOf(Object)
        expect(verification.registrationBlock.timestamp).toBe(1576769918)
    })

    test('verifiable hash from May 2020 (legacy contract)', async () => {
        const verification = await certifactionEthVerifier.verify(verifiableHashLegacyContract202005)

        expect(verification.hash).toMatch(verifiableHashLegacyContract202005)
        expect(verification.on_blockchain).toBeTruthy()
        expect(verification.revoked).toBeFalsy()
        expect(verification.issuerAddress).toMatch('0xD5Eb698e839a4890Cb80FfD527ea813C7a7964B0')
        expect(verification.issuerVerified).toBeTruthy()
        expect(verification.registrationEvent).toBeInstanceOf(Object)
        expect(verification.registrationEvent.transactionHash).toMatch('0xc84b2134a39007781fa20424b54040585226dacf55a2f22ad4fd533d9f3b1aae')
        expect(verification.registrationBlock).toBeInstanceOf(Object)
        expect(verification.registrationBlock.timestamp).toBe(1590137985)
    })

    test('verifiable hash (claim)', async () => {
        const verification = await certifactionEthVerifier.verify(verifiableHashClaim)

        expect(verification.hash).toMatch(verifiableHashClaim)
        expect(verification.on_blockchain).toBeTruthy()
        expect(verification.revoked).toBeFalsy()
        expect(verification.issuerAddress).toMatch('0xD5Eb698e839a4890Cb80FfD527ea813C7a7964B0')
        expect(verification.issuerVerified).toBeTruthy()
        expect(verification.registrationEvent).toBeInstanceOf(Object)
        expect(verification.registrationEvent.transactionHash).toMatch('0xb57b1fface58b7d224b230daeaf09216faab9a9ef91b1180f914f68238616241')
        expect(verification.registrationBlock).toBeInstanceOf(Object)
        expect(verification.registrationBlock.timestamp).toBe(1599507881)
    })
})
