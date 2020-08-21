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

/**
 * A file verification object from the smart contract
 * @typedef {Object} FileVerification
 * @property {string} issuer
 * @property {number} expiry
 * @property {boolean} revoked
 * @property {boolean} issuerVerified
 * @property {string} issuerName
 * @property {string} issuerImg
 */

import Eth from 'web3-eth'
import {hexToUtf8, hexToBytes} from 'web3-utils'
import SmartContractABI from './SmartContract.abi'
import ClaimSmartContractABI from './ClaimSmartContract.abi'
import axios from 'axios'
import EthCrypto from 'eth-crypto'


export default class ClaimClient {

  /**
   * Represents a Certifaction Ethereum smart contract client
   * @constructor
   * @param {string} providerUrl
   * @param {string} contractAddress
   * @param {string} claimContractAddress claim contract address in HEX format (ex. 0x010...)
   * @param {string} acceptedIssuerKey in HEX format (ex. 0x010...)
   * @param {string} certifactionAPIUrl
   */
  constructor (providerUrl, contractAddress, claimContractAddress, acceptedIssuerKey, certifactionAPIUrl) {
    console.log('Claim client instantiated! No production!!!!')
    this.providerUrl = providerUrl
    this.contractAddress = contractAddress
    this.acceptedIssuerKey = acceptedIssuerKey
    this.certifactionAPIUrl = certifactionAPIUrl
    this.eth = new Eth(this.providerUrl)
    this.contract = new this.eth.Contract(
      SmartContractABI,
      this.contractAddress,
    )
    this.claimContractAddress = claimContractAddress
    this.claimContract = new this.eth.Contract(
        ClaimSmartContractABI,
        this.claimContractAddress,
    )
  }
  /**
   * Verifies a file hash on the smart contract
   * @param {string} hash
   * @return {FileVerification}
   */
  async verifyFile(hash) {
    console.log('ok, verifying now')
    let fileVerification = await this.verifyFileClaimBased(hash);

    //If claim-based (verifyFileClaimBased) returns results, use validated infos
    if (fileVerification.issuer==undefined){
      //If not, try verifyFileContractBased instead and use those infos
      fileVerification = this.verifyFileContractBased(hash)
    }
    return fileVerification
  }

  /**
   * Verifies a file hash on the smart contract
   * @param {string} hash
   * @return {FileVerification}
   */
  async verifyFileContractBased (hash) {
    return new Promise((resolve, reject) => {
      this.contract.methods.verifyFile(hash).call({}, function (err, res) {
        if (err) {
          return reject(err)
        }

        let {
          issuer,
          issuerName,
          issuerImg,
          issuerVerified,
          revoked,
          expiry,
        } = res

        // Let's nullify all empty hex strings for beauty
        const nullValue40 = '0x0000000000000000000000000000000000000000'
        const nullValue64 = '0x0000000000000000000000000000000000000000000000000000000000000000'

        // Transform from hex representation
        issuer = issuer === nullValue40 ? null : issuer
        issuerName = issuerName === nullValue40 ? null : hexToUtf8(issuerName)
        issuerImg = issuerImg === nullValue64 ? null : hexToBytes(issuerImg)
        expiry = expiry._hex === '0x00' ? null : expiry._hex

        resolve({
          issuer,
          issuerName,
          issuerImg,
          issuerVerified,
          revoked,
          expiry,
        })
      })
    })
  }

  /**
   * Verifies a file hash based on claims
   * @param {string} hash
   * @return {FileVerification}
   */
  async verifyFileClaimBased (hash) {
    let result=await this.resolveAndValidateFileClaim(hash)
    return result
  }

  async resolveAndValidateFileClaim(hash) {
    // Get Events for Filehash
    const fileEvents = await this.claimContract.getPastEvents(
        'Claim', {
          filter: {file: hash},
          fromBlock: 0,
        })

    let registered, revoked = false;
    let issuerAddr, issuerName;
    let issuerVerified;
    let expiry, issuerImg;


    console.log(fileEvents.length+" event(s) found on Blockchain for File "+hash)
    // For Each Event
    for (const fileEvent of fileEvents) {

      console.log("---------")

      //Get Claim Hash from Event
      let fileHash = fileEvent.returnValues.file
      let claimHash = fileEvent.returnValues.hash
      if (fileHash != hash){
        console.error("Hashes NOT matching, Event is not for this File, discarding.")
        continue
      }

      console.log("Event is for File.")
      console.log(fileEvent)
      console.log("Etherscan link to Tx: https://ropsten.etherscan.io/tx/"+fileEvent.transactionHash)
      console.log("File is associated with Claim Hash: "+claimHash)

      //Get Claim from endpoint for Claimhash
      let claim;
      try {
        claim = await this.getRawClaim(claimHash)
      } catch (e) {
        console.error("Could not retrieve Claim by Hash, discarding.", e)
        continue;
      }
      let claimString = JSON.stringify(claim)
      console.log("Raw JSON Claim: "+claimString)

      if(!claim) {
        console.error("Claim not found")
        continue
      }

      //Verify Claim (hashes to claimhash, belongs to file, Has right content/type)
      if (claim["@id"] !== "cert:hash:"+fileHash) {
        console.error("Hashes NOT matching, Claim is NOT for this File, discarding.")
        continue
      }
      console.log("Hashes matching, Claim is for this File.")

      //Get Issuer Hash from Address from Signature
      issuerAddr=await this.verifySignatureAndGetPubkey(claim, claim.signature)
      console.log("Recovered Signer address:", issuerAddr)

      if (issuerAddr != claim.proof.creator){
        console.error("Signer Address does NOT match Claim Creator attribute, discarding.")
        issuerAddr=null
        continue;
      }
      console.log("Signer Address matches Claim Creator attribute")

      issuerName=await this.resolveAndVerifyIssuerIdentity(issuerAddr)
      if (issuerName != undefined){
        issuerVerified=true
      }

      if (claim.scope=="register"){
        console.log("Is a registration claim!")
        registered=true
        revoked=false
      }else if (claim.scope=="revoke"){
        console.log("Is revocation claim")
        revoked=true
      }else{
        console.error("Is an unknown claim type, discarding.")
        continue
      }
    }

    console.log("Consolidated Verification Result for File "+hash+":")
    console.log("IssuerAddr: "+issuerAddr+
        "\nIssuerName: "+issuerName+
        "\nIssuerVerified: "+issuerVerified+
        "\nRegistered: "+registered+
        "\nExpiry: "+expiry+
        "\nRevoked: "+revoked)

    let issuer=issuerAddr

    return {expiry, issuer, issuerImg, issuerName, issuerVerified, revoked}
  }

  async resolveAndVerifyIssuerIdentity (hash) {
    // Get Events for Filehash
    const identityEvents = await this.claimContract.getPastEvents(
        'Claim', {
          filter: {file: hash},
          fromBlock: 0,
        })

    for (const identityEvent of identityEvents) {

      //Get Claim Hash from Event
      let identityHash = identityEvent.returnValues.file
      let claimHash = identityEvent.returnValues.hash
      console.log(identityHash+" >> "+claimHash)


      //Get Claim from endpoint for Claimhash
      const claim = this.getRawClaim(claimHash)

      //Verify Claim (hashes to claimhash, belongs to file, Has right content/type)
      if (claim.id === "cert:addr:0x"+identityHash) {

        //Get Issuer Hash from Address from Signature
        const issuerHash=this.verifySignatureAndGetPubkey(claim, claim.signature)

        //Only Certifaction is allowed to issue ID claims
        if (issuerHash==this.acceptedIssuerKey){
          return claim.name
        }
      }
    }
  }

  async getRawClaim(claimhash){
    try {
      const res =  await axios.get(`${this.certifactionAPIUrl}claim/${claimhash}`)
      if (res.status === 200) {
        return res.data
      }
      throw new Error(`Unexpected status ${res.status}`)
    } catch (e) {
      if (e.response && e.response.status === 404) {
        return null
      }
      throw e
    }
  }


  async verifySignatureAndGetPubkey(claim){

    console.log("Verifying Signature...")

    // Transform standard ECDSA signature's recovery id to Ethereum standard for verification
    let plainSignature=claim.proof.signatureValue.slice(0, 128)
    let recoveryId=claim.proof.signatureValue.slice(128,130)
    let fixedRecoveryId=parseInt(recoveryId, 16)+27
    let ethereuSignature="0x"+plainSignature+(fixedRecoveryId.toString(16))
    console.log("Signature Value (Hex): "+ethereuSignature)

    delete claim.proof.signatureValue
    let JSONstring = JSON.stringify(claim)
    console.log("Unsigned JSON Claim: "+JSONstring)

    let unsignedClaimHash=EthCrypto.hash.keccak256(JSONstring)
    console.log("Unsigned ClaimHash: "+unsignedClaimHash)

    const address = EthCrypto.recover(
        ethereuSignature,unsignedClaimHash)

    return address
  }

  /**
   * Returns information about the transaction that registered the credential
   *
   * @param {string} fileHash
   * @return {Promise<void>}
   */
  async getRegistrationEvent (fileHash) {
    const arrEvents = await this.contract.getPastEvents(
      'FileRegisteredEvent', {
        filter: {hash: fileHash},
        fromBlock: 0,
      })
    return arrEvents[0] || null
  }

  /**
   * Returns information about the transaction that registered the credential
   *
   * @param {string} fileHash
   * @return {Promise<void>}
   */
  async getRevocationEvent (fileHash) {
    let arrEvents = await this.contract.getPastEvents(
      'FileRevokedEvent', {
        filter: {hash: fileHash},
        fromBlock: 0,
      })
    return arrEvents[0] || null
  }

  /**
   * Returns the block that contains the tx that registered the given file hash
   *
   * @param fileHash
   * @return {Promise<*>}
   */
  async getRegistrationTxBlock (fileHash) {
    let event = await this.getRegistrationEvent(fileHash)
    if (event === null) {
      return null
    }
    return await this.getBlock(event.blockHash)
  }

  /**
   * Returns the block that contains the tx that revoked the given file hash
   *
   * @param fileHash
   * @return {Promise<*>}
   */
  async getRevocationTxBlock (fileHash) {
    let event = await this.getRevocationEvent(fileHash)
    if (event === null) {
      return null
    }
    return await this.getBlock(event.blockHash)
  }

  async getBlock (blockHash) {
    return await this.eth.getBlock(blockHash)
  }

  /**
   * Closes the Websocket connection of the current provider.
   * Does nothing for HttpProviders.
   */
  close () {
    return this.eth.currentProvider.connection.close()
  }

}
