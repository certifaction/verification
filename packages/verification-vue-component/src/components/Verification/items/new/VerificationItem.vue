<template>
    <div class="item-container">
        <VerificationCard :verification-item="verificationItem" />
    </div>
</template>

<script>
import { VERIFICATION_TYPES } from '@certifaction/verification-core'
import VerificationCard from './cards/VerificationCard.vue'

export default {
    name: 'VerificationItem',
    components: {
        VerificationCard
    },
    props: {
        verificationItem: {
            type: Object,
            required: true
        }
    },
    computed: {
        verificationItemType() {
            if (this.verificationItem.error) {
                return 'technicalProblem'
            }

            if (this.verificationItem.hashed === undefined || this.verificationItem.hashed === false) {
                return 'ShadowItem'
            }

            switch (this.verificationItem.type) {
                case VERIFICATION_TYPES.V_REVOKED:
                    if (this.verificationItem.issuerVerified) {
                        return 'revoked'
                    }
                    return 'revokedUnverified'

                case VERIFICATION_TYPES.V_NOT_FOUND:
                    return 'notFound'

                case VERIFICATION_TYPES.V_SELF_DECLARED:
                    return 'unverifiedIssuer'

                case VERIFICATION_TYPES.V_VERIFIED:
                    return 'verified'
            }

            return 'technicalProblem'
        }
    }
}
</script>
