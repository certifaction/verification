import { numberToHex, padLeft } from 'web3-utils'

export function createHexValue(number, characterAmount) {
    return padLeft(numberToHex(number), characterAmount)
}
