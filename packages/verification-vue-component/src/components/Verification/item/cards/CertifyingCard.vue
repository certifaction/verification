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
                <div v-if="verificationItem.hash" class="section document-hash">
                    <div class="label">{{ _$t('verification.result.meta.documentHash') }}</div>
                    <div class="value">
                        <span>{{ verificationItem.hash }}</span>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].on_blockchain"
                     class="section smart-contract-address">
                    <div class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/address/${registerEvents[0].on_blockchain.contract_address}`"
                           target="_blank">{{ registerEvents[0].on_blockchain.contract_address }}</a>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].issuer.id"
                     class="section issuer-address">
                    <div class="label">{{ _$t('verification.result.meta.issuerAddress') }}</div>
                    <div class="value">
                        <span>{{ registerEvents[0].issuer.id }}</span>
                    </div>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].on_blockchain"
                     class="section registration-hash">
                    <div class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/tx/${registerEvents[0].on_blockchain.tx_hash}`"
                           target="_blank">{{ registerEvents[0].on_blockchain.tx_hash }}</a>
                    </div>
                </div>
                <div v-if="revokeEvents.length > 0 && revokeEvents[0].on_blockchain"
                     class="section revocation-hash">
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
                <div v-if="registerEvents.length > 0" class="section issuer">
                    <span class="label">{{ _$t('verification.result.meta.issuer') }}</span>

                    <DataPanel :icon-src="(registerEvents[0].scope !== 'certify') ? iconUser : null"
                               :md-icon="(registerEvents[0].scope === 'certify') ? mdiDomain : null"
                               :title="issuerDisplayName(registerEvents[0])">
                        <EventDetails :event="registerEvents[0]"/>
                    </DataPanel>
                </div>

                <div v-if="registerEvents.length > 0 && registerEvents[0].date"
                     class="section registration-date">
                    <span class="label">{{ _$t('verification.result.meta.registrationDate') }}</span>
                    <DataPanel :md-icon="mdiCalendarClock"
                               :title="_$d(new Date(registerEvents[0].date), 'long')"/>
                </div>

                <div v-if="revokeEvents.length > 0 && revocationDate"
                     class="section revocation-date">
                    <span class="label">{{ _$t('verification.result.meta.revocationDate') }}</span>
                    <DataPanel :md-icon="mdiClose"
                               :title="revocationDate"/>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="left">
                <button v-if="showExpertInfo" class="btn btn-secondary" @click="showExpertInfo = !showExpertInfo">
                    <span>{{ _$t('verification.card.btn.back') }}</span>
                </button>
            </div>
            <div class="right">
                <button class="btn btn-secondary" @click="toggleHelp('support')">
                    <span>{{ _$t('verification.card.btn.support') }}</span>
                </button>
                <button v-if="!showExpertInfo" class="btn btn-secondary" @click="showExpertInfo = !showExpertInfo">
                    <span>{{ _$t('verification.card.btn.expertInfo') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import { mdiAlertCircle, mdiCalendarClock, mdiClose, mdiDomain, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import BaseCard from './BaseCard.vue'
import ResultDetail from '../ResultDetail.vue'
import MDIcon from '../../../MDIcon.vue'
import DataPanel from '../DataPanel.vue'
import EventDetails from '../EventDetails.vue'

import iconUser from '../../../../assets/img/icon_user.svg'

export default {
    name: 'CertifyingCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard,
        ResultDetail,
        MDIcon,
        DataPanel,
        EventDetails
    },
    inject: ['isBeforeDetailedVerifiedMigration', 'issuerDisplayName'],
    data() {
        return {
            mdiAlertCircle,
            mdiCalendarClock,
            mdiClose,
            mdiDomain,
            mdiFileDocument,
            mdiShieldCheck,
            iconUser,
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
