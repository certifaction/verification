export function ecdsaToEth(signature) {
    const plainSignature = signature.slice(0, 128)
    const recoveryId = signature.slice(128, 130)
    const fixedRecoveryId = parseInt(recoveryId, 16) + 27

    return '0x' + plainSignature + (fixedRecoveryId.toString(16))
}

export function ethToEcdsa(signature) {
    const plainSignature = signature.slice(2, 130)
    const ethRecoveryId = signature.slice(130, 132)
    const ecdsaRecoverdyId = parseInt(ethRecoveryId, 16) - 27

    return plainSignature + '0' + ecdsaRecoverdyId
}
