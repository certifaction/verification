import Interface from './Interface'
import LegacySmartContractABI from './eth/LegacySmartContract.abi'
import ClaimSmartContractABI from './eth/ClaimSmartContract.abi'
import CertifactionEthClient from './eth/CertifactionEthClient'
import VerifierInterface from './verifier/VerifierInterface'
import CertifactionEthVerifier from './verifier/CertifactionEthVerifier'
import hashingService from './hashing/hashing.service'
import { mapVerificationItemType, VERIFICATION_TYPES } from './verification-types'

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
