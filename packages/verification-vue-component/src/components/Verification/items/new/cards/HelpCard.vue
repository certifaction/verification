<template>
    <div class="item-container">
        <BaseItem>
            <template #header>
                <div class="icon">
                    <MDIcon :icon="mdiShieldCheck" class="icon-verified"/>
                </div>
                <div class="title">
                    <div class="filename">{{ verificationItem.name }}</div>
                </div>
            </template>
        </BaseItem>
    </div>
</template>

<script>
import { VERIFICATION_TYPES } from '@certifaction/verification-core'
import BaseItem from './BaseItem.vue'
import { mdiShieldCheck } from '@mdi/js'
import MDIcon from '../../../../MDIcon'

export default {
    name: 'HelpCard',
    components: {
        BaseItem,
        MDIcon
    },
    data() {
        return {
            mdiShieldCheck
        }
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
