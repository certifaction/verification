# Certifaction Verification Tool

[![lerna][lerna]][lerna-url]

Certifaction enables educational institutions and HR departments to fight fraud and cut the red tape in the document verification process.

The verification tool takes PDF files from a clients local file system, hashes the files and looks it up on an Ethereum Smart Contract. That way we can prove the authenticity of the documents.

## Table of contents

* [Packages](#packages)
* [Development](#development)
    * [Requirements](#requirements)
    * [Getting started](#getting-started)
    * [Publishing](#create-new-release--publish-to-github-packages)
* [License](#license)

## Packages

This monorepo contains these packages:

| Project | Package |
|---|---|
| Verification Core | [@certifaction/verification-core](https://github.com/certifaction/verification/tree/master/packages/verification-core) |
| Verification Vue-Component | [@certifaction/verification-vue-component](https://github.com/certifaction/verification/tree/master/packages/verification-vue-component) |

## Development

### Requirements

* [NodeJS](https://nodejs.org) >= 21

### Getting started

Clone the git repo and install dependencies.
```shell script
git clone https://github.com/certifaction/verification
cd verification
npm install
```

Check and fix linting errors
```shell script
npm run lint
```

### Create new release / publish to GitHub Packages

1. Create release branch (has to start with `releases/`). It's best to name the branch according to the version you want to release (ex. `releases/v1.2.3`, or `releases/v2.0.0-rc.0`). The branch name isn't used for the actual release tough.

2. Execute `npm run create-version` and follow the prompts. You can use `npm run force-create-version` to force a new version to be published.

3. Commit and push the changes created by Lerna.

4. Create PR based on the release branch and merge it. This will automatically publish the release to GitHub Packages.

## License

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/certifaction/verification/blob/master/LICENSE)

Released by [Certifaction AG](https://certifaction.com)

[lerna]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-url]: https://lerna.js.org/
