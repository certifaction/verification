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

import { Client, ClaimClient } from '@certifaction/verification-client'

const providerUrl = process.env.VUE_APP_PROVIDER_URL ||
  'https://mainnet.infura.io/v3/4876e0df8d31475799c8239ba2538c4c'
const contractAddress = process.env.VUE_APP_CONTRACT_ADDRESS ||
  '0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244'
const claimContractAddress = process.env.VUE_APP_CLAIM_CONTRACT_ADDRESS ||
  '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409'
const acceptedIssuerKey = process.env.VUE_APP_ACCEPTED_ISSUER_KEY ||
  '0xd88319a418cf65544f470cacd728b2420e100d20'

const certifactionAPIUrl = process.env.VUE_APP_CERTIFACTION_API_URL || 'https://api.certifaction.io/'

const claimFF = !!((process.env.VUE_APP_CLAIM_FF && process.env.VUE_APP_CLAIM_FF === 'true'))
let client = new Client(providerUrl, contractAddress)
if (claimFF) {
  console.log('Feature Flag CLAIM_FF activated. Using ClaimClient')

  client = new ClaimClient(
    providerUrl,
    contractAddress,
    claimContractAddress,
    acceptedIssuerKey,
    certifactionAPIUrl
  )
}

export default client
