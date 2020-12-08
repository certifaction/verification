<template>
    <div class="result-detail"
         :class="[verificationResultClass, {expanded: showDetails && showDropdownToggler}]">
        <div class="detail-header" @click="toggleDropdown">
            <div class="header-icon">
                <img :src="headerIcon" alt="Certifaction"/>
            </div>
            <div class="header-label">
                <div v-html="_$t('verification.result.' + translationType + '.' + verificationResult + '.status')"></div>
            </div>
            <div v-if="showDropdownToggler" class="header-action">
                <button type="button"
                        class="btn-link advanced-toggler">
                    <img v-if="verificationInProgress || revocationInProgress || signatureInProgress"
                         class="loading-spinner"
                         src="../../../assets/img/loading_spinner.svg"
                         alt="Spinner"/>
                    <span>{{ _$t('verification.result.meta.details') }}</span>
                    <MDIcon :icon="showDetails ? mdiChevronUp : mdiChevronDown" class="toggler"/>
                </button>
            </div>
        </div>
        <transition name="collapse">
            <div v-if="showDetails" class="detail-body">
                <ul>
                    <li class="detail"
                        v-for="(item, index) in _$t('verification.result.' + translationType + '.' + verificationResult + '.details', { returnObjects: true, date: revocationDate })"
                        :key="index">
                        <template v-if="((verificationInProgress || revocationInProgress) && index === 'blockchain' || signatureInProgress && index === 'signatures')">
                            <MDIcon class="in-progress"
                                    :class="getDetailClass(index)"
                                    :icon="mdiCircle"/>
                            <img class="loading-spinner"
                                 src="../../../assets/img/loading_spinner.svg"
                                 alt="Spinner"/>
                        </template>
                        <MDIcon v-else :class="getDetailClass(index)" :icon="getDetailIcon(index)"/>
                        <span v-html="getDetailLabel(index, item)"/>
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
import dateFormatter from '../../../mixins/date-formatter'
import MDIcon from '../../MDIcon.vue'

import headerSuccessShield from '../../../assets/img/shield_success.svg'
import headerWarningShield from '../../../assets/img/shield_warning.svg'
import headerErrorShield from '../../../assets/img/shield_error.svg'

export default {
    name: 'ResultDetail',
    mixins: [i18nWrapperMixin, dateFormatter],
    components: {
        MDIcon
    },
    props: {
        verificationResult: {
            type: String,
            required: true
        },
        verificationInProgress: {
            type: Boolean,
            default: false
        },
        revocationInProgress: {
            type: Boolean,
            default: false
        },
        revocationDate: null,
        isSigning: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            mdiShieldCheck,
            mdiChevronUp,
            mdiChevronDown,
            mdiCircle,
            mdiAlertCircle,
            mdiCloseCircle,
            mdiCheckCircle,
            showDetails: false,
            headerSuccessShield,
            headerWarningShield,
            headerErrorShield
        }
    },
    computed: {
        togglerArrow() {
            return this.showDetails ? mdiChevronUp : mdiChevronDown
        },
        showDropdownToggler() {
            return this.verificationResult !== 'notFound' && this.verificationResult !== 'technicalProblem'
        },
        headerIcon() {
            switch (this.verificationResult) {
                case 'verifiedIssuer':
                case 'signingComplete':
                    return headerSuccessShield
                case 'unverifiedIssuer':
                case 'technicalProblem':
                case 'notFound':
                    return headerWarningShield
                default:
                    return headerErrorShield
            }
        },
        verificationResultClass() {
            return this.verificationResult.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
        },
        translationType() {
            return this.isSigning ? 'signing' : 'verification'
        },
        signatureInProgress() {
            // TODO (ani): Check if signature is in progress
            return false
        }
    },
    methods: {
        toggleDropdown() {
            this.showDetails = this.showDropdownToggler ? !this.showDetails : this.showDetails
        },
        getDetailIcon(detail) {
            switch (detail) {
                case 'tamperProof':
                case 'verifiedIssuer':
                case 'blockchain':
                case 'valid':
                case 'signatures':
                    return mdiCheckCircle
                case 'unverifiedIssuer':
                    return mdiAlertCircle
                case 'invalid':
                    return mdiCloseCircle
            }
        },
        getDetailLabel(index, item) {
            if (index === 'blockchain') {
                return this.verificationInProgress || this.revocationInProgress ? item.registering : item.secured
            } else if (index === 'signatures') {
                // TODO (ani): Add correct conditions (if 1< signature is registering)
                // eslint-disable-next-line no-constant-condition
                return false ? item.registering : item.complete
            } else if (index === 'invalid') {
                const labelType = this.revocationDate ? 'default' : 'offchain'
                return this._$t('verification.result.' + this.translationType + '.' + this.verificationResult + '.details.invalid.' + labelType, { revocationDate: this.revocationDate ? this.dateFormat(this.revocationDate) : null })
            }

            return item
        },
        getDetailClass(index) {
            return index.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
        }
    }
}
</script>
