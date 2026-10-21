import type { FileEvent } from '../verifier/CertifactionClaimVerifier.ts'

// Claims are anchored in batches, so events from the same batch share the same block timestamp.
export const isEventAfter = (a: FileEvent, b: FileEvent): boolean => {
    const chainA = a.on_blockchain
    const chainB = b.on_blockchain
    if (chainA?.log_index !== undefined && chainB?.log_index !== undefined) {
        if (chainA.block_number !== chainB.block_number) {
            return chainA.block_number > chainB.block_number
        }
        return chainA.log_index > chainB.log_index
    }

    return new Date(a.date) > new Date(b.date)
}
