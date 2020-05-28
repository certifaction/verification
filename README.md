# certifaction verification tool

## Purpose
certifaction enables educational institutions and HR departments to fight fraud and cut the red tape in the document verification process.

The verification tool takes PDF files from a clients local file system, hashes the files and looks it up on an Ethereum Smart Contract. That way we can prove the authenticity of the documents.

## verification client
The verification client library is used to query the Ethereum Smart Contract of certifaction.
It can return a full verification object and meta information regarding the registration event, the registration transaction as well as revocation meta data.

## Usage
Add the verification client to your projects dependencies.

    npm install @certifaction/verification-client

Import it in an ES6 module context.

    import { Client, SmartContractABI } from '@certifaction/verification-client'

Use the client to query the smart contract and the ABI for your own Smart Contract interaction layer.

## verification
The verification tool contains a reference implementation of the verification features. Use it in an iFrame or embed the tool directly into any HTML page.

### Usage
Add the verification tool to your projects dependencies.

    npm install @certifaction/verification
    
Use the tool in a Vue.js context or mount it directly into your DOM as a script include:
    
#### Vue context
The verification tool is a Vue instance mounting to an HTML element with the id `#certifaction-verification`.
To use it in your application, import it as an ES6 module and use it as a component.

    import Verification from '@certifaction/verification/src/Verification'
    
    `<Verification />`
    
#### Off-chain check
If you want to double check, add information, or simply make sure the user gets the correct result even though the block containing your transaction isn't finalized, you can provide an `OffchainVerifierInterface`'s implementation.

The class should only contain the method `verify(fileHash)`. The method should return the attributes you want to override.

For an example on how to do that, check `packages/verification-client/src/CertifactionVerifierExample.js` 
    
At that point you can simply pass the verifier to the <Verification /> component like this:

```<Verification v-bind:offchain-verifier="offchainVerifier" />```

#### Script
Build the tool and integrate it using a script tag just before the closing ``<body>`` tag of your HTML page.

    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
      </head>
      <body>
        <div id="certifaction-verification"></div>
        <script src="%PATH_TO_DIST_FOLDER%/js/main.js"></script>
      </body>
    </html>
    
    
## Configuration
Create a .env(.production|.development) file in your vue project root to modify the Ethereum connection configuration:

    VUE_APP_PROVIDER_URL='wss://globally-wired-leopard.quiknode.io/14eaf46b-28cd-40cb-b39a-5eeda05ec2b8/tqclEU9oX2upm9YX2RUY6w==/'
    VUE_APP_CONTRACT_ADDRESS='0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244'
    VUE_APP_ETHEREUM_NET='mainnet'

## Publish a new version
To publish a new version please commit your changes to master and then execute

    lerna publish
    
This will start the wizard to publish a new version to NPM.
