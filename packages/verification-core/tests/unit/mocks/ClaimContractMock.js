import AbstractContractMock from './AbstractContractMock'
import { blockHash, claimHash, fileHashClaimRegisteredVerifiedIssuer, nullValue64, txHash } from './hashes'

export const mockRawClaimResponses = {
    [nullValue64]: {
        data: { message: 'entity not found' },
        status: 404
    },
    [claimHash]: {
        data: {
            '@context': 'https://schema.certifaction.io/claim/v1',
            '@id': 'cert:hash:' + claimHash,
            exp: { value: 0 },
            proof: {
                creator: '0xD5Eb698e839a4890Cb80FfD527ea813C7a7964B0',
                nonce: 'H2GHnhxVPYf73uDGZnXsMZgDSXMAV1RW',
                signatureValue: '89289aff0348d05d2dded4bbaf7afd573e2134a54ae7acd8b1b917349030d8731db96241ddb3530d3eee7697f05d4bc8e9e9b2f35716c60e9ab4c73cc95046f200',
                type: 'ECDSA'
            },
            scope: 'register'
        },
        status: 200
    }
}

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
                blockHash: blockHash,
                blockNumber: 100,
                // logIndex: 1,
                // removed: false,
                transactionHash: txHash,
                // transactionIndex: 1,
                // id: 'log_1e88b800',
                returnValues: {
                    file: fileHashClaimRegisteredVerifiedIssuer,
                    hash: claimHash
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
