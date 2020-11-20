# @certifaction/verification-core

[![npm][npm]][npm-url]
[![lerna][lerna]][lerna-url]

The verification-core contains everything needed verify a filehash on the Ethereum Smart Contract of Certifaction.
It returns a full verification object and meta information regarding the registration event, the registration transaction as well as revocation meta data.

## Table of contents

* [Install](#install)
    * [As NPM package](#as-npm-package)
* [Usage](#usage)
    * [ES6](#es6)
* [License](#license)

## Install

### As NPM package

```shell script
npm install @certifaction/verification-core

# or if using yarn
yarn add @certifaction/verification-core
```

## Usage

### ES6

```js
import { CertifactionEthVerifier } from '@certifaction/verification-core'

const certifactionEthVerifier = new CertifactionEthVerifier()
// or with custom properties (the values shown here are the default values)
const certifactionEthVerifier = new CertifactionEthVerifier(
    '', // pdfWasmUrl - required to be set
    true, // enableClaims
    'https://mainnet.infura.io/v3/4876e0df8d31475799c8239ba2538c4c', // providerUrl
    '0xdc1d2c136cad73e10ae367d075995185edd68cae', // legacyContractAddress
    ['0xf73e27c5008ff487803d2337fc3ac4016f6526e4', '0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244'], // legacyContractFallbackAddresses
    '0x5532ba4add77dd25fa11acc5a84e5f183f57525e', // claimContractAddress
    '0x3f647d9f6a22768EA9c91C299d0AD5924c6164Be', // acceptedIssuerKey
    'https://api.certifaction.io/' // certifactionApiUrl
)

const verification = certifactionEthVerifier.verify(fileHash)
```

## License

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/certifaction/verification/blob/master/LICENSE)

Released by [Certifaction AG](https://certifaction.io)

[npm]: https://img.shields.io/npm/v/@certifaction/verification-core.svg
[npm-url]: https://www.npmjs.com/package/@certifaction/verification-core
[lerna]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-url]: https://lerna.js.org/
