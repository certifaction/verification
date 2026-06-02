<template>
    <BaseCard>
        <template v-if="verificationItem.name" #header>
            <div class="icon">
                <MDIcon :icon="mdiFileDocument" class="icon-verified" />
            </div>
            <div class="title">
                <div class="filename">{{ verificationItem.name }}</div>
            </div>
        </template>
        <template v-if="showExpertInfo" #body>
            <div class="verification-info expert">
                <div v-if="verificationItem.hash" class="section document-hash">
                    <div class="label">{{ _$t('verification.result.meta.documentHash') }}</div>

                    <DataPanel :key="`expert-${verificationItem.hash}`">
                        {{ verificationItem.hash }}
                    </DataPanel>
                </div>
                <div
                    v-if="latestRegisterEvent && latestRegisterEvent.on_blockchain"
                    class="section smart-contract-address">
                    <div class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</div>

                    <DataPanel :key="`expert-${latestRegisterEvent.on_blockchain.contract_address}`">
                        <a
                            :href="`${ethScanUrl}/address/${latestRegisterEvent.on_blockchain.contract_address}`"
                            target="_blank">
                            {{ latestRegisterEvent.on_blockchain.contract_address }}
                        </a>
                    </DataPanel>
                </div>
                <div v-if="latestRegisterEvent && latestRegisterEvent.issuer.id" class="section issuer-address">
                    <div class="label">{{ _$t('verification.result.meta.issuerAddress') }}</div>

                    <DataPanel :key="`expert-${latestRegisterEvent.issuer.id}`">
                        {{ latestRegisterEvent.issuer.id }}
                    </DataPanel>
                </div>
                <div v-if="latestRegisterEvent && latestRegisterEvent.on_blockchain" class="section registration-hash">
                    <div class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</div>

                    <DataPanel :key="`expert-${latestRegisterEvent.ref}`">
                        <a :href="`${ethScanUrl}/tx/${latestRegisterEvent.on_blockchain.tx_hash}`" target="_blank">
                            {{ latestRegisterEvent.on_blockchain.tx_hash }}
                        </a>
                    </DataPanel>
                </div>
                <div
                    v-if="documentRevoked && latestRevokeEvent && latestRevokeEvent.on_blockchain"
                    class="section revocation-hash">
                    <div class="label">{{ _$t('verification.result.meta.revocationTransaction') }}</div>

                    <DataPanel :key="`expert-${latestRevokeEvent.ref}`">
                        <a :href="`${ethScanUrl}/tx/${latestRevokeEvent.on_blockchain.tx_hash}`" target="_blank">
                            {{ latestRevokeEvent.on_blockchain.tx_hash }}
                        </a>
                    </DataPanel>
                </div>
            </div>
        </template>
        <template v-else #body>
            <ResultDetail
                verification-mode="certifying"
                :has-unverified-issuer="hasUnverifiedIssuer"
                :has-verified-issuer="hasVerifiedIssuer"
                :document-registration-in-progress="registrationInProgress"
                :document-revoked="documentRevoked"
                :document-revocation-in-progress="revocationInProgress"
                :document-revocation-date="revocationDate" />

            <div class="verification-info">
                <div v-if="latestRegisterEvent" class="section issuer">
                    <span class="label">{{ _$t('verification.result.meta.issuer') }}</span>

                    <DataPanel
                        :key="latestRegisterEvent.ref"
                        :icon-src="latestRegisterEvent.scope !== 'certify' ? iconUser : null"
                        :md-icon="latestRegisterEvent.scope === 'certify' ? mdiDomain : null"
                        :title="latestRegisterEvent.issuer.name">
                        <EventDetails :event="latestRegisterEvent" />
                    </DataPanel>
                </div>

                <div v-if="latestRegisterEvent && latestRegisterEvent.date" class="section registration-date">
                    <span class="label">{{ _$t('verification.result.meta.registrationDate') }}</span>

                    <DataPanel
                        :key="latestRegisterEvent.date"
                        :md-icon="mdiCalendarClock"
                        :title="_$d(new Date(latestRegisterEvent.date), 'long')" />
                </div>

                <div v-if="documentRevoked && revocationDate" class="section revocation-date">
                    <span class="label">{{ _$t('verification.result.meta.revocationDate') }}</span>

                    <DataPanel :key="latestRevokeEvent.date" :md-icon="mdiClose" :title="revocationDate" />
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

<script lang="ts">
import { defineComponent } from 'vue'
import { mdiAlertCircle, mdiCalendarClock, mdiClose, mdiDomain, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper.ts'
import ResultDetail from '../ResultDetail.vue'
import MDIcon from '../../../MDIcon.vue'
import DataPanel from '../DataPanel.vue'
import EventDetails from '../EventDetails.vue'
import iconUser from '../../../../assets/img/icon_user.svg'
import BaseCard from './BaseCard.vue'

export default defineComponent({
    name: 'CertifyingCard',
    components: {
        BaseCard,
        ResultDetail,
        MDIcon,
        DataPanel,
        EventDetails,
    },
    mixins: [i18nWrapperMixin],
    props: {
        verificationItem: {
            type: Object,
            required: true,
        },
        ethScanUrl: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            mdiAlertCircle,
            mdiCalendarClock,
            mdiClose,
            mdiDomain,
            mdiFileDocument,
            mdiShieldCheck,
            iconUser,
            showExpertInfo: false,
        }
    },
    computed: {
        registerEvents() {
            if (!Array.isArray(this.verificationItem.events)) {
                return []
            }

            const events = this.verificationItem.events.filter(
                (event) => ['register', 'certify'].indexOf(event.scope) >= 0,
            )
            events.sort((a, b) => (a.date > b.date ? 1 : -1))

            return events
        },
        latestRegisterEvent() {
            if (!this.registerEvents.length) {
                return null
            }

            return this.registerEvents[this.registerEvents.length - 1]
        },
        revokeEvents() {
            if (!Array.isArray(this.verificationItem.events)) {
                return []
            }

            const events = this.verificationItem.events.filter((event) => event.scope === 'revoke')
            events.sort((a, b) => (a.date > b.date ? 1 : -1))

            return events
        },
        latestRevokeEvent() {
            if (!this.revokeEvents.length) {
                return null
            }

            return this.revokeEvents[this.revokeEvents.length - 1]
        },
        registrationInProgress() {
            return this.registerEvents.filter((event) => !event.on_blockchain).length > 0
        },
        revocationInProgress() {
            return this.revokeEvents.filter((event) => !event.on_blockchain).length > 0
        },
        documentRevoked() {
            if (!this.latestRegisterEvent || !this.latestRevokeEvent) {
                return false
            }

            return this.latestRegisterEvent.date < this.latestRevokeEvent.date
        },
        revocationDate() {
            if (!this.documentRevoked || !this.latestRevokeEvent) {
                return null
            }

            const revocationDate = new Date(this.latestRevokeEvent.date)
            if (!isNaN(revocationDate.valueOf())) {
                return this._$d(revocationDate, 'long')
            }

            return this.latestRevokeEvent.date
        },
        hasUnverifiedIssuer() {
            return (
                this.registerEvents.filter(
                    (event) => event.issuer.email_verified === true && !event.issuer.name_verified,
                ).length > 0
            )
        },
        hasVerifiedIssuer() {
            return (
                this.registerEvents.filter(
                    (event) =>
                        event.issuer.name_verified === true ||
                        (event.issuer.email_verified === undefined && !!event.issuer.verified_by),
                ).length > 0
            )
        },
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        },
    },
})
</script>
