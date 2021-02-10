<template>
    <BaseCard>
        <template v-if="verificationItem.name" #header>
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
                    <div class="label">{{ _$t('verification.result.meta.fingerprint') }}</div>
                    <div class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].issuerAddress"
                     class="verification-entry issuer-address">
                    <div class="label">{{ _$t('verification.result.meta.issuerAddress') }}</div>
                    <div class="value">
                        <span>{{ registerEvents[0].issuerAddress }}</span>
                    </div>
                </div>
                <div v-if="signEvents.length > 0 && signEvents[0].smartContractAddress"
                     class="verification-entry smart-contract-address">
                    <div class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/address/${signEvents[0].smartContractAddress}`"
                           target="_blank">{{ signEvents[0].smartContractAddress }}</a>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && verificationItem.status !== 'revoking' && registerEvents[0].transactionHash"
                     class="verification-entry registration-hash">
                    <div class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/tx/${registerEvents[0].transactionHash}`"
                           target="_blank">{{ registerEvents[0].transactionHash }}</a>
                    </div>
                </div>
                <div v-if="revokeEvents.length > 0 && verificationItem.status !== 'revoking' && revokeEvents[0].transactionHash"
                     class="verification-entry revocation-hash">
                    <div class="label">{{ _$t('verification.result.meta.revocationTransaction') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/tx/${revokeEvents[0].transactionHash}`"
                           target="_blank">{{ revokeEvents[0].transactionHash }}</a>
                    </div>
                </div>
                <div v-if="signEvents.length > 0" class="verification-entry signature-hashes">
                    <div class="label">{{ _$t('verification.result.meta.signatureTransactions') }}</div>
                    <div class="value">
                        <div class="signature-hash" v-for="(signerEvent, index) in signEvents" :key="index">
                            <span>{{ signerEvent.issuer }}</span>
                            <a v-if="signerEvent.transactionHash"
                               :href="`https://${net}/tx/${signerEvent.transactionHash}`"
                               target="_blank">{{ signerEvent.transactionHash }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else #body>
            <ResultDetail verification-mode="signing"
                          :document-revoked="verificationItem.revoked"
                          :document-revocation-in-progress="revocationInProgress"
                          :document-revocation-date="verificationItem.revoked ? revokeEvents[0].date : null"
                          :signatures-in-progress="signaturesInProgress"
                          :has-unverified-signer="hasUnverifiedSigner"
                          :has-verified-signer="hasVerifiedSigner"
                          :signer-count="signEvents.length"/>
            <div class="verification-info">
                <div v-if="signEvents.length > 0" class="verification-entry signers">
                    <span class="label">{{ _$t('verification.result.meta.signers') }}</span>
                    <ul class="signers-list">
                        <li class="signer" v-for="(signEvent, index) in signEvents" :key="index">
                            <div class="left">
                                <MDIcon class="signed" :icon="mdiCheckCircle"/>
                            </div>
                            <div class="right">
                                <div class="value">
                                    <span>{{ signEvent.issuer }}</span>
                                </div>
                                <div v-if="signEvent.date" class="footnote">
                                    <span>{{
                                            _$t(`verification.result.signing.${verificationItemType}.signerFootnote.signed`, {
                                                signingDate: _$d(signEvent.date, 'short')
                                            })
                                        }}</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-if="singleIdentityVerifier" class="verification-entry verifier">
                    <div class="verifier-name">
                        <div class="label">{{ _$t('verification.result.meta.signersVerifiedBy') }}</div>
                        <div v-if="singleIdentityVerifier.image" class="verifier-image">
                            <!-- Workaround because old verification tool should still use the old switch logo but the redesign should use a new switch logo, needs to be removed when event structure is final -->
                            <img :src="(singleIdentityVerifier.image).split('.png')[0] + '_redesign.png'"
                                 :alt="singleIdentityVerifier.name"
                                 :title="singleIdentityVerifier.name"/>
                        </div>
                        <div v-else class="value">
                            <span>{{ singleIdentityVerifier.name }}</span>
                        </div>
                    </div>
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
                <button v-if="!showExpertInfo" class="btn secondary" @click="showExpertInfo = !showExpertInfo">
                    <span>{{ _$t('verification.card.btn.expertInfo') }}</span>
                </button>
                <button class="btn secondary" @click="toggleHelp('faq')">
                    <span>{{ _$t('verification.card.btn.questions') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import BaseCard from './BaseCard.vue'
import ResultDetail from '../ResultDetail.vue'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import { mdiAlertCircle, mdiCheckCircle, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
import MDIcon from '../../../MDIcon.vue'

export default {
    name: 'SigningCard',
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
            mdiCheckCircle,
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
            return this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'register') : []
        },
        revokeEvents() {
            return this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'revoke') : []
        },
        signEvents() {
            return this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'sign') : []
        },
        revocationInProgress() {
            return this.revokeEvents.filter(event => !event.transactionHash).length > 0
        },
        signaturesInProgress() {
            return this.signEvents.filter(event => !event.transactionHash).length
        },
        hasUnverifiedSigner() {
            return this.signEvents.filter(event => !event.identityVerifier).length > 0
        },
        hasVerifiedSigner() {
            return this.signEvents.filter(event => !!event.identityVerifier).length > 0
        },
        verificationItemType() {
            if (this.hasUnverifiedSigner) {
                return 'unverifiedSigner'
            }

            if (this.hasVerifiedSigner) {
                return 'verifiedSigner'
            }

            return 'unknown'
        },
        singleIdentityVerifier() {
            if (!this.hasVerifiedSigner) {
                return null
            }

            const verifiedSignEvents = this.signEvents.filter(event => !!event.identityVerifier)

            if (verifiedSignEvents.length !== this.signEvents.length) {
                return null
            }

            const identityVerifiers = verifiedSignEvents.map(event => event.identityVerifier)
            const uniqueIdentityVerifiers = identityVerifiers.filter(
                (event, index) => identityVerifiers.findIndex(obj => obj.name === event.name) === index
            )

            if (uniqueIdentityVerifiers.length > 1) {
                return null
            }

            return uniqueIdentityVerifiers[0]
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
