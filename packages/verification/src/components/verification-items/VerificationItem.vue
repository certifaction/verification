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
<div class="item-container">
  <component :is="verificationItemType" :verificationItem="verificationItem"></component>
</div>
</template>

<script>
import VERIFICATION_TYPES from '../../lib/verification-types'

import ShadowItem from './ShadowItem'
import VerificationItemNotFound from './VerificationItemNotFound'
import VerificationItemRevoked from './VerificationItemRevoked'
import VerificationItemRevokedUnverified from './VerificationItemRevokedUnverified'
import VerificationItemUnverifiedIssuer from './VerificationItemUnverifiedIssuer'
import VerificationItemVerified from './VerificationItemVerified'
import VerificationItemProcessing from './VerificationItemProcessing'
import VerificationItemTechnicalProblem from './VerificationItemTechnicalProblem'

export default {
  name: 'verification-item',
  components: {
    ShadowItem,
    VerificationItemRevoked,
    VerificationItemRevokedUnverified,
    VerificationItemNotFound,
    VerificationItemUnverifiedIssuer,
    VerificationItemVerified,
    VerificationItemProcessing,
    VerificationItemTechnicalProblem
  },
  props: {
    verificationItem: {
      type: Object,
      required: true
    }
  },
  computed: {
    verificationItemType () {
      if (this.verificationItem.error) {
        return 'VerificationItemTechnicalProblem'
      }
      if (this.verificationItem.hashed === undefined || this.verificationItem.hashed === false) {
        return 'ShadowItem'
      }
      switch (this.verificationItem.type) {
        case VERIFICATION_TYPES.V_REVOKED:
          if (this.verificationItem.issuerVerified) {
            return 'VerificationItemRevoked'
          }
          return 'VerificationItemRevokedUnverified'
        case VERIFICATION_TYPES.V_NOT_FOUND:
          return 'VerificationItemNotFound'
        case VERIFICATION_TYPES.V_SELF_DECLARED:
          if (!this.verificationItem.onBlockchain) {
            return 'VerificationItemProcessing'
          }
          return 'VerificationItemUnverifiedIssuer'
        case VERIFICATION_TYPES.V_VERIFIED:
          if (!this.verificationItem.onBlockchain) {
            return 'VerificationItemProcessing'
          }
          return 'VerificationItemVerified'
      }
      return 'VerificationItemTechnicalProblem'
    }
  }
}
</script>
