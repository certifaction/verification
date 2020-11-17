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
        <template v-if="showExpertInfo && !isErrorOrNotFound" #body>
            <div class="verification-info expert">
                <div v-if="verificationItem.hash" class="verification-entry fingerprint">
                    <span class="label">{{ _$t('verification.result.meta.fingerprint') }}</span>
                    <span class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </span>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].issuerAddress" class="verification-entry issuer-address">
                    <span class="label">{{ _$t('verification.result.meta.issuerAddress') }}</span>
                    <span class="value">
                        <span>{{ registerEvents[0].issuerAddress }}</span>
                    </span>
                </div>
                <div v-if="registerEvents.length > 0" class="verification-entry smart-contract-address">
                    <span class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/address/${registerEvents[0].smartContractAddress}`"
                               target="_blank">{{ registerEvents[0].smartContractAddress }}</a>
                        </span>
                    </span>
                </div>
                <div v-if="registerEvents.length > 0 && verificationItem.status !== 'registering'" class="verification-entry registration-hash">
                    <span class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/tx/${registerEvents[0].transactionHash}`"
                               target="_blank">{{ registerEvents[0].transactionHash }}</a>
                        </span>
                    </span>
                </div>
                <div v-if="revokeEvents.length > 0 && verificationItem.status !== 'revoking'" class="verification-entry revocation-hash">
                    <span class="label">{{ _$t('verification.result.meta.revocationTransaction') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/tx/${revokeEvents[0].transactionHash}`"
                               target="_blank">{{ revokeEvents[0].transactionHash }}</a>
                        </span>
                    </span>
                </div>
            </div>
        </template>
        <template v-else #body>
            <ResultDetail :verification-result="verificationItemType"
                          :verification-in-progress="verificationItem.status && verificationItem.status === 'registering'"
                          :revocation-in-progress="verificationItem.status && verificationItem.status === 'revoking'"
                          :revocation-date="verificationItem.revoked ? revokeEvents[0].date : null"/>
            <div class="verification-info">
                <div v-if="isErrorOrNotFound" class="verification-entry error">
                    <p v-html="_$t('verification.result.verification.' + verificationItemType + '.details')"/>
                </div>
                <div v-if="isErrorOrNotFound && verificationItem.hash" class="verification-entry fingerprint">
                    <span class="label">{{ _$t('verification.result.meta.fingerprint') }}</span>
                    <span class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </span>
                </div>
                <div v-if="!isErrorOrNotFound && registerEvents.length > 0" class="verification-entry issuer">
                    <span class="label">{{ _$t('verification.result.meta.issuer') }}</span>
                    <span class="value">
                            <span>{{ registerEvents[0].issuer }}</span>
                    </span>
                    <span v-if="registerEvents.length > 0 && !registerEvents[0].identityVerifier" class="footnote warning">
                        <MDIcon :icon="mdiAlertCircle"/>
                        <span>{{ _$t('verification.result.verification.unverifiedIssuer.issuerFootnote') }}</span>
                    </span>
                </div>
                <div v-if="!isErrorOrNotFound && registerEvents.length > 0 && registerEvents[0].identityVerifier" class="verification-entry verifier">
                    <div class="verifier-name">
                        <span class="label">{{ _$t('verification.result.meta.issuerVerifiedBy') }}</span>
                        <div v-if="registerEvents[0].identityVerifier.image" class="verifier-image">
                            <!-- Workaround because old verification tool should still use the old switch logo but the redesign should use a new switch logo, needs to be removed when event structure is final -->
                            <img :src="(registerEvents[0].identityVerifier.image).split('.png')[0] + '_redesign.png'" alt=""/>
                        </div>
                        <span v-else class="value">
                            <span>{{
                                    registerEvents[0].identityVerifier.name ? registerEvents[0].identityVerifier.name : 'Certifaction AG'
                                }}</span>
                        </span>
                    </div>
                </div>
                <div v-if="!isErrorOrNotFound && registerEvents.length > 0 && verificationItem.status !== 'registering'" class="verification-entry registration-date">
                    <span class="label">{{ _$t('verification.result.meta.registrationDate') }}</span>
                    <span class="value">{{ dateFormat(registerEvents[0].date) }}</span>
                </div>
                <div v-if="!isErrorOrNotFound && revokeEvents.length > 0 && verificationItem.status !== 'revoking'" class="verification-entry revocation-date">
                    <span class="label">{{ _$t('verification.result.meta.revocationDate') }}</span>
                    <span class="value">{{ dateFormat(revokeEvents[0].date) }}</span>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="left">
                <button v-if="showExpertInfo" class="btn secondary" @click="showExpertInfo = !showExpertInfo">
                    <span>{{ _$t('verification.card.btn.back') }}</span>
                </button>
            </div>
            <div class="right">
                <template v-if="isErrorOrNotFound">
                    <button class="btn primary" @click="toggleHelp('contact')">
                        <span>{{ _$t('verification.card.btn.support') }}</span>
                    </button>
                    <button v-if="verificationItemType === 'technicalProblem'"
                            class="btn secondary"
                            @click="toggleHelp('faq')">
                        <span>{{ _$t('verification.card.btn.questions') }}</span>
                    </button>
                </template>
                <template v-else>
                    <button v-if="!showExpertInfo" class="btn secondary" @click="showExpertInfo = !showExpertInfo">
                        <span>{{ _$t('verification.card.btn.expertInfo') }}</span>
                    </button>
                    <button class="btn secondary" @click="toggleHelp('faq')">
                        <span>{{ _$t('verification.card.btn.questions') }}</span>
                    </button>
                </template>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import { VERIFICATION_TYPES } from '@certifaction/verification-core'
import BaseCard from './BaseCard.vue'
import ResultDetail from '../ResultDetail.vue'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import dateFormatter from '../../../../mixins/date-formatter'
import { mdiAlertCircle, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
import MDIcon from '../../../MDIcon.vue'

export default {
    name: 'VerificationCard',
    mixins: [i18nWrapperMixin, dateFormatter],
    components: {
        BaseCard,
        ResultDetail,
        MDIcon
    },
    data() {
        return {
            mdiShieldCheck,
            mdiFileDocument,
            mdiAlertCircle,
            showExpertInfo: false
        }
    },
    props: {
        verificationItem: {
            type: Object,
            required: true
        },
        net: {
            type: String,
            required: true
        }
    },
    computed: {
        registerEvents() {
            return this.verificationItem.events ? this.verificationItem.events.filter(event => ['register', 'certify'].indexOf(event.scope) >= 0) : null
        },
        revokeEvents() {
            return this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'revoke') : null
        },
        verificationItemType() {
            if (this.verificationItem.hashed === undefined || this.verificationItem.hashed === false) {
                return 'ShadowItem'
            }

            if (this.verificationItem.offchainError && this.verificationItem.error) {
                return 'technicalProblem'
            }

            switch (this.verificationItem.type) {
                case VERIFICATION_TYPES.V_REVOKED:
                    if (this.registerEvents[0].identityVerifier) {
                        return 'revokedVerified'
                    }
                    return 'revokedUnverified'

                case VERIFICATION_TYPES.V_NOT_FOUND:
                    return 'notFound'

                case VERIFICATION_TYPES.V_SELF_DECLARED:
                    return 'unverifiedIssuer'

                case VERIFICATION_TYPES.V_VERIFIED:
                    return 'verifiedIssuer'
            }

            return 'technicalProblem'
        },
        isErrorOrNotFound() {
            return this.verificationItemType === 'notFound' || this.verificationItemType === 'technicalProblem'
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
