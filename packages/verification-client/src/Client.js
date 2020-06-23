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

export default class Client {

  /**
   * Represents a Certifaction Ethereum smart contract client
   * @constructor
   * @param {string} providerUrl
   * @param {string} contractAddress
   */
  constructor (providerUrl, contractAddress) {
    this.providerUrl = providerUrl
    this.contractAddress = contractAddress
    this.eth = new Eth(this.providerUrl)
    this.contract = new this.eth.Contract(
      SmartContractABI,
      this.contractAddress,
    )
  }

  /**
   * Verifies a file hash on the smart contract
   * @param {string} hash
   * @return {FileVerification}
   */
  async verifyFile (hash) {
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
