import Interface from './Interface'
import LegacySmartContractABI from './eth/LegacySmartContract.abi'
import ClaimSmartContractABI from './eth/ClaimSmartContract.abi'
import CertifactionEthClient from './eth/CertifactionEthClient'
import VerifierInterface from './verifier/VerifierInterface'
import CertifactionEthVerifier from './verifier/CertifactionEthVerifier'
import hashingService from './hashing/hashing.service'
import VERIFICATION_TYPES from './verification-types'

function mapVerificationItemType(item) {
    if (item.issuerAddress === null) {
        return VERIFICATION_TYPES.V_NOT_FOUND
    }
    if (item.revoked === true) {
        return VERIFICATION_TYPES.V_REVOKED
    }
    if (item.issuerVerified === true) {
        return VERIFICATION_TYPES.V_VERIFIED
    }
    return VERIFICATION_TYPES.V_SELF_DECLARED
}

export {
    Interface,
    LegacySmartContractABI,
    ClaimSmartContractABI,
    CertifactionEthClient,
    VerifierInterface,
    CertifactionEthVerifier,
    hashingService,
    VERIFICATION_TYPES,
    mapVerificationItemType
}
