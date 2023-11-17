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
                <div v-if="signEvents.length > 0 && signEvents[0].on_blockchain" class="section smart-contract-address">
                    <div class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</div>

                    <DataPanel :key="`expert-${signEvents[0].on_blockchain.contract_address}`">
                        <a
                            :href="`${ethScanUrl}/address/${signEvents[0].on_blockchain.contract_address}`"
                            target="_blank">
                            {{ signEvents[0].on_blockchain.contract_address }}
                        </a>
                    </DataPanel>
                </div>
                <div v-if="registerEvents.length > 0 && registerEvents[0].issuer.id" class="section issuer-address">
                    <div class="label">{{ _$t('verification.result.meta.issuerAddress') }}</div>

                    <DataPanel :key="`expert-${registerEvents[0].issuer.id}`">
                        {{ registerEvents[0].issuer.id }}
                    </DataPanel>
                </div>
                <div
                    v-if="registerEvents.length > 0 && registerEvents[0].on_blockchain"
                    class="section registration-hash">
                    <div class="label">{{ _$t('verification.result.meta.registrationTransaction') }}</div>

                    <DataPanel :key="`expert-${registerEvents[0].ref}`">
                        <a :href="`${ethScanUrl}/tx/${registerEvents[0].on_blockchain.tx_hash}`" target="_blank">
                            {{ registerEvents[0].on_blockchain.tx_hash }}
                        </a>
                    </DataPanel>
                </div>
                <div v-if="signEvents.length > 0" class="section signature-details">
                    <div class="label">{{ _$t('verification.result.meta.signatureDetails') }}</div>

                    <DataPanel
                        v-for="signEvent in signEvents"
                        :key="`expert-${signEvent.ref}`"
                        :icon-src="iconSignature"
                        :title="issuerDisplayName(signEvent)">
                        <div class="transaction-hash">
                            <div class="label">{{ _$t('verification.result.meta.txHash') }}</div>
                            <a
                                v-if="signEvent.on_blockchain"
                                :href="`${ethScanUrl}/tx/${signEvent.on_blockchain.tx_hash}`"
                                target="_blank">
                                {{ signEvent.on_blockchain.tx_hash }}
                            </a>
                        </div>
                        <div v-if="signEvent.signature.level" class="signature-level">
                            <div class="label">{{ _$t('verification.result.meta.signatureLevel') }}</div>
                            <div class="value">{{ signEvent.signature.level }}</div>
                        </div>
                        <div v-if="signEvent.signature.jurisdiction" class="jurisdiction">
                            <div class="label">{{ _$t('verification.result.meta.jurisdiction') }}</div>
                            <div class="value">{{ signEvent.signature.jurisdiction }}</div>
                        </div>
                        <div v-if="signEvent.signature.level === SIGNATURE_LEVEL_QES" class="download-signature">
                            <button type="button" class="btn btn-secondary" @click="downloadQesSignature(signEvent)">
                                <img
                                    src="../../../../assets/img/icon_signature_download.svg"
                                    class="icon"
                                    alt="Download" />
                                {{ _$t('verification.result.meta.downloadSignature') }}
                            </button>
                        </div>
                    </DataPanel>
                </div>
                <div v-if="revokeEvents.length > 0 && revokeEvents[0].on_blockchain" class="section revocation-hash">
                    <div class="label">{{ _$t('verification.result.meta.revocationTransaction') }}</div>

                    <DataPanel :key="`expert-${revokeEvents[0].ref}`">
                        <template #header>
                            <a :href="`${ethScanUrl}/tx/${revokeEvents[0].on_blockchain.tx_hash}`" target="_blank">
                                {{ revokeEvents[0].on_blockchain.tx_hash }}
                            </a>
                        </template>
                    </DataPanel>
                </div>
                <div v-if="retractEvents.length > 0 && retractEvents[0].on_blockchain" class="section retraction-hash">
                    <div class="label">{{ _$t('verification.result.meta.retractionTransaction') }}</div>

                    <DataPanel :key="`expert-${retractEvents[0].ref}`">
                        <template #header>
                            <a :href="`${ethScanUrl}/tx/${retractEvents[0].on_blockchain.tx_hash}`" target="_blank">
                                {{ retractEvents[0].on_blockchain.tx_hash }}
                            </a>
                        </template>
                    </DataPanel>
                </div>
            </div>
        </template>
        <template v-else #body>
            <ResultDetail
                verification-mode="signing"
                :document-revoked="revokeEvents.length > 0"
                :document-revocation-in-progress="revocationInProgress"
                :document-revocation-date="revocationDate"
                :document-retracted="retractEvents.length > 0"
                :document-retraction-in-progress="retractionInProgress"
                :document-retraction-date="retractionDate"
                :signatures-in-progress="signaturesInProgress"
                :has-unverified-signer="hasUnverifiedSigner"
                :has-verified-signer="hasVerifiedSigner"
                :signer-count="signEvents.length" />

            <div class="verification-info">
                <div v-if="retractEvents.length > 0" class="section retraction-note">
                    <div class="label">{{ _$t('verification.result.meta.retractionNote') }}</div>
                    <div class="value">{{ retractionNote }}</div>
                </div>

                <div v-if="signEvents.length > 0" class="section signatures">
                    <span class="label">{{ _$tc('verification.result.meta.signature', signEvents.length) }}</span>

                    <div class="signature-list">
                        <DataPanel
                            v-for="signEvent in signEvents"
                            :key="signEvent.ref"
                            :icon-src="iconSignature"
                            :title="issuerDisplayName(signEvent)">
                            <EventDetails :event="signEvent" />
                        </DataPanel>
                    </div>
                </div>

                <div v-if="signatureType" class="section signature-type">
                    <span class="label">{{ _$t('verification.result.meta.signatureType') }}</span>

                    <DataPanel :key="signatureType.level" :icon-src="iconFingerprint" :title="signatureType.title">
                        <p v-html="signatureType.description" />
                    </DataPanel>
                </div>

                <div v-if="initiator" class="section initiator">
                    <span class="label">{{ _$t('verification.result.meta.initiator') }}</span>

                    <DataPanel
                        :key="`initiator-${initiator.ref}`"
                        :icon-src="iconUser"
                        :title="issuerDisplayName(initiator)">
                        <EventDetails :event="initiator" />
                    </DataPanel>
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
import { SIGNATURE_LEVEL_QES } from '@certifaction/verification-core'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import BaseCard from './BaseCard.vue'
import ResultDetail from '../ResultDetail.vue'
import MDIcon from '../../../MDIcon.vue'
import DataPanel from '../DataPanel.vue'
import EventDetails from '../EventDetails.vue'

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
        DataPanel,
        EventDetails,
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
            SIGNATURE_LEVEL_QES,
            showExpertInfo: false,
        }
    },
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
    computed: {
        registerEvents() {
            return this.verificationItem.events
                ? this.verificationItem.events.filter((event) => event.scope === 'register')
                : []
        },
        revokeEvents() {
            return this.verificationItem.events
                ? this.verificationItem.events.filter((event) => event.scope === 'revoke')
                : []
        },
        retractEvents() {
            return this.verificationItem.events
                ? this.verificationItem.events.filter((event) => event.scope === 'retract')
                : []
        },
        signEvents() {
            const signEvents = this.verificationItem.events
                ? this.verificationItem.events.filter((event) => event.scope === 'sign')
                : []
            if (signEvents.length > 1) {
                signEvents.sort((a, b) => {
                    const aDate = a.date ? new Date(a.date) : null
                    const bDate = b.date ? new Date(b.date) : null

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
        retractionDate() {
            if (this.retractEvents.length === 0) {
                return null
            }

            const retractionDate = new Date(this.retractEvents[0].date)
            if (!isNaN(retractionDate)) {
                return this._$d(retractionDate, 'long')
            }

            return this.retractEvents[0].date
        },
        retractionNote() {
            if (this.retractEvents.length === 0) {
                return null
            }

            return this.retractEvents[0].note
        },
        revocationInProgress() {
            return this.revokeEvents.filter((event) => !event.on_blockchain).length > 0
        },
        retractionInProgress() {
            return this.retractEvents.filter((event) => !event.on_blockchain).length > 0
        },
        signaturesInProgress() {
            return this.signEvents.filter((event) => !event.on_blockchain).length
        },
        hasUnverifiedSigner() {
            return this.signEvents.filter((event) => !event.issuer.verified).length > 0
        },
        hasVerifiedSigner() {
            return this.signEvents.filter((event) => !!event.issuer.verified).length > 0
        },
        signatureType() {
            if (this.signEvents.length === 0) {
                return null
            }
            if (!this.signEvents[0].signature) {
                return null
            }

            const event = this.signEvents[0]
            const level = event.signature.level
            const signatureType = {
                level,
                title: this._$t(`verification.result.signature.level.${level}.title`),
                description: this._$t(`verification.result.signature.level.${level}.description`),
            }

            if (event.signature.jurisdiction) {
                signatureType.jurisdiction = event.signature.jurisdiction
            }

            return signatureType
        },
        initiator() {
            if (this.registerEvents.length > 0) {
                return this.registerEvents[0]
            }

            return null
        },
    },
    methods: {
        downloadQesSignature(event) {
            const content = event.signature.pkcs7_data
            const filename = `qes_signature_${event.issuer.name.toLowerCase().replaceAll(/\s+/g, '_')}.p7b`

            const element = document.createElement('a')
            element.setAttribute('href', `data:text/plain;base64,${encodeURIComponent(content)}`)
            element.setAttribute('download', filename)
            element.style.display = 'none'

            document.body.appendChild(element)

            element.click()

            document.body.removeChild(element)
        },
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        },
    },
}
</script>
