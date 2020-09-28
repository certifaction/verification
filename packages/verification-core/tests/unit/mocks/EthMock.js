import { blockHash } from './hashes'

export default class EthMock {
    constructor(provider) {
        this.currentProvider = {
            host: provider
        }
    }

    getMockBlocks() {
        return [
            {
                number: 100,
                hash: blockHash,
                timestamp: new Date('2020-01-01 00:00:00').getTime() / 1000
            }
        ]
    }

    getBlock(blockHash) {
        const foundBlocks = this.getMockBlocks().filter(mockEvent => mockEvent.hash === blockHash)
        return (foundBlocks.length > 0) ? foundBlocks[0] : null
    }
}
