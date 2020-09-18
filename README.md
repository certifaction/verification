# Certifaction Verification Tool

[![lerna][lerna]][lerna-url]

Certifaction enables educational institutions and HR departments to fight fraud and cut the red tape in the document verification process.

The verification tool takes PDF files from a clients local file system, hashes the files and looks it up on an Ethereum Smart Contract. That way we can prove the authenticity of the documents.

## Table of contents

* [Packages](#packages)
* [Development](#development)
    * [Requirements](#requirements)
    * [Getting started](#getting-started)
    * [Publishing](#publishing)
* [License](#license)

## Packages

This monorepo contains these packages:

| Project | Package | Version |
|---|---|---|
| Verification Core | [@certifaction/verification-core](https://github.com/certifaction/verification/tree/master/packages/verification-core) | [![latest](https://img.shields.io/npm/v/%40certifaction%2Fverification-core/latest.svg)](https://npmjs.com/package/@certifaction/verification-core) |
| Verification Vue-Component | [@certifaction/verification-vue-component](https://github.com/certifaction/verification/tree/master/packages/verification-vue-component) | [![latest](https://img.shields.io/npm/v/%40certifaction%2Fverification-vue-component/latest.svg)](https://npmjs.com/package/@certifaction/verification-vue-component) |

## Development

### Requirements

* [NodeJS](https://nodejs.org) >= 12
* [Yarn](https://yarnpkg.com)
* [Lerna](https://lerna.js.org/)

### Getting started

Clone the git repo and install dependencies.
```shell script
git clone https://github.com/certifaction/verification
cd verification
lerna bootstrap
```

Check and fix linting errors
```shell script
lerna run lint
```

Build libraries
```shell script
lerna run build
```

### Publishing

To publish a new version please commit your changes to master and then execute

```shell script
lerna publish
```

This will start the wizard to publish a new version to NPM.

## License

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/certifaction/verification/blob/master/LICENSE)

Released by [Certifaction AG](https://certifaction.io)

[lerna]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-url]: https://lerna.js.org/
