import { hash, sign } from 'eth-crypto'
import { ethToEcdsa } from '../../../src/utils'
import {
    fileHashClaimRegisteredUnverifiedIssuer,
    fileHashClaimRegisteredVerifiedIssuer,
    fileHashClaimRevokedUnverifiedIssuer,
    fileHashClaimRevokedVerifiedIssuer,
    issuerUnverifiedIdentity,
    issuerVerifiedIdentity,
    nullValue64
} from './hashes'

export function signClaim(claim, issuerIdentity) {
    const hashedClaim = hash.keccak256(JSON.stringify(claim))
    const signature = sign(issuerIdentity.privateKey, hashedClaim)

    const responseClaim = JSON.parse(JSON.stringify(claim))
    responseClaim.proof.signatureValue = ethToEcdsa(signature)

    return responseClaim
}

export const claimRegisterUnsigned = {
    '@context': 'https://schema.certifaction.io/claim/v1',
    '@id': 'cert:hash:' + nullValue64,
    exp: { value: 0 },
    proof: {
        creator: issuerUnverifiedIdentity.address,
        signatureValue: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    },
    scope: 'register'
}
export const claimRegisterVerifiedIssuer = {
    '@context': 'https://schema.certifaction.io/claim/v1',
    '@id': 'cert:hash:' + fileHashClaimRegisteredVerifiedIssuer,
    exp: { value: 0 },
    proof: {
        creator: issuerVerifiedIdentity.address
    },
    scope: 'register'
}
export const claimRegisterUnverifiedIssuer = {
    '@context': 'https://schema.certifaction.io/claim/v1',
    '@id': 'cert:hash:' + fileHashClaimRegisteredUnverifiedIssuer,
    exp: { value: 0 },
    proof: {
        creator: issuerUnverifiedIdentity.address
    },
    scope: 'register'
}
export const claimRegisterRevokedFileVerifiedIssuer = {
    '@context': 'https://schema.certifaction.io/claim/v1',
    '@id': 'cert:hash:' + fileHashClaimRevokedVerifiedIssuer,
    exp: { value: 0 },
    proof: {
        creator: issuerVerifiedIdentity.address
    },
    scope: 'register'
}
export const claimRevokeVerifiedIssuer = {
    '@context': 'https://schema.certifaction.io/claim/v1',
    '@id': 'cert:hash:' + fileHashClaimRevokedVerifiedIssuer,
    exp: { value: 0 },
    proof: {
        creator: issuerVerifiedIdentity.address
    },
    scope: 'revoke'
}
export const claimRegisterRevokedFileUnverifiedIssuer = {
    '@context': 'https://schema.certifaction.io/claim/v1',
    '@id': 'cert:hash:' + fileHashClaimRevokedUnverifiedIssuer,
    exp: { value: 0 },
    proof: {
        creator: issuerUnverifiedIdentity.address
    },
    scope: 'register'
}
export const claimRevokeUnverifiedIssuer = {
    '@context': 'https://schema.certifaction.io/claim/v1',
    '@id': 'cert:hash:' + fileHashClaimRevokedUnverifiedIssuer,
    exp: { value: 0 },
    proof: {
        creator: issuerUnverifiedIdentity.address
    },
    scope: 'revoke'
}

export function getClaimHash(claim) {
    return hash.keccak256(JSON.stringify(claim))
}

export function mockRawClaimResponse(claimHash) {
    const responses = {
        [nullValue64]: {
            data: { message: 'entity not found' },
            status: 404
        },
        [getClaimHash(claimRegisterUnsigned)]: {
            data: JSON.parse(JSON.stringify(claimRegisterUnsigned)),
            status: 200
        },
        [getClaimHash(claimRegisterVerifiedIssuer)]: {
            data: signClaim(claimRegisterVerifiedIssuer, issuerVerifiedIdentity),
            status: 200
        },
        [getClaimHash(claimRegisterUnverifiedIssuer)]: {
            data: signClaim(claimRegisterUnverifiedIssuer, issuerUnverifiedIdentity),
            status: 200
        },
        [getClaimHash(claimRegisterRevokedFileVerifiedIssuer)]: {
            data: signClaim(claimRegisterRevokedFileVerifiedIssuer, issuerVerifiedIdentity),
            status: 200
        },
        [getClaimHash(claimRevokeVerifiedIssuer)]: {
            data: signClaim(claimRevokeVerifiedIssuer, issuerVerifiedIdentity),
            status: 200
        },
        [getClaimHash(claimRegisterRevokedFileUnverifiedIssuer)]: {
            data: signClaim(claimRegisterRevokedFileUnverifiedIssuer, issuerUnverifiedIdentity),
            status: 200
        },
        [getClaimHash(claimRevokeUnverifiedIssuer)]: {
            data: signClaim(claimRevokeUnverifiedIssuer, issuerUnverifiedIdentity),
            status: 200
        }
    }

    return responses[claimHash]
}
