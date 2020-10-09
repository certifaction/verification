<template>
    <BaseCard>
        <template #header>
            <div class="icon">
                <MDIcon :icon="mdiFileDocument" class="icon-verified"/>
            </div>
            <div class="title">
                <div class="filename">{{ verificationItem.name }}</div>
            </div>
        </template>
        <template #body>
            <ResultDetail />
        </template>
        <template #footer>
            <div class="left"></div>
            <div class="right">
                <button class="btn secondary">
                    <span>{{ _$t('verification.card.btn.expertInfo') }}</span>
                </button>
                <button class="btn secondary">
                    <span>{{ _$t('verification.card.btn.questions') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import { VERIFICATION_TYPES } from '@certifaction/verification-core'
import BaseCard from './BaseCard.vue'
import ResultDetail from '../ResultDetail'
import i18nWrapperMixin from '../../../../../mixins/i18n-wrapper'
import { mdiShieldCheck, mdiFileDocument } from '@mdi/js'
import MDIcon from '../../../../MDIcon'

export default {
    name: 'VerificationCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard,
        ResultDetail,
        MDIcon
    },
    data() {
        return {
            mdiShieldCheck,
            mdiFileDocument
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
