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
        <template v-if="showExpertInfo" #body>
            <div class="verification-info expert" key="info">
                <div v-if="verificationItem.hash" class="verification-entry fingerprint">
                    <span class="label">{{ _$t('verification.result.meta.fingerprint') }}</span>
                    <span class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </span>
                </div>
                <div v-if="verificationItem.issuerAddress" class="verification-entry issuer-address">
                    <span class="label">{{ _$t('verification.result.meta.issuerAddress') }}</span>
                    <span class="value">
                        <span>{{ verificationItem.issuerAddress }}</span>
                    </span>
                </div>
                <div v-if="verificationItem.registrationEvent" class="verification-entry smart-contract-address">
                    <span class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/tx/${verificationItem.registrationEvent.address}`"
                               target="_blank">{{ verificationItem.registrationEvent.address }}</a>
                        </span>
                    </span>
                </div>
                <div v-if="verificationItem.registrationEvent" class="verification-entry registration-hash">
                    <span class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/tx/${verificationItem.registrationEvent.transactionHash}`"
                               target="_blank">{{ verificationItem.registrationEvent.transactionHash }}</a>
                        </span>
                    </span>
                </div>
                <div v-else-if="!verificationItem.onBlockchain" class="verification-entry registration-status">
                    <span class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</span>
                    <div class="status" v-html="_$t('verification.result.processing.status')"/>
                </div>
                <div v-if="verificationItem.revocationEvent" class="verification-entry revocation-hash">
                    <span class="label">{{ _$t('verification.result.meta.revocationTransaction') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/tx/${verificationItem.revocationEvent.transactionHash}`"
                               target="_blank">{{ verificationItem.revocationEvent.transactionHash }}</a>
                        </span>
                    </span>
                </div>
            </div>
        </template>
        <template v-else #body>
            <ResultDetail :verification-result="verificationItemType"
                          :verification-in-progress="!isErrorOrNotFound && !verificationItem.registrationEvent && !verificationItem.revocationEvent"/>
            <div class="verification-info" key="info">
                <div v-if="isErrorOrNotFound" class="verification-entry error">
                    <p v-html="_$t('verification.result.' + verificationItemType + '.details')" />
                </div>
                <div v-if="isErrorOrNotFound && verificationItem.hash" class="verification-entry fingerprint">
                    <span class="label">{{ _$t('verification.result.meta.fingerprint') }}</span>
                    <span class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </span>
                </div>
                <div v-if="verificationItem.issuerName" class="verification-entry issuer">
                    <span class="label">{{ _$t('verification.result.meta.issuer') }}</span>
                    <span class="value">
                            <span>{{ verificationItem.issuerName }}</span>
                    </span>
                    <span v-if="!verificationItem.issuerVerified" class="footnote">
                        <MDIcon :icon="mdiAlertCircle"/>
                        <span>{{ _$t('verification.result.unverifiedIssuer.issuerFootnote') }}</span>
                    </span>
                </div>
                <div v-if="verificationItem.issuerVerified" class="verification-entry verifier">
                    <div v-if="verificationItem.issuerVerifiedImg" class="verifier-image">
                        <img :src="verificationItem.issuerVerifiedImg" alt=""/>
                    </div>
                    <div v-else class="verifier-name">
                        <span class="label">{{ _$t('verification.result.meta.issuerVerifiedBy') }}</span>
                        <span class="value">
                                <span>{{
                                        verificationItem.issuerVerifiedBy ? verificationItem.issuerVerifiedBy : 'Certifaction AG'
                                    }}</span>
                        </span>
                    </div>
                </div>
                <div v-if="verificationItem.registrationBlock" class="verification-entry registration-date">
                    <span class="label">{{ _$t('verification.result.meta.registrationDate') }}</span>
                    <span class="value">{{ dateFormat(verificationItem.registrationBlock.timestamp) }}</span>
                </div>
                <div v-if="verificationItem.revocationBlock" class="verification-entry revocation-date">
                    <span class="label">{{ _$t('verification.result.meta.revocationDate') }}</span>
                    <span class="value">{{ dateFormat(verificationItem.revocationBlock.timestamp) }}</span>
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
                    <button class="btn primary">
                        <span>{{ _$t('verification.card.btn.support') }}</span>
                    </button>
                    <button v-if="verificationItemType === 'technicalProblem'" class="btn secondary">
                        <span>{{ _$t('verification.card.btn.questions') }}</span>
                    </button>
                </template>
                <template v-else>
                    <button v-if="!showExpertInfo" class="btn secondary" @click="showExpertInfo = !showExpertInfo">
                        <span>{{ _$t('verification.card.btn.expertInfo') }}</span>
                    </button>
                    <button class="btn secondary">
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
import { mdiAlertCircle, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
import MDIcon from '../../../MDIcon.vue'

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
            mdiFileDocument,
            mdiAlertCircle,
            showExpertInfo: false
        }
    },
    props: {
        verificationItem: {
            type: Object,
            required: true
        }
    },
    computed: {
        net() {
            if (this.$parent.$parent.certifactionEthVerifier.certifactionEthClient.eth.currentProvider.host.indexOf('ropsten') >= 0) {
                return 'ropsten.etherscan.io'
            } else {
                return 'etherscan.io'
            }
        },
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
                    return 'revokedUnverifiedIssuer'

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
        dateFormat(timestamp) {
            const date = new Date(timestamp * 1000)
            const options = {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }

            return date.toLocaleString((this.$i18n.locale) ? this.$i18n.locale : 'en', options)
        }
    }
}
</script>
