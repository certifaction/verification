import { ecdsaToEth, ethToEcdsa } from '../../src/utils'

const signatureEcdsa = '942fb8fe72d94b480c77ff5dd479e46b9ee85d54e12e81858244c6eda3567ea4524f54ca15aff9857a99e000c9ffdf7daf2926bdf165cb30c990a4efa98603a401'
const signatureEth = '0x942fb8fe72d94b480c77ff5dd479e46b9ee85d54e12e81858244c6eda3567ea4524f54ca15aff9857a99e000c9ffdf7daf2926bdf165cb30c990a4efa98603a41c'

test('ecdsaToEth', () => {
    const signatureEthConverted = ecdsaToEth(signatureEcdsa)
    expect(signatureEthConverted).toMatch(signatureEth)

    const signatureEcdsaConverted = ethToEcdsa(signatureEthConverted)
    expect(signatureEcdsaConverted).toMatch(signatureEcdsa)
})

test('ethToEcdsa', () => {
    const signatureEcdsaConverted = ethToEcdsa(signatureEth)
    expect(signatureEcdsaConverted).toMatch(signatureEcdsa)

    const signatureEthConverted = ecdsaToEth(signatureEcdsaConverted)
    expect(signatureEthConverted).toMatch(signatureEth)
})
