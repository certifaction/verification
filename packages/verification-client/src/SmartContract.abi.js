/*
 * Copyright (c) 2020 Certifaction AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export default [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32'
      }
    ],
    name: 'FileRegisteredEvent',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32'
      }
    ],
    name: 'FileRevokedEvent',
    type: 'event'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_admin',
        type: 'address'
      }
    ],
    name: 'addAdmin',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_transactor',
        type: 'address'
      }
    ],
    name: 'addTransactor',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: '_name',
        type: 'bytes32'
      }
    ],
    name: 'addVerifiedIssuer',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'changeOwner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'eternalCertStorage',
    outputs: [
      {
        internalType: 'contract EternalCertStorageInterface',
        name: '',
        type: 'address'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32'
      },
      {
        internalType: 'uint256',
        name: '_expiry',
        type: 'uint256'
      }
    ],
    name: 'registerFile',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32'
      },
      {
        internalType: 'uint256',
        name: '_expiry',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: '_sign',
        type: 'bytes'
      }
    ],
    name: 'registerFileWithSignature',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_admin',
        type: 'address'
      }
    ],
    name: 'removeAdmin',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_transactor',
        type: 'address'
      }
    ],
    name: 'removeTransactor',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address'
      }
    ],
    name: 'removeVerifiedIssuer',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32'
      }
    ],
    name: 'revokeFile',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32'
      },
      {
        internalType: 'bytes',
        name: '_sign',
        type: 'bytes'
      }
    ],
    name: 'revokeFileWithSignature',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '_eternalCertStorage',
        type: 'address'
      }
    ],
    name: 'setEternalCertStorage',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32'
      }
    ],
    name: 'verifyFile',
    outputs: [
      {
        internalType: 'address',
        name: 'issuer',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256'
      },
      {
        internalType: 'bool',
        name: 'revoked',
        type: 'bool'
      },
      {
        internalType: 'bool',
        name: 'issuerVerified',
        type: 'bool'
      },
      {
        internalType: 'bytes32',
        name: 'issuerName',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 'issuerImg',
        type: 'bytes32'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: '_issuer',
        type: 'address'
      }
    ],
    name: 'verifyIssuer',
    outputs: [
      {
        internalType: 'bool',
        name: 'issuerVerified',
        type: 'bool'
      },
      {
        internalType: 'bytes32',
        name: 'issuerName',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32',
        name: 'issuerImg',
        type: 'bytes32'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
]
