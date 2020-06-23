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


export default class Client {

  /**
   * Represents a Certifaction Ethereum smart contract client
   * @constructor
   * @param {string} providerUrl
   * @param {string} contractAddress
   */
  constructor (providerUrl, contractAddress, claimContractAddress, acceptedIssuerKey) {
    this.providerUrl = providerUrl
    this.contractAddress = contractAddress
    this.acceptedIssuerKey = acceptedIssuerKey
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
    var fileVerification = await this.verifyFileClaimBased(hash)

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
          reject(err)
        } else {
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
        }
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

  async resolveAndValidateFileClaim(hash, acceptAnyIssuer) {
    // Get Events for Filehash
    const fileEvents = await this.claimContract.getPastEvents(
        'Claim', {
          filter: {file: hash},
          fromBlock: 0,
        })

    var aLen = fileEvents.length;

    var registered, revoked=false
    var issuerAddr, issuerName
    var issuerVerified
    var expiry, issuerImg


    console.log(aLen+" event(s) found on Blockchain for File "+hash)
    // For Each Event
    for (var i = 0; i < aLen; i++) {

      console.log("---------")
      console.log("Processing event #"+(i+1))

      //Get Claim Hash from Event
      let fileHash=fileEvents[i].returnValues.file
      let claimHash=fileEvents[i].returnValues.hash
      if (fileHash == hash){
        console.log("Event is for File.")
        console.log(fileEvents[i])
        console.log("Etherscan link to Tx: https://ropsten.etherscan.io/tx/"+fileEvents[i].transactionHash)
        console.log("File is associated with Claim Hash: "+claimHash)


        //Get Claim from endpoint for Claimhash
        try {
          var claim = await this.getRawClaim(claimHash)
        } catch (e) {
          console.error("Could not retrieve Claim by Hash, discarding.")
          console.error(e)
          continue
        }
        let claimString = JSON.stringify(claim)
        console.log("Raw JSON Claim: "+claimString)

        //Verify Claim (hashes to claimhash, belongs to file, Has right content/type)
        if (claim["@id"] === "cert:hash:"+fileHash) {
          console.log("Hashes matching, Claim is for this File.")

          //Get Issuer Hash from Address from Signature
          issuerAddr=await this.verifySignatureAndGetPubkey(claim, claim.signature)
          console.log("Recovered Signer address:", issuerAddr)

          if (issuerAddr == claim.proof.creator){
            console.log("Signer Address matches Claim Creator attribute")
          }else{
            console.error("Signer Address does NOT match Claim Creator attribute, discarding.")
            issuerAddr=null
            continue
          }

          issuerName=await this.resolveAndVerifyIssuerIdentitiy(issuerAddr)
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
            console.error("Is an unkown claim type, discarding.")
            continue
          }
        }else{
          console.error("Hashes NOT matching, Claim is NOT for this File, discarding.")
          continue
        }
      }else{
        console.error("Hashes NOT matching, Event is not for this File, discarding.")
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

  async resolveAndVerifyIssuerIdentitiy (hash) {
    // Get Events for Filehash
    const identitiyEvents = await this.claimContract.getPastEvents(
        'Claim', {
          filter: {file: hash},
          fromBlock: 0,
        })

    var aLen = identitiyEvents.length;

    // For Each Event
    for (var i = 0; i < aLen; i++) {

      //Get Claim Hash from Event
      let identityHash=identitiyEvents[i].returnValues.file
      let claimHash=identitiyEvents[i].returnValues.hash
      console.log(identityHash+" >> "+claimHash)


      //Get Claim from endpoint for Claimhash
      var claim = this.getRawClaim(claimHash)

      //Verify Claim (hashes to claimhash, belongs to file, Has right content/type)
      if (claim.id === "cert:addr:0x"+identityHash) {

        //Get Issuer Hash from Address from Signature
        let issuerHash=this.verifySignatureAndGetPubkey(claim, claim.signature)

        //Only Certifaction is allowed to issue ID claims
        if (issuerHash==this.acceptedIssuerKey){
          return claim.name
        }
      }
    }
  }

  async getRawClaim(claimhash){
    try {
      var claim
      console.log("Retrieving Claim from https://api.dev.testnet.certifaction.io/claim/"+claimhash)
      const res =  await axios.get(`https://api.dev.testnet.certifaction.io/claim/${claimhash}`)
      if (res.status === 200) {
        claim = res.data
        return claim
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

    //const signer = EthCrypto.recoverPublicKey(
    //    decomSignature,unsignedClaimHash)
    //console.log("Recovered issuer pub key:", addressCalc)
    //const addressCalc = EthCrypto.publicKey.toAddress(signer)
    //console.log("Recovered issuer address (calc):", addressCalc)

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
