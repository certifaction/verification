<template>
    <div class="result-detail" :class="[verificationStatus, { expanded: showDetails && showDropdownToggler }]">
        <div class="detail-header" @click="toggleDropdown">
            <div class="header-icon">
                <img :src="headerIcon" alt="Icon"/>
            </div>
            <div class="header-label">
                <div v-html="headerLabel"/>
            </div>
            <div v-if="showDropdownToggler" class="header-action">
                <button type="button" class="btn-link advanced-toggler">
                    <img v-if="documentRegistrationInProgress || documentRevocationInProgress || signatureInProgress"
                         src="../../../assets/img/loading_spinner.svg"
                         class="loading-spinner"
                         alt="Spinner"/>
                    <span>{{ _$t('verification.result.meta.details') }}</span>
                    <MDIcon :icon="showDetails ? mdiChevronUp : mdiChevronDown" class="toggler"/>
                </button>
            </div>
        </div>
        <transition name="collapse">
            <div v-if="showDetails" class="detail-body">
                <ul>
                    <li v-for="(item, index) in details"
                        :key="index"
                        class="detail"
                        :class="[item.class, { 'in-progress': item.inProgress }]">
                        <template v-if="item.inProgress">
                            <MDIcon class="in-progress" :icon="mdiCircle"/>
                            <img src="../../../assets/img/loading_spinner.svg"
                                 class="loading-spinner"
                                 alt="Spinner"/>
                        </template>
                        <MDIcon v-else :icon="getDetailIcon(item.icon)"/>
                        <span v-html="item.label"/>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script>
import {
    mdiAlertCircle,
    mdiCheckCircle,
    mdiChevronDown,
    mdiChevronUp,
    mdiCircle,
    mdiCloseCircle,
    mdiShieldCheck
} from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import MDIcon from '../../MDIcon.vue'

import headerSuccessShield from '../../../assets/img/shield_success.svg'
import headerWarningShield from '../../../assets/img/shield_warning.svg'
import headerErrorShield from '../../../assets/img/shield_error.svg'

export default {
    name: 'ResultDetail',
    mixins: [i18nWrapperMixin],
    components: {
        MDIcon
    },
    props: {
        verificationMode: {
            type: String,
            required: true
        },
        notFound: {
            type: Boolean,
            default: false
        },
        hasTechnicalProblem: {
            type: Boolean,
            default: false
        },
        hasUnverifiedIssuer: {
            type: Boolean,
            default: false
        },
        hasVerifiedIssuer: {
            type: Boolean,
            default: false
        },
        documentRegistrationInProgress: {
            type: Boolean,
            default: false
        },
        documentRevoked: {
            type: Boolean,
            default: false
        },
        documentRevocationInProgress: {
            type: Boolean,
            default: false
        },
        documentRevocationDate: null,
        signaturesInProgress: {
            type: Number,
            default: 0
        },
        hasUnverifiedSigner: {
            type: Boolean,
            default: false
        },
        hasVerifiedSigner: {
            type: Boolean,
            default: false
        },
        signerCount: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            mdiShieldCheck,
            mdiChevronUp,
            mdiChevronDown,
            mdiCircle,
            headerSuccessShield,
            headerWarningShield,
            headerErrorShield,
            showDetails: false
        }
    },
    computed: {
        showDropdownToggler() {
            return (!this.notFound && !this.hasTechnicalProblem)
        },
        verificationStatus() {
            if (this.documentRevoked) {
                return 'error'
            }

            if (this.notFound || this.hasTechnicalProblem || this.hasUnverifiedIssuer || this.hasUnverifiedSigner) {
                return 'warning'
            }

            return 'success'
        },
        headerIcon() {
            switch (this.verificationStatus) {
                case 'success':
                    return headerSuccessShield
                case 'warning':
                    return headerWarningShield
                case 'error':
                default:
                    return headerErrorShield
            }
        },
        headerLabel() {
            if (this.notFound) {
                return this._$t(`verification.result.${this.verificationMode}.notFound.status`)
            }

            if (this.hasTechnicalProblem) {
                return this._$t(`verification.result.${this.verificationMode}.technicalProblem.status`)
            }

            if (this.documentRevoked) {
                return this._$t(`verification.result.${this.verificationMode}.revoked.status`)
            }

            if (this.hasUnverifiedIssuer) {
                return this._$t(`verification.result.${this.verificationMode}.unverifiedIssuer.status`)
            }

            if (this.hasVerifiedIssuer) {
                return this._$t(`verification.result.${this.verificationMode}.verifiedIssuer.status`)
            }

            if (this.hasUnverifiedSigner) {
                return this._$tc(`verification.result.${this.verificationMode}.unverifiedSigner.status`, this.signerCount)
            }

            if (this.hasVerifiedSigner) {
                return this._$tc(`verification.result.${this.verificationMode}.verifiedSigner.status`, this.signerCount)
            }

            return null
        },
        details() {
            const langDetailsKeyPrefix = `verification.result.${this.verificationMode}.resultDetails`
            const details = []

            details.push({
                label: this._$t(`${langDetailsKeyPrefix}.tamperProof`),
                class: 'tamper-proof',
                icon: 'check'
            })

            const documentDetail = { class: 'document' }
            if (this.documentRegistrationInProgress) {
                documentDetail.label = this._$t(`${langDetailsKeyPrefix}.document.registering`)
                documentDetail.inProgress = true
            } else {
                documentDetail.label = this._$t(`${langDetailsKeyPrefix}.document.registered`)
                documentDetail.icon = 'check'
            }

            let documentStatusDetail = {}
            if (!this.documentRevoked) {
                documentStatusDetail = {
                    label: this._$t(`${langDetailsKeyPrefix}.valid`),
                    class: 'valid',
                    icon: 'check'
                }
            } else {
                if (this.documentRevocationInProgress) {
                    documentStatusDetail.label = this._$t(`${langDetailsKeyPrefix}.invalid.registering`)
                } else {
                    documentStatusDetail.label = this._$t(
                        `${langDetailsKeyPrefix}.invalid.registered`,
                        { revocationDate: this._$d(this.documentRevocationDate, 'long') }
                    )
                }
                documentStatusDetail.class = 'invalid'
                documentStatusDetail.icon = 'close'
            }

            switch (this.verificationMode) {
                case 'certifying':
                    if (this.hasUnverifiedIssuer) {
                        details.push({
                            label: this._$t(`${langDetailsKeyPrefix}.unverifiedIssuer`),
                            class: 'unverified-issuer',
                            icon: 'alert'
                        })
                    } else if (this.hasVerifiedIssuer) {
                        details.push({
                            label: this._$t(`${langDetailsKeyPrefix}.verifiedIssuer`),
                            class: 'verified-issuer',
                            icon: 'check'
                        })
                    }

                    details.push(documentDetail)
                    details.push(documentStatusDetail)
                    break

                case 'signing':
                    details.push(documentDetail)
                    details.push(documentStatusDetail)

                    if (this.hasUnverifiedSigner) {
                        details.push({
                            label: this._$tc(`${langDetailsKeyPrefix}.unverifiedSigners.registered`, this.signerCount),
                            class: 'unverified-signers',
                            icon: 'alert'
                        })
                    } else if (this.hasVerifiedSigner) {
                        details.push({
                            label: this._$tc(`${langDetailsKeyPrefix}.verifiedSigners.registered`, this.signerCount),
                            class: 'verified-signers',
                            icon: 'check'
                        })
                    }
                    break
            }

            return details
        }
    },
    methods: {
        toggleDropdown() {
            this.showDetails = this.showDropdownToggler ? !this.showDetails : this.showDetails
        },
        getDetailIcon(icon) {
            switch (icon) {
                case 'check':
                    return mdiCheckCircle
                case 'alert':
                    return mdiAlertCircle
                case 'close':
                    return mdiCloseCircle
            }
            return null
        }
    }
}
</script>
