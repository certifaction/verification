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
                <div v-if="registerEvents.length > 0 && registerEvents[0].issuer.id"
                     class="verification-entry issuer-address">
                    <div class="label">{{ _$t('verification.result.meta.issuerAddress') }}</div>
                    <div class="value">
                        <span>{{ registerEvents[0].issuer.id }}</span>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].on_blockchain"
                     class="verification-entry smart-contract-address">
                    <div class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/address/${registerEvents[0].on_blockchain.contract_address}`"
                           target="_blank">{{ registerEvents[0].on_blockchain.contract_address }}</a>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].on_blockchain"
                     class="verification-entry registration-hash">
                    <div class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/tx/${registerEvents[0].on_blockchain.tx_hash}`"
                           target="_blank">{{ registerEvents[0].on_blockchain.tx_hash }}</a>
                    </div>
                </div>
                <div v-if="revokeEvents.length > 0 && revokeEvents[0].on_blockchain"
                     class="verification-entry revocation-hash">
                    <div class="label">{{ _$t('verification.result.meta.revocationTransaction') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/tx/${revokeEvents[0].on_blockchain.tx_hash}`"
                           target="_blank">{{ revokeEvents[0].on_blockchain.tx_hash }}</a>
                    </div>
                </div>
            </div>
        </template>
        <template v-else #body>
            <ResultDetail verification-mode="certifying"
                          :has-unverified-issuer="hasUnverifiedIssuer"
                          :has-verified-issuer="hasVerifiedIssuer"
                          :document-registration-in-progress="registrationInProgress"
                          :document-revoked="revokeEvents.length > 0"
                          :document-revocation-in-progress="revocationInProgress"
                          :document-revocation-date="revocationDate"/>
            <div class="verification-info">
                <div v-if="registerEvents.length > 0" class="verification-entry issuer">
                    <div class="label">{{ _$t('verification.result.meta.issuer') }}</div>
                    <div class="value">
                        <span>{{ registerEvents[0].issuer.name }}</span>
                    </div>
                    <div v-if="registerEvents.length > 0 && !registerEvents[0].issuer.verified" class="footnote warning">
                        <MDIcon :icon="mdiAlertCircle"/>
                        <span>{{ _$t('verification.result.certifying.unverifiedIssuer.issuerFootnote') }}</span>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].issuer.verified_by"
                     class="verification-entry verifier">
                    <div class="verifier-name">
                        <div class="label">{{ _$t('verification.result.meta.issuerVerifiedBy') }}</div>
                        <div v-if="registerEvents[0].issuer.verified_by.image" class="verifier-image">
                            <!-- Workaround because old verification tool should still use the old switch logo but the redesign should use a new switch logo, needs to be removed when event structure is final -->
                            <img :src="(registerEvents[0].issuer.verified_by.image).split('.png')[0] + '_redesign.png'"
                                 alt=""/>
                        </div>
                        <div v-else class="value">
                            <span>{{ registerEvents[0].issuer.verified_by.name }}</span>
                        </div>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].on_blockchain && registerEvents[0].date"
                     class="verification-entry registration-date">
                    <div class="label">{{ _$t('verification.result.meta.registrationDate') }}</div>
                    <div class="value">{{ _$d(new Date(registerEvents[0].date), 'long') }}</div>
                </div>
                <div v-if="revokeEvents.length > 0 && revokeEvents[0].on_blockchain && revocationDate"
                     class="verification-entry revocation-date">
                    <div class="label">{{ _$t('verification.result.meta.revocationDate') }}</div>
                    <div class="value">{{ revocationDate }}</div>
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
import { mdiAlertCircle, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
import MDIcon from '../../../MDIcon.vue'

export default {
    name: 'CertifyingCard',
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
        },
        net: {
            type: String,
            required: true
        }
    },
    computed: {
        registerEvents() {
            return this.verificationItem.events ? this.verificationItem.events.filter(event => ['register', 'certify'].indexOf(event.scope) >= 0) : []
        },
        revokeEvents() {
            return this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'revoke') : []
        },
        registrationInProgress() {
            return this.registerEvents.filter(event => !event.on_blockchain).length > 0
        },
        revocationInProgress() {
            return this.revokeEvents.filter(event => !event.on_blockchain).length > 0
        },
        revocationDate() {
            if (this.revokeEvents.length === 0) {
                return null
            }

            const revocationDate = new Date(this.revokeEvents[0].date)
            if (!isNaN(revocationDate)) {
                return this._$d(revocationDate, 'long')
            }

            return this.revokeEvents[0].date
        },
        hasUnverifiedIssuer() {
            return this.registerEvents.filter(event => !event.issuer.verified_by).length > 0
        },
        hasVerifiedIssuer() {
            return this.registerEvents.filter(event => !!event.issuer.verified_by).length > 0
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
