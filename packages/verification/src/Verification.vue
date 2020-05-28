<!--
  - Copyright (c) 2020 Certifaction AG
  -
  - Permission is hereby granted, free of charge, to any person obtaining a copy
  - of this software and associated documentation files (the "Software"), to deal
  - in the Software without restriction, including without limitation the rights
  - to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  - copies of the Software, and to permit persons to whom the Software is
  - furnished to do so, subject to the following conditions:
  -
  - The above copyright notice and this permission notice shall be included in all
  - copies or substantial portions of the Software.
  -
  - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  - IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  - FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  - AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  - LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  - OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  - SOFTWARE.
  -->

<template>
<div id="certifaction-verification">
  <div class="verification">
    <div class="verification-demo" v-if="demo !== false">
      <div class="sample-docs papers">
        <h3>{{ $t('verification.demo.title') }}</h3>
        <span class="text-muted"><small>{{ $t('verification.demo.clickToVerify') }}</small></span>
        <div class="docs">
          <div class="paperbox text-center">
            <div class="paper paper-verified" @click="demoVerified" @dragstart="draggingDemoDoc = 'verified'"
                 @dragend="draggingDemoDoc = undefined"
                 draggable>
              <i class="mdi mdi-shield-check mdi-18px"></i>
              <div class="lines">
                <div class="line-short"></div>
                <div class="line-long"></div>
                <div class="line-long"></div>
                <div class="line-short"></div>
              </div>
            </div>
            <div class="paper paper-unverified mt-2" @click="demoUnverified"
                 @dragend="draggingDemoDoc = undefined"
                 @dragstart="draggingDemoDoc = 'unverified'" draggable>
              <i class="mdi mdi-alert-circle-outline"></i>
              <div class="lines">
                <div class="line-short"></div>
                <div class="line-long"></div>
                <div class="line-long"></div>
                <div class="line-long"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <verification-drop-box @filesDropped="verify" @drop="drop"/>
    <div class="verification-item-list" ref="results">
      <verification-item v-for="verificationItem in filteredVerificationItems"
                         :verificationItem="verificationItem"/>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import './assets/styles/styles.scss'
import VerificationItem from './components/verification-items/VerificationItem'
import VerificationDropBox from './components/VerificationDropBox'
import client from './lib/contract-adapter'
import VERIFICATION_TYPES from './lib/verification-types'
import hashingService from './lib/hashing-service'
import VueScrollTo from 'vue-scrollto'
import VTooltip from 'v-tooltip'
import { Interface, OffchainVerifierInterface } from '@certifaction/verification-client/src/OffchainVerifierInterface'

Vue.use(VueScrollTo)
Vue.use(VTooltip)

function mapVerificationItemType (item) {
  if (item.issuer === null) {
    return VERIFICATION_TYPES.V_NOT_FOUND
  }
  if (item.revoked === true) {
    return VERIFICATION_TYPES.V_REVOKED
  }
  if (item.issuerVerified === true) {
    return VERIFICATION_TYPES.V_VERIFIED
  }
  return VERIFICATION_TYPES.V_SELF_DECLARED
}

export default {
  name: 'bf-verification',
  props: {
    demo: {
      required: false,
      type: Boolean
    },
    offchainVerifier: {
      required: false,
      type: Object,
      validator: function (value) {
        Interface.ensureImplements(value, OffchainVerifierInterface)
        return true
      }
    }
  },
  components: {
    VerificationItem,
    VerificationDropBox
  },
  data () {
    return {
      verificationItems: [],
      draggingDemoDoc: undefined,
      draggingOver: false
    }
  },
  computed: {
    filteredVerificationItems () {
      return this.verificationItems.map(item => {
        if (item.hash === undefined && !item.error) {
          return {
            hashed: false
          }
        }
        return {
          hashed: true,
          type: mapVerificationItemType(item),
          ...item
        }
      })
    }
  },
  methods: {
    async verify (files) {
      this.verificationItems = []
      try {
        for (const file of files) {
          this.verificationItems.push({ file, name: file.name })
        }

        VueScrollTo.scrollTo(this.$refs.results, 400)

        this.verificationItems.forEach(async (item, i) => {
          try {
            const hash = await hashingService.hashFile(item.file)
            const verification = await client.verifyFile(hash)
            Vue.set(this.verificationItems, i, { ...this.verificationItems[i], hash, ...verification })

            if (verification.issuer !== null) {
              this.verificationItems[i].onBlockchain = true
              let [registrationEvent, registrationBlock] = await Promise.all(
                [client.getRegistrationEvent(hash), client.getRegistrationTxBlock(hash)]
              )

              Vue.set(this.verificationItems, i, {
                ...this.verificationItems[i],
                registrationEvent,
                registrationBlock
              })

              if (verification.revoked === true) {
                let [revocationEvent, revocationBlock] = await Promise.all(
                  [client.getRevocationEvent(hash), client.getRevocationTxBlock(hash)]
                )
                Vue.set(this.verificationItems, i, {
                  ...this.verificationItems[i],
                  revocationEvent,
                  revocationBlock
                })
              }
            }

            if (this.offchainVerifier) {
              // Make a call to the off-chain validator
              try {
                const offchainVerification = await this.offchainVerifier.verify(hash)
                if (!verification.issuer) {
                  // File not found on blockchain
                  if (offchainVerification) {
                    Vue.set(this.verificationItems, i, Object.assign(this.verificationItems[i], offchainVerification))
                  }
                }
                if (offchainVerification) {
                  // If it's already verified on blockchain, do not override all values; just issuerName & address can be taken from off-chain information
                  if (!this.verificationItems[i].issuerName && offchainVerification.issuerName) {
                    this.verificationItems[i].issuerName = offchainVerification.issuerName
                    this.verificationItems[i].issuerVerified = offchainVerification.issuerVerified
                    this.verificationItems[i].issuerVerifiedBy = offchainVerification.issuerVerifiedBy
                    this.verificationItems[i].issuerVerifiedImg = offchainVerification.issuerVerifiedImg
                  }
                  if (!this.verificationItems[i].issuer) {
                    this.verificationItems[i].issuer = offchainVerification.issuerAddress
                  }
                }
              } catch (e) {
                Vue.set(this.verificationItems[i], 'offchainError', true)
              }
            }
          } catch (e) {
            console.log('An error occurred during hashing & retrieval of information', e)
            Vue.set(this.verificationItems[i], 'error', e)
          } finally {
            Vue.set(this.verificationItems[i], 'loaded', true)
          }
        })
      } catch (e) {
        console.log(e)
      }
    },
    drop () {
      if (this.draggingDemoDoc) {
        switch (this.draggingDemoDoc) {
          case 'verified':
            this.demoVerified()
            break
          case 'unverified':
            this.demoUnverified()
            break
        }
      }
    },
    demoVerified () {
      this.verificationItems = []
      this.verificationItems.unshift({
        'hashed': true,
        'type': VERIFICATION_TYPES.V_VERIFIED,
        'name': this.$t('verification.demo.doc1Filename'),
        'hash': '0x33e63485a8594ee7d1cfbb418a6f5acf7532faca38aa8a36b23eec8f6a53d179',
        'issuer': '0xD0f6C73Bf87d1A00797A8A1DF2dF0Dad89D2411f',
        'issuerName': 'Test University',
        'issuerImg': null,
        'issuerVerified': true,
        'revoked': false,
        'expiry': null,
        'registrationEvent': {
          'address': '0x5ee4ec3cbee909050e68c7ff7a8b422cfbd72244',
          'blockHash': '0xa95f5fce5e6ebfcbdb8bbd932e412fd376dc8b7189b8d8572fe9d4d8994961de',
          'blockNumber': 7937331,
          'transactionHash': '0x9b7e8f75ae271d8d659eb7bbd6d090fad3c784f862a5a83368fbc970bfa0a215 ',
          'event': 'FileRegisteredEvent',
          'signature': '0x98b03391b6b42a1d067881e3d2a22b2091e0412a0e2c40cf687d1c036beb6e11'
        },
        'registrationBlock': {
          'hash': '0x9b7e8f75ae271d8d659eb7bbd6d090fad3c784f862a5a83368fbc970bfa0a215',
          'timestamp': 1560246087
        },
        'loaded': true
      })

      VueScrollTo.scrollTo(this.$refs.results, 400)
    },
    demoUnverified () {
      this.verificationItems = []
      this.verificationItems.unshift({
        'name': this.$t('verification.demo.docUnverifiedFilename'),
        'hash': '0x8db3dfe7de59e35f5f8be5fde6da543b57ccc017388def7c0a1db7af24db4abf',
        'issuer': null,
        'issuerName': null,
        'issuerImg': null,
        'issuerVerified': false,
        'revoked': false,
        'expiry': null,
        'loaded': true
      })

      VueScrollTo.scrollTo(this.$refs.results, 400)
    }
  }
}
</script>
