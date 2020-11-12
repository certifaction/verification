export const VERIFICATION_TYPES = {
    V_NOT_FOUND: 1,
    V_SELF_DECLARED: 2,
    V_VERIFIED: 3,
    V_REVOKED: 4
}

export function mapVerificationItemType(item) {
    if (item.revoked === true) {
        return VERIFICATION_TYPES.V_REVOKED
    }

    if (item.issuerVerified === true) {
        return VERIFICATION_TYPES.V_VERIFIED
    } else if (item.issuerVerified === false) {
        return VERIFICATION_TYPES.V_SELF_DECLARED
    }

    return VERIFICATION_TYPES.V_NOT_FOUND
}
