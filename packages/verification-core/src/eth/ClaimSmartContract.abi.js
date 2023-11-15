export default [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'file',
                type: 'bytes32',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'hash',
                type: 'bytes32',
            },
        ],
        name: 'Claim',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'bytes32[]',
                name: 'files',
                type: 'bytes32[]',
            },
            {
                internalType: 'bytes32[]',
                name: 'hashes',
                type: 'bytes32[]',
            },
        ],
        name: 'registerClaim',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]
