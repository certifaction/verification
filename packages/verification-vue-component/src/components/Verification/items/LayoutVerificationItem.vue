<template>
    <div class="verification-item" :class="{expanded: showAdvancedInfo}">
        <div class="item-header" @click="showAdvancedInfo = false">
            <div class="icon" v-if="isLoaded">
                <slot name="icon"></slot>
            </div>
            <div class="title">
                <div class="filename">{{ verificationItem.name }}</div>
            </div>
        </div>
        <div class="item-body">
            <div class="status">
                <slot name="title" v-if="isLoaded"></slot>
            </div>
            <transition name="expand" mode="out-in">
                <div v-if="!isLoaded" class="loading-spinner" key="spinner">
                    <Spinner/>
                </div>
                <div v-else class="verification-info" key="info">
                    <div v-if="verificationItem.issuerName" class="verification-entry issuer">
                        <span class="stacked-title">{{ _$t('verification.result.meta.issuer') }}</span>
                        <span class="name">
                            <span>{{ verificationItem.issuerName }}</span>
                            <MDIcon v-if="verificationItem.issuerVerified" :icon="mdiCheckDecagram" class="verified"/>
                        </span>
                    </div>
                    <div v-if="verificationItem.issuerVerifiedBy" class="verification-entry verifier">
                        <div class="verifier-name">
                            <span class="stacked-title">{{ _$t('verification.result.meta.issuerVerifiedBy') }}</span>
                            <span class="name">
                                <span>{{ verificationItem.issuerVerifiedBy }}</span>
                                <MDIcon :icon="mdiInformationOutline"
                                        v-tooltip.right="_$t('verification.result.meta.issuerVerifiedByInformation')"/>
                            </span>
                        </div>
                        <div class="verifier-image">
                            <img v-if="verificationItem.issuerVerifiedImg"
                                 :src="verificationItem.issuerVerifiedImg"
                                 alt=""/>
                        </div>
                    </div>
                    <div v-if="verificationItem.issuerVerified && !verificationItem.issuerVerifiedBy"
                         class="verification-entry verifier">
                        <div class="verifier-name">
                            <span class="stacked-title">{{ _$t('verification.result.meta.issuerVerifiedBy') }}</span>
                            <span class="name">
                                <span>Certifaction AG</span>
                                <MDIcon :icon="mdiInformationOutline"
                                        v-tooltip.right="_$t('verification.result.meta.issuerVerifiedByInformation')"/>
                            </span>
                        </div>
                    </div>
                    <div v-if="verificationItem.registrationBlock" class="verification-entry registration-date">
                        <span class="stacked-title">{{ _$t('verification.result.meta.registrationDate') }}</span>
                        <span class="date">{{ dateFormat(verificationItem.registrationBlock.timestamp) }}</span>
                    </div>
                    <div v-if="verificationItem.revocationBlock" class="verification-entry revocation-date">
                        <span class="stacked-title">{{ _$t('verification.result.meta.revocationDate') }}</span>
                        <span class="date">{{ dateFormat(verificationItem.revocationBlock.timestamp) }}</span>
                    </div>
                </div>
            </transition>
            <div class="description" v-if="isLoaded">
                <slot name="description"></slot>
                <!-- Only show the offchain error on unverified issuers & on not found -->
                <div v-if="verificationItem.offchainError &&
                    (verificationItem.type === VERIFICATION_TYPES.V_VERIFIED || verificationItem.type === VERIFICATION_TYPES.V_NOT_FOUND)"
                     class="offchain-error">
                    <MDIcon :icon="mdiAlertOutline"/>
                    <span class="offchain-error-title">{{ _$t('verification.result.technicalProblem.status') }}</span>
                    <div class="offchain-error-description"
                         v-html="_$t('verification.result.technicalProblem.offchainMessage')"/>
                </div>
            </div>
        </div>
        <div class="item-footer" v-if="verificationItem.issuerAddress && isLoaded && !verificationItem.error">
            <button v-if="showAdvancedInfo === false"
                    type="button"
                    class="btn-link advanced-toggler"
                    @click.prevent="showAdvancedInfo = true">
                <MDIcon :icon="mdiChevronUp" class="toggler"/>
                <span>{{ _$t('verification.result.expertInfo.show') }}</span>
            </button>
            <div v-else key="opened">
                <button key="closed"
                        type="button"
                        class="btn-link advanced-toggler"
                        @click.prevent="showAdvancedInfo = !showAdvancedInfo">
                    <span>{{ _$t('verification.result.expertInfo.hide') }}</span>
                    <MDIcon :icon="mdiChevronDown" class="toggler"/>
                </button>
                <slot name="advanced" class="footer-content">
                    <div class="advanced-info">
                        <div v-if="verificationItem.issuerAddress" class="verification-entry issuer-address">
                            <span class="stacked-title">{{ _$t('verification.result.meta.issuerAddress') }}</span>
                            <div class="hash">
                                <div class="content">{{ verificationItem.issuerAddress }}</div>
                            </div>
                        </div>
                        <div v-if="verificationItem.hash" class="verification-entry fingerprint">
                            <span class="stacked-title">{{ _$t('verification.result.meta.fingerprint') }}</span>
                            <div class="hash">
                                <div class="content">{{ verificationItem.hash }}</div>
                            </div>
                        </div>
                        <div v-if="verificationItem.registrationEvent" class="verification-entry registration-hash">
                            <span class="stacked-title">{{
                                    _$t('verification.result.meta.registrationTransaction')
                                }}</span>
                            <div class="hash">
                                <div class="content">
                                    <a :href="`https://${net}/tx/${verificationItem.registrationEvent.transactionHash}`"
                                       target="_blank">{{ verificationItem.registrationEvent.transactionHash }}</a>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="!verificationItem.onBlockchain" class="verification-entry registration-status">
                            <span class="stacked-title">{{
                                    _$t('verification.result.meta.registrationTransaction')
                                }}</span>
                            <div class="status" v-html="_$t('verification.result.processing.status')"/>
                        </div>
                        <div v-if="verificationItem.revocationEvent" class="verification-entry revocation-hash">
                            <span class="stacked-title">{{
                                    _$t('verification.result.meta.revocationTransaction')
                                }}</span>
                            <div class="hash">
                                <div class="content">
                                    <a :href="`https://${net}/tx/${verificationItem.revocationEvent.transactionHash}`"
                                       target="_blank">{{ verificationItem.revocationEvent.transactionHash }}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import Spinner from 'vue-simple-spinner'
import { VTooltip } from 'v-tooltip'
import { mdiAlertOutline, mdiCheckDecagram, mdiChevronDown, mdiChevronUp, mdiInformationOutline } from '@mdi/js'
import { VERIFICATION_TYPES } from '@certifaction/verification-core'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import MDIcon from '../../MDIcon.vue'

VTooltip.options.defaultContainer = '.certifaction-verification'

Vue.directive('tooltip', VTooltip)

export default {
    name: 'LayoutVerificationItem',
    mixins: [i18nWrapperMixin],
    props: ['verificationItem'],
    components: {
        Spinner,
        MDIcon
    },
    data() {
        return {
            mdiAlertOutline,
            mdiCheckDecagram,
            mdiChevronUp,
            mdiChevronDown,
            mdiInformationOutline,
            VERIFICATION_TYPES,
            showAdvancedInfo: false
        }
    },
    computed: {
        net() {
            if (this.$parent.$parent.$parent.certifactionEthVerifier.certifactionEthClient.eth.currentProvider.host.indexOf('ropsten') >= 0) {
                return 'ropsten.etherscan.io'
            } else {
                return 'etherscan.io'
            }
        },
        isLoaded() {
            return this.verificationItem.loaded === true
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
