import type { FileEvent } from '../verifier/CertifactionClaimVerifier.ts'

const hasChainPosition = (event: FileEvent): boolean =>
    event.on_blockchain?.block_number !== undefined && event.on_blockchain?.log_index !== undefined

// Claims are anchored in batches, so events from the same batch share the same block timestamp.
export const isEventAfter = (a: FileEvent, b: FileEvent): boolean => {
    if (hasChainPosition(a) && hasChainPosition(b)) {
        const chainA = a.on_blockchain
        const chainB = b.on_blockchain
        if (chainA.block_number !== chainB.block_number) {
            return chainA.block_number > chainB.block_number
        }
        return chainA.log_index > chainB.log_index
    }

    return new Date(a.date) > new Date(b.date)
}
