<template>
    <div class="result-detail"
         :class="[verificationResultClass, {expanded: showDetails}]">
        <div class="detail-header" @click="toggleDropdown">
            <div class="header-icon">
                <img :src="headerIcon" alt="Certifaction"/>
            </div>
            <div class="header-label">
                <div v-html="_$t('verification.result.' + verificationResult + '.status')"></div>
            </div>
            <div class="header-action">
                <button type="button"
                        class="btn-link advanced-toggler">
                    <img v-if="verificationInProgress" class="loading-spinner" src="../../../assets/img/result_details/loading_spinner.svg" alt="Spinner"/>
                    <MDIcon :icon="showDetails ? mdiChevronUp : mdiChevronDown" class="toggler"/>
                </button>
            </div>
        </div>
        <transition name="collapse">
            <div v-if="showDetails" class="detail-body">
                <ul>
                    <li class="detail"
                        v-for="(item, index) in $i18n.t('verification.result.' + verificationResult + '.details', { returnObjects: true })"
                        :key="index">
                        <div v-if="verificationInProgress && index === 'blockchain'" class="warning-indicator">
                            <img class="loading-spinner" src="../../../assets/img/result_details/loading_spinner.svg" alt="Spinner"/>
                        </div>
                        <MDIcon v-else :class="getDetailClass(index)" :icon="getDetailIcon(index)" />
                        <span v-html="getDetailLabel(index, item)" />
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script>

import { mdiChevronDown, mdiChevronUp, mdiShieldCheck, mdiAlertCircle, mdiCheckCircle, mdiCloseCircle } from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import MDIcon from '../../MDIcon.vue'

import headerSuccessShield from '../../../assets/img/result_details/shield_success.svg'
import headerWarningShield from '../../../assets/img/result_details/shield_warning.svg'
import headerErrorShield from '../../../assets/img/result_details/shield_error.svg'

export default {
    name: 'ResultDetail',
    mixins: [i18nWrapperMixin],
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
        }
    },
    data() {
        return {
            mdiShieldCheck,
            mdiChevronUp,
            mdiChevronDown,
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
            return this.verificationResult === 'notFound' || this.verificationResult === 'technicalProblem'
        },
        headerIcon() {
            switch (this.verificationResult) {
                case 'verifiedIssuer':
                    return headerSuccessShield
                case 'unverifiedIssuer':
                    return headerWarningShield
                default:
                    return headerErrorShield
            }
        },
        verificationResultClass() {
            return this.verificationResult.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
        }
    },
    methods: {
        toggleDropdown() {
            this.showDetails = !this.showDetails
        },
        getDetailIcon(detail) {
            switch (detail) {
                case 'tamperProof':
                case 'verifiedIssuer':
                case 'blockchain':
                case 'valid':
                    return mdiCheckCircle
                case 'unverifiedIssuer':
                    return mdiAlertCircle
                case 'invalid':
                    return mdiCloseCircle
            }
        },
        getDetailLabel(index, item) {
            if (index === 'blockchain') {
                return this.verificationInProgress ? item.registering : item.secured
            }

            return item
        },
        getDetailClass(index) {
            return index.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
        }
    }
}
</script>
