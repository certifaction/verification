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
                <div v-if="signEvents.length > 0 && signEvents[0].on_blockchain"
                     class="verification-entry smart-contract-address">
                    <div class="label">{{ _$t('verification.result.meta.smartContractAddress') }}</div>
                    <div class="value">
                        <a :href="`https://${net}/address/${signEvents[0].on_blockchain.contract_address}`"
                           target="_blank">{{ signEvents[0].on_blockchain.contract_address }}</a>
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
                <div v-if="signEvents.length > 0" class="verification-entry signature-hashes">
                    <div class="label">{{ _$t('verification.result.meta.signatureTransactions') }}</div>
                    <div class="value">
                        <div class="signature-hash" v-for="(signEvent, index) in signEvents" :key="index">
                            <span>{{ $parent.issuerDisplayName(signEvent) }}</span>
                            <a v-if="signEvent.on_blockchain"
                               :href="`https://${net}/tx/${signEvent.on_blockchain.tx_hash}`"
                               target="_blank">{{ signEvent.on_blockchain.tx_hash }}</a>
                        </div>
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
                <div v-if="signEvents.length > 0" class="verification-entry signatures">
                    <span class="label">{{ _$tc('verification.result.meta.signature', signEvents.length) }}</span>
                    <ul class="signature-list">
                        <li class="signature" v-for="(signEvent, index) in signEvents" :key="index">
                            <div class="left">
                                <span class="icon">
                                    <img src="../../../../assets/img/icon_signature.svg" alt="Signature"/>
                                </span>
                            </div>
                            <div class="right">
                                <div class="value">
                                    <span>{{ $parent.issuerDisplayName(signEvent) }}</span>
                                </div>
                                <div v-if="signEvent.on_blockchain && signEvent.date" class="footnote">
                                    <span>{{ signerFootnote(signEvent) }}</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-if="singleIdentityVerifier" class="verification-entry verifier">
                    <div class="verifier-name">
                        <div class="label">{{ _$t('verification.result.meta.signedVia') }}</div>
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
                <div v-if="initiator" class="verification-entry initiator">
                    <div class="verifier-name">
                        <div class="label">{{ _$t('verification.result.meta.initiator') }}</div>
                        <div class="value">
                            <span>{{ $parent.issuerDisplayName(initiator) }}</span>
                        </div>
                    </div>
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
import BaseCard from './BaseCard.vue'
import ResultDetail from '../ResultDetail.vue'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import { mdiAlertCircle, mdiFileDocument, mdiShieldCheck } from '@mdi/js'
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
        singleIdentityVerifier() {
            if (!this.hasVerifiedSigner) {
                return null
            }

            const verifiedSignEvents = this.signEvents.filter(event => !!event.issuer.verified)

            if (verifiedSignEvents.length !== this.signEvents.length) {
                return null
            }

            const identityVerifiers = verifiedSignEvents.map(event => event.issuer.verified_by)
            const uniqueIdentityVerifiers = identityVerifiers.filter(
                (identityVerifier, index) => identityVerifiers.findIndex(checkIdentityVerifier => checkIdentityVerifier.name === identityVerifier.name) === index
            )

            if (uniqueIdentityVerifiers.length > 1) {
                return null
            }

            return uniqueIdentityVerifiers[0]
        },
        initiator() {
            if (this.registerEvents.length > 0) {
                return this.registerEvents[0]
            }

            return null
        }
    },
    methods: {
        signerFootnote(signEvent) {
            let signerState = 'unverifiedSigner'
            if (signEvent.issuer.verified) {
                signerState = 'verifiedSigner'
            }

            return this._$t(`verification.result.signing.${signerState}.signerFootnote`, {
                signingDate: this._$d(new Date(signEvent.date), 'short')
            })
        },
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
