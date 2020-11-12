<template>
    <div class="item-container">
        <component :is="verificationItemType" :verificationItem="verificationItem"></component>
    </div>
</template>

<script>
import { VERIFICATION_TYPES } from '@certifaction/verification-core'
import ShadowItem from './ShadowItem.vue'
import VerificationItemNotFound from './VerificationItemNotFound.vue'
import VerificationItemRevoked from './VerificationItemRevoked.vue'
import VerificationItemRevokedUnverified from './VerificationItemRevokedUnverified.vue'
import VerificationItemUnverifiedIssuer from './VerificationItemUnverifiedIssuer.vue'
import VerificationItemVerified from './VerificationItemVerified.vue'
import VerificationItemTechnicalProblem from './VerificationItemTechnicalProblem.vue'

export default {
    name: 'VerificationItem',
    components: {
        ShadowItem,
        VerificationItemRevoked,
        VerificationItemRevokedUnverified,
        VerificationItemNotFound,
        VerificationItemUnverifiedIssuer,
        VerificationItemVerified,
        VerificationItemTechnicalProblem
    },
    props: {
        verificationItem: {
            type: Object,
            required: true
        }
    },
    computed: {
        verificationItemType() {
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
                    return 'VerificationItemUnverifiedIssuer'

                case VERIFICATION_TYPES.V_VERIFIED:
                    return 'VerificationItemVerified'
            }

            return 'VerificationItemTechnicalProblem'
        }
    }
}
</script>
