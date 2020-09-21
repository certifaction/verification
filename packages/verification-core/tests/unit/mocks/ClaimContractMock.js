import AbstractContractMock from './AbstractContractMock'

export default class ClaimContractMock extends AbstractContractMock {
    getMockResults() {
        return {}
    }

    getMockResultFilterMethods() {
        return {}
    }

    getMockEvents() {
        return [
            {
                // address: '0x5532ba4aDd77dD25FA11acc5a84e5f183f57525e',
                blockHash: this.createHexValue(2, 64),
                blockNumber: 100,
                // logIndex: 1,
                // removed: false,
                transactionHash: this.createHexValue(2, 64),
                // transactionIndex: 1,
                // id: 'log_1e88b800',
                returnValues: {
                    file: this.createHexValue(2, 64),
                    hash: this.createHexValue(2, 64)
                },
                event: 'Claim'
                // signature: '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                // raw: {
                //     data: '0xb4905b8dc7ef8af8a88b434a2c9113dd00c02f4c6407340accb1fe3b585bb6d7',
                //     topics: [
                //         '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                //         '0xc0d46254f2e97f2b1dc3c8ae792a839bcc93e1e8b1529532b90eecf623c0f2c8'
                //     ]
                // }
            }
        ]
    }
}
