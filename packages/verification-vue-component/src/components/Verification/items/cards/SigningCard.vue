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
            <div class="verification-info expert">
                <div v-if="verificationItem.hash" class="verification-entry fingerprint">
                    <span class="label">{{ _$t('verification.result.meta.fingerprint') }}</span>
                    <span class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </span>
                </div>
                <div v-if="signEvents[0] > 0 && signEvents[0].issuerAddress" class="verification-entry issuer-address">
                    <span class="label">{{ _$t('verification.result.meta.issuerAddress') }}</span>
                    <span class="value">
                        <span>{{ signEvents[0].issuerAddress }}</span>
                    </span>
                </div>
                <div v-if="signEvents.length > 0" class="verification-entry smart-contract-address">
                    <span class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/address/${signEvents[0].smartContractAddress}`"
                               target="_blank">{{ signEvents[0].smartContractAddress }}</a>
                        </span>
                    </span>
                </div>
                <div v-if="signEvents.length > 0" class="verification-entry registration-hash">
                    <span class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/tx/${signEvents[0].transactionHash}`"
                               target="_blank">{{ signEvents[0].transactionHash }}</a>
                        </span>
                    </span>
                </div>
                <div v-if="revokeEvents.length > 0" class="verification-entry revocation-hash">
                    <span class="label">{{ _$t('verification.result.meta.revocationTransaction') }}</span>
                    <span class="value">
                        <span>
                            <a :href="`https://${net}/tx/${revokeEvents[0].transactionHash}`"
                               target="_blank">{{ revokeEvents[0].transactionHash }}</a>
                        </span>
                    </span>
                </div>
                <div v-if="signEvents.length > 0" class="verification-entry signature-hashes">
                    <span class="label">{{ _$t('verification.result.meta.signatureTransactions') }}</span>
                    <span class="value">
                        <span class="signature-hash" v-for="(signerEvent, index) in signEvents" :key="index">
                            <span>{{ signerEvent.issuer }}</span>
                            <a :href="`https://${net}/tx/${signerEvent.transactionHash}`"
                               target="_blank">{{ signerEvent.transactionHash }}</a>
                        </span>
                    </span>
                </div>
            </div>
        </template>
        <template v-else #body>
            <ResultDetail :verification-result="verificationItemType"
                          :verification-in-progress="verificationItem.status && verificationItem.status === 'registering'"
                          :revocation-in-progress="verificationItem.status && verificationItem.status === 'revoking'"
                          :revocation-date="verificationItem.revoked ? revokeEvents[0].date : null"
                          :is-signing="true"/>
            <div class="verification-info">
                <div v-if="isErrorOrNotFound" class="verification-entry error">
                    <p v-html="_$t('verification.result.signing.' + verificationItemType + '.details')"/>
                </div>
                <div v-if="isErrorOrNotFound && verificationItem.hash" class="verification-entry fingerprint">
                    <span class="label">{{ _$t('verification.result.meta.fingerprint') }}</span>
                    <span class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </span>
                </div>
                <div v-if="signEvents.length > 0" class="verification-entry signers">
                    <span class="label">{{ _$t('verification.result.meta.signers') }}</span>
                    <ul class="signers-list">
                        <li class="signer" v-for="(signerEvent, index) in signEvents" :key="index">
                            <div class="left">
                                <MDIcon class="signed" :icon="mdiCheckCircle"/>
                            </div>
                            <div class="right">
                                <span class="value">
                                    <span>{{ signerEvent.issuer }}</span>
                                </span>
                                <span v-if="signerEvent.date" class="footnote">
                                    <span>{{
                                            _$t('verification.result.signing.' + verificationItemType + '.signerFootnote.signed', {
                                                signingDate: dateFormat(isoStringToTimestamp(signerEvent.date), {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: '2-digit'
                                                })
                                            })
                                        }}</span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-if="signEvents.length > 0 && signEvents[0].identityVerifier" class="verification-entry verifier">
                    <div class="verifier-name">
                        <span class="label">{{ _$t('verification.result.meta.signersVerifiedBy') }}</span>
                        <div v-if="signEvents[0].identityVerifier.image" class="verifier-image">
                            <img :src="signEvents[0].identityVerifier.image" alt=""/>
                        </div>
                        <span v-else class="value">
                            <span>{{
                                    signEvents[0].identityVerifier.name ? signEvents[0].identityVerifier.name : 'Certifaction AG'
                                }}</span>
                        </span>
                    </div>
                </div>
                <div v-if="signEvents.length > 0 && verificationItem.status !== 'registering'"
                     class="verification-entry registration-date">
                    <span class="label">{{ _$t('verification.result.meta.registrationDate') }}</span>
                    <span class="value">{{ dateFormat(isoStringToTimestamp(signEvents[0].date)) }}</span>
                </div>
                <div v-if="revokeEvents.length > 0 && verificationItem.status !== 'revoking'"
                     class="verification-entry revocation-date">
                    <span class="label">{{ _$t('verification.result.meta.revocationDate') }}</span>
                    <span class="value">{{ dateFormat(isoStringToTimestamp(revokeEvents[0].date)) }}</span>
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
import { mdiAlertCircle, mdiCheckCircle, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
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
            mdiCheckCircle,
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
        signEvents() {
            return this.verificationItem.events.filter(event => event.scope === 'sign')
        },
        revokeEvents() {
            return this.verificationItem.events.filter(event => event.scope === 'revoke')
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
                    return 'revoked'

                case VERIFICATION_TYPES.V_NOT_FOUND:
                    return 'notFound'

                case VERIFICATION_TYPES.V_SELF_DECLARED:
                case VERIFICATION_TYPES.V_VERIFIED:
                    return 'signingComplete'
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
