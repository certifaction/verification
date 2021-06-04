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
                <div v-if="signEvents.length > 0 && signEvents[0].on_blockchain"
                     class="section smart-contract-address">
                    <div class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/address/${signEvents[0].on_blockchain.contract_address}`"
                           target="_blank">{{ signEvents[0].on_blockchain.contract_address }}</a>
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
                <div v-if="signEvents.length > 0" class="section signature-hashes">
                    <div class="label">{{ _$t('verification.result.meta.signatureTransactions') }}</div>
                    <div class="value">
                        <div class="signature-hash" v-for="(signEvent, index) in signEvents" :key="index">
                            <span>{{ issuerDisplayName(signEvent) }}</span>
                            <a v-if="signEvent.on_blockchain"
                               :href="`https://${net}/tx/${signEvent.on_blockchain.tx_hash}`"
                               target="_blank">{{ signEvent.on_blockchain.tx_hash }}</a>
                        </div>
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
            <ResultDetail verification-mode="signing"
                          :document-revoked="revokeEvents.length > 0"
                          :document-revocation-in-progress="revocationInProgress"
                          :document-revocation-date="revocationDate"
                          :signatures-in-progress="signaturesInProgress"
                          :has-unverified-signer="hasUnverifiedSigner"
                          :has-verified-signer="hasVerifiedSigner"
                          :signer-count="signEvents.length"/>

            <div class="verification-info">
                <div v-if="signEvents.length > 0" class="section signatures">
                    <span class="label">{{ _$tc('verification.result.meta.signature', signEvents.length) }}</span>

                    <div class="signature-list">
                        <DataEntry v-for="(signEvent, index) in signEvents"
                                   :key="index"
                                   :icon-src="iconSignature"
                                   :title="issuerDisplayName(signEvent)"
                                   :event="signEvent"/>
                    </div>
                </div>

                <div class="section signature-type">
                    <span class="label">{{ _$t('verification.result.meta.signatureType') }}</span>

                    <DataEntry :icon-src="iconFingerprint" title="Blockchain eSignature">
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt
                        ut labore et dolore magna aliquyam erat, sed diam voluptua.
                    </DataEntry>
                </div>

                <div v-if="initiator" class="section initiator">
                    <span class="label">{{ _$t('verification.result.meta.initiator') }}</span>

                    <DataEntry :icon-src="iconUser"
                               :title="issuerDisplayName(initiator)"
                               :event="initiator"/>
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
import { mdiAlertCircle, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import BaseCard from './BaseCard.vue'
import ResultDetail from '../ResultDetail.vue'
import MDIcon from '../../../MDIcon.vue'
import DataEntry from '../DataEntry.vue'

import iconSignature from '../../../../assets/img/icon_signature.svg'
import iconFingerprint from '../../../../assets/img/icon_fingerprint.svg'
import iconUser from '../../../../assets/img/icon_user.svg'

export default {
    name: 'SigningCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard,
        ResultDetail,
        MDIcon,
        DataEntry
    },
    inject: ['isBeforeDetailedVerifiedMigration', 'issuerDisplayName'],
    data() {
        return {
            mdiShieldCheck,
            mdiFileDocument,
            mdiAlertCircle,
            iconSignature,
            iconFingerprint,
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
            return this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'register') : []
        },
        revokeEvents() {
            return this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'revoke') : []
        },
        signEvents() {
            const signEvents = this.verificationItem.events ? this.verificationItem.events.filter(event => event.scope === 'sign') : []
            if (signEvents.length > 1) {
                signEvents.sort((a, b) => {
                    const aDate = (a.date) ? new Date(a.date) : null
                    const bDate = (b.date) ? new Date(b.date) : null

                    if (aDate < bDate) {
                        return -1
                    }
                    if (aDate > bDate) {
                        return 1
                    }

                    return 0
                })
            }
            return signEvents
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
        signaturesInProgress() {
            return this.signEvents.filter(event => !event.on_blockchain).length
        },
        hasUnverifiedSigner() {
            return this.signEvents.filter(event => !event.issuer.verified).length > 0
        },
        hasVerifiedSigner() {
            return this.signEvents.filter(event => !!event.issuer.verified).length > 0
        },
        initiator() {
            if (this.registerEvents.length > 0) {
                return this.registerEvents[0]
            }

            return null
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
