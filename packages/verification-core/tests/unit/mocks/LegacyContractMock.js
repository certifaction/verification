import { utf8ToHex } from 'web3-utils'
import {
    blockHash,
    contractAddressLegacy,
    contractAddressLegacyFallback1,
    contractAddressLegacyFallback2,
    fileHashLegacyFallback1Registered,
    fileHashLegacyFallback1Revoked,
    fileHashLegacyFallback2Registered,
    fileHashLegacyFallback2Revoked,
    fileHashLegacyRegisteredUnverifiedIssuer,
    fileHashLegacyRegisteredVerifiedIssuer,
    fileHashLegacyRevokedUnverifiedIssuer,
    fileHashLegacyRevokedVerifiedIssuer,
    issuerUnverifiedIdentity,
    issuerVerifiedIdentity,
    nullValue40,
    nullValue64,
    txHash
} from './hashes'
import AbstractContractMock from './AbstractContractMock'

export default class LegacyContractMock extends AbstractContractMock {
    getMockResults() {
        return {
            verifyIssuer: {
                [issuerVerifiedIdentity.address]: {
                    issuerVerified: true,
                    issuerName: utf8ToHex('Verified Issuer'),
                    issuerImg: nullValue64
                },
                [issuerUnverifiedIdentity.address]: {
                    issuerVerified: false,
                    issuerName: utf8ToHex('Unverified Issuer'),
                    issuerImg: nullValue64
                }
            },
            verifyFile: {
                // Unregistered file
                [nullValue64]: {
                    issuer: nullValue40,
                    issuerVerified: false,
                    issuerName: nullValue64,
                    issuerImg: nullValue64,
                    revoked: false,
                    expiry: '0'
                },
                // Registered file - verified issuer
                [fileHashLegacyRegisteredVerifiedIssuer]: {
                    issuer: issuerVerifiedIdentity.address,
                    issuerVerified: true,
                    issuerName: utf8ToHex('Verified Issuer'),
                    issuerImg: nullValue64,
                    revoked: false,
                    expiry: '0'
                },
                // Registered file - unverified issuer
                [fileHashLegacyRegisteredUnverifiedIssuer]: {
                    issuer: issuerUnverifiedIdentity.address,
                    issuerVerified: false,
                    issuerName: utf8ToHex('Unverified Issuer'),
                    issuerImg: nullValue64,
                    revoked: false,
                    expiry: '0'
                },
                // Revoked file - verified issuer
                [fileHashLegacyRevokedVerifiedIssuer]: {
                    issuer: issuerVerifiedIdentity.address,
                    issuerVerified: true,
                    issuerName: utf8ToHex('Verified Issuer'),
                    issuerImg: nullValue64,
                    revoked: true,
                    expiry: '0'
                },
                // Revoked file - unverified issuer
                [fileHashLegacyRevokedUnverifiedIssuer]: {
                    issuer: issuerUnverifiedIdentity.address,
                    issuerVerified: false,
                    issuerName: utf8ToHex('Unverified Issuer'),
                    issuerImg: nullValue64,
                    revoked: true,
                    expiry: '0'
                }
            }
        }
    }

    getMockResultFilterMethods() {
        return {
            verifyIssuer: function(args) {
                return this.results[args[0]]
            },
            verifyFile: function(args) {
                return this.results[args[0]]
            }
        }
    }

    getMockEvents() {
        return {
            [contractAddressLegacy]: [
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyRegisteredVerifiedIssuer
                    },
                    event: 'FileRegisteredEvent'
                },
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyRegisteredUnverifiedIssuer
                    },
                    event: 'FileRegisteredEvent'
                },
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyRevokedVerifiedIssuer
                    },
                    event: 'FileRegisteredEvent'
                },
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyRevokedVerifiedIssuer
                    },
                    event: 'FileRevokedEvent'
                },
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyRevokedUnverifiedIssuer
                    },
                    event: 'FileRegisteredEvent'
                },
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyRevokedUnverifiedIssuer
                    },
                    event: 'FileRevokedEvent'
                }
            ],
            [contractAddressLegacyFallback1]: [
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyFallback1Registered
                    },
                    event: 'FileRegisteredEvent'
                },
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyFallback1Revoked
                    },
                    event: 'FileRevokedEvent'
                }
            ],
            [contractAddressLegacyFallback2]: [
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyFallback2Registered
                    },
                    event: 'FileRegisteredEvent'
                },
                {
                    blockHash: blockHash,
                    blockNumber: 100,
                    transactionHash: txHash,
                    returnValues: {
                        hash: fileHashLegacyFallback2Revoked
                    },
                    event: 'FileRevokedEvent'
                }
            ]
        }
    }
}
