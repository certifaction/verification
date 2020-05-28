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
<div class="verification-item" :class="{expanded: showAdvancedInfo}">
  <div class="item-header" @click="showAdvancedInfo = false">
    <div class="icon" v-if="verificationItem.loaded === true">
      <slot name="icon"></slot>
    </div>
    <div class="title">
      <div class="filename">{{ verificationItem.name }}</div>
    </div>
  </div>
  <div class="item-body">
    <div class="status">
      <slot name="title" v-if="isLoaded"></slot>
    </div>
    <transition name="expand" mode="out-in">
      <div class="loading-spinner" key="spinner" v-if="!isLoaded">
        <vue-simple-spinner></vue-simple-spinner>
      </div>
      <div class="verification-info" key="info" v-else>
        <div class="verification-entry issuer_name"
             v-if="verificationItem.issuerName">
          {{ verificationItem.issuerName }}
          <!--<img v-if="verificationItem.issuerVerified" src="./../../assets/img/verified-tick.png" alt="Verified" />-->
          <span class="stacked-title">{{ $t('verification.result.meta.issuer') }}</span>
        </div>
        <div class="verification-entry issuer_name"
             v-if="verificationItem.issuerVerifiedBy">
          {{ $t('verification.result.meta.issuerVerifiedBy') }} {{ verificationItem.issuerVerifiedBy }}
          <i class="mdi mdi-information-outline mdi-18px" v-tooltip.right="$t('verification.result.meta.issuerVerifiedByInformation')"></i>
          <br>
          <img v-if="verificationItem.issuerVerifiedImg" :src="'/img/'+verificationItem.issuerVerifiedImg" height="21"/>
        </div>
        <div class="verification-entry issuer_name"
             v-if="verificationItem.issuerVerified && !verificationItem.issuerVerifiedBy">
          {{ $t('verification.result.meta.issuerVerifiedBy') }} Certifaction AG
          <i class="mdi mdi-information-outline mdi-18px" v-tooltip.right="$t('verification.result.meta.issuerVerifiedByInformation')"></i>
          <br>
          <br>
        </div>
        <div class="verification-entry registration_date"
             v-if="verificationItem.registrationBlock">{{
          moment.unix(verificationItem.registrationBlock.timestamp).format('MMMM Do YYYY, h:mm:ss a') }} <span
            class="stacked-title">{{ $t('verification.result.meta.registrationDate') }}</span>
        </div>
        <div class="verification-entry revocationDate"
             v-if="verificationItem.revocationBlock">
          {{ moment.unix(verificationItem.revocationBlock.timestamp).format('MMMM Do YYYY, h:mm:ss a') }} <span
          class="stacked-title">{{ $t('verification.result.meta.revocationDate') }}</span>
        </div>
      </div>
    </transition>
    <div class="description" v-if="isLoaded">
      <slot name="description"></slot>
      <!-- Only show the offchain error on unverified issuers & on not found -->
      <div class="offchain-error" v-if="verificationItem.offchainError && (verificationItem.type === 1 || verificationItem.type === 2)">
        <span class="mdi mdi-alert-outline"></span>
        <span class="offchain-error-title">{{ $t('verification.result.technicalProblem.status') }}</span>
        <span class="offchain-error-description" v-html="$t('verification.result.technicalProblem.offchainMessage')"></span>
      </div>
    </div>
  </div>
  <div class="item-footer" v-if="verificationItem.issuer !== null && isLoaded && !verificationItem.error">
    <button v-if="showAdvancedInfo === false"
            class="btn-link advanced-toggler"
            @click.prevent="showAdvancedInfo = true">
      <i class="toggler mdi mdi-chevron-up mdi-24px"></i>
      <span>{{ $t('verification.result.expertInfo.show') }}</span>
    </button>
    <div v-else key="opened">
      <button key="closed"
              class="btn-link advanced-toggler"
              @click.prevent="showAdvancedInfo = !showAdvancedInfo">
        <span>{{ $t('verification.result.expertInfo.hide') }}</span>
        <i class="toggler mdi mdi-chevron-down mdi-24px"></i>
      </button>
      <slot name="advanced" class="footer-content">
        <div class="advanced-info">
          <div class="verification-entry issuer-address" v-if="verificationItem.issuer">
            <div class="hash">
              <span class="content">{{ verificationItem.issuer }}</span>
            </div>
            <span class="stacked-title advanced_info--title">{{ $t('verification.result.meta.issuerAddress') }}</span>
          </div>
          <div class="verification-entry fingerprint" v-if="verificationItem.hash">
            <div class="hash">
              <span class="content">{{ verificationItem.hash }}</span>
            </div>
            <span class="stacked-title advanced_info--title">{{ $t('verification.result.meta.fingerprint') }}</span>
          </div>
          <div class="verification-entry registration-hash" v-if="verificationItem.registrationEvent">
            <div class="hash">
              <span class="content"><a
                :href="`https://${net}/tx/${verificationItem.registrationEvent.transactionHash}`"
                target="_blank">{{ verificationItem.registrationEvent.transactionHash}}</a>
              </span>
            </div>
            <span
              class="stacked-title advanced_info--title">{{ $t('verification.result.meta.registrationTransaction') }}</span>
          </div>
          <div class="verification-entry revocation-hash" v-if="verificationItem.revocationEvent">
            <div class="hash">
              <span class="content"><a :href="`https://${net}/tx/${verificationItem.revocationEvent.transactionHash}`"
                                       target="_blank">{{ verificationItem.revocationEvent.transactionHash}}</a>
              </span>
            </div>
            <span
              class="stacked-title advanced_info--title">{{ $t('verification.result.meta.revocationTransaction') }}</span>
          </div>
        </div>
      </slot>
    </div>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import Spinner from 'vue-simple-spinner'
import Vue from 'vue'
import { VTooltip, VPopover, VClosePopover } from 'v-tooltip'

Vue.directive('tooltip', VTooltip)
Vue.directive('close-popover', VClosePopover)
Vue.component('v-popover', VPopover)

export default {
  name: 'layout-verification-item',
  props: ['verificationItem'],
  components: {
    'vue-simple-spinner': Spinner
  },
  data () {
    return {
      showAdvancedInfo: false,
      moment
    }
  },
  computed: {
    net () {
      switch (process.env.VUE_APP_ETHEREUM_NET || 'mainnet') {
        case 'mainnet':
          return 'etherscan.io'
        case 'ropsten':
          return 'ropsten.etherscan.io'
        default:
          return 'etherscan.io'
      }
    },
    isLoaded () {
      return this.verificationItem.loaded === true
    }
  }
}
</script>
