import { createIdentity } from 'eth-crypto'
import { createHexValue } from './utils'

export const nullValue40 = createHexValue(0, 40)
export const nullValue64 = createHexValue(0, 64)

export const issuerVerifiedIdentity = createIdentity()
export const issuerUnverifiedIdentity = createIdentity()

export const contractAddressLegacy = createHexValue(10, 40)
export const contractAddressLegacyFallback1 = createHexValue(11, 40)
export const contractAddressLegacyFallback2 = createHexValue(12, 40)
export const contractAddressClaim = createHexValue(20, 40)

export const blockHash = createHexValue(100, 64)

export const txHash = createHexValue(200, 64)

export const fileHashLegacyRegisteredVerifiedIssuer = createHexValue(300, 64)
export const fileHashLegacyRevokedVerifiedIssuer = createHexValue(301, 64)
export const fileHashLegacyRegisteredUnverifiedIssuer = createHexValue(302, 64)
export const fileHashLegacyRevokedUnverifiedIssuer = createHexValue(303, 64)
export const fileHashLegacyFallback1Registered = createHexValue(310, 64)
export const fileHashLegacyFallback1Revoked = createHexValue(311, 64)
export const fileHashLegacyFallback2Registered = createHexValue(320, 64)
export const fileHashLegacyFallback2Revoked = createHexValue(321, 64)

export const fileHashClaimRegisteredVerifiedIssuer = createHexValue(330, 64)
export const fileHashClaimRevokedVerifiedIssuer = createHexValue(331, 64)
export const fileHashClaimRegisteredUnverifiedIssuer = createHexValue(332, 64)
export const fileHashClaimRevokedUnverifiedIssuer = createHexValue(333, 64)
