import { utf8ToHex } from 'web3-utils'
import AbstractContractMock from './AbstractContractMock'

export default class LegacyContractMock extends AbstractContractMock {
    getMockResults() {
        return {
            verifyFile: {
                // Unregistered file
                [this.createHexValue(1, 64)]: {
                    issuerAddress: this.createHexValue(0, 40),
                    issuerVerified: false,
                    issuerName: this.createHexValue(0, 64),
                    issuerImg: this.createHexValue(0, 64),
                    revoked: false,
                    expiry: '0'
                },
                // Registered file - verified issuer
                [this.createHexValue(2, 64)]: {
                    issuerAddress: this.createHexValue(1, 40),
                    issuerVerified: true,
                    issuerName: utf8ToHex('Verified Issuer'),
                    issuerImg: this.createHexValue(0, 64),
                    revoked: false,
                    expiry: '0'
                },
                // Registered file - unverified issuer
                [this.createHexValue(3, 64)]: {
                    issuerAddress: this.createHexValue(2, 40),
                    issuerVerified: false,
                    issuerName: utf8ToHex('Unverified Issuer'),
                    issuerImg: this.createHexValue(0, 64),
                    revoked: false,
                    expiry: '0'
                },
                // Revoked file - verified issuer
                [this.createHexValue(4, 64)]: {
                    issuerAddress: this.createHexValue(1, 40),
                    issuerVerified: true,
                    issuerName: utf8ToHex('Verified Issuer'),
                    issuerImg: this.createHexValue(0, 64),
                    revoked: true,
                    expiry: '0'
                },
                // Revoked file - unverified issuer
                [this.createHexValue(5, 64)]: {
                    issuerAddress: this.createHexValue(2, 40),
                    issuerVerified: false,
                    issuerName: utf8ToHex('Unverified Issuer'),
                    issuerImg: this.createHexValue(0, 64),
                    revoked: true,
                    expiry: '0'
                }
            },
            verifyIssuer: {
                [this.createHexValue(1, 40)]: {
                    issuerVerified: true,
                    issuerName: utf8ToHex('Verified Issuer'),
                    issuerImg: this.createHexValue(0, 64)
                },
                [this.createHexValue(2, 40)]: {
                    issuerVerified: false,
                    issuerName: utf8ToHex('Unverified Issuer'),
                    issuerImg: this.createHexValue(0, 64)
                }
            }
        }
    }

    getMockResultFilterMethods() {
        return {
            verifyFile: function(args) {
                return this.results[args[0]]
            },
            verifyIssuer: function(args) {
                return this.results[args[0]]
            }
        }
    }
}
