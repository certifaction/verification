# @certifaction/verification-app

[![lerna][lerna]][lerna-url]

This is an example implementation of the [@certifaction/verification-vue-component](https://github.com/certifaction/verification/tree/master/packages/verification-vue-component).

## Table of contents

* [Setup](#setup)
* [Configuration](#configuration)
* [Run locally](#run-locally)
* [Build for production](#build-for-production)
* [License](#license)

## Setup

```shell script
git clone https://github.com/certifaction/verification
cd verification/packages/verification-app
npm install
# or if using yarn
yarn install
```

## Configuration

Create a .env(.production|.development).local file in the project root to modify the default configuration:

```dotenv
VUE_APP_CLAIM_FF=true
VUE_APP_PROVIDER_URL=https://mainnet.infura.io/v3/4876e0df8d31475799c8239ba2538c4c
VUE_APP_LEGACY_CONTRACT_ADDRESS=0xdc1d2c136cad73e10ae367d075995185edd68cae
VUE_APP_LEGACY_CONTRACT_FALLBACK_ADDRESSES=0xf73e27c5008ff487803d2337fc3ac4016f6526e4,0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244
VUE_APP_CLAIM_CONTRACT_ADDRESS=0x5532ba4add77dd25fa11acc5a84e5f183f57525e
VUE_APP_ACCEPTED_ISSUER_KEY=0x3b031733e215e4edf7565e11f2aba907a826aadc
VUE_APP_CERTIFACTION_API_URL=https://api.certifaction.io/
```

## Run locally

Compiles and hot-reloads for development

```shell script
npm run serve
```

## Build for production

```shell script
npm run build
```

## License

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/certifaction/verification/blob/master/LICENSE)

Released by [Certifaction AG](https://certifaction.io)

[lerna]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-url]: https://lerna.js.org/
