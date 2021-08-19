<template>
    <div class="event-details">
        <div v-for="detail in details" :key="detail.label" class="data-row">
            <div v-if="detail.verifiable"
                 :class="detail.verified === true ? 'verified' : 'unverified'"
                 v-tooltip.right="detail.verified === true ? _$t('verification.result.meta.attributeVerified') : $t('verification.result.meta.attributeUnverified')"
            >
                <img v-if="detail.verified" src="../../../assets/img/verified_icon.svg" alt="Blue checkmark icon">
                <img v-else src="../../../assets/img/unverified_icon.svg" alt="Orange question mark icon">
            </div>
            <div class="label">{{ detail.label }}</div>
            <div class="value">
                <img v-if="detail.imageSrc"
                     :src="detail.imageSrc"
                     :alt="detail.value"
                     :title="detail.value"/>
                <template v-else>{{ detail.value }}</template>
            </div>
        </div>
    </div>
</template>

<script>
import { mdiCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import { VTooltip } from 'v-tooltip'


export default {
    name: 'EventDetails',
    mixins: [i18nWrapperMixin],
    props: {
        event: {
            type: Object,
            required: true
        }
    },
    directives: {
        tooltip: VTooltip
    },
    inject: ['isBeforeDetailedVerifiedMigration'],
    data() {
        return {
            mdiCheck
        }
    },
    computed: {
        details() {
            const details = []

            if (this.event.issuer.name) {
                details.push({
                    label: this._$t('verification.result.meta.name'),
                    value: this.event.issuer.name,
                    verifiable: true,
                    verified: (this.event.issuer.name_verified === true || (this.isBeforeDetailedVerifiedMigration(this.event) && !!this.event.issuer.verified_by))
                })
            }
            if (this.event.scope !== 'certify') {
                if (this.event.issuer.email) {
                    details.push({
                        label: this._$t('verification.result.meta.email'),
                        value: this.event.issuer.email,
                        verifiable: true,
                        verified: (this.event.issuer.email_verified === true)
                    })
                }
                if (this.event.issuer.phone) {
                    details.push({
                        label: this._$t('verification.result.meta.phone'),
                        value: this.event.issuer.phone,
                        verifiable: true,
                        verified: (this.event.issuer.phone_verified === true)
                    })
                }
            }

            if (this.event.scope === 'sign' && this.event.date) {
                details.push({
                    label: this._$t('verification.result.meta.signedAt'),
                    value: this._$d(new Date(this.event.date), 'short')
                })
            }

            if (this.event.issuer.verified_by) {
                const verifiedBy = {
                    label: this._$t('verification.result.meta.' + ((this.event.scope === 'sign') ? 'signedVia' : 'verifiedBy')),
                    value: this.event.issuer.verified_by.name
                }
                if (this.event.issuer.verified_by.image) {
                    verifiedBy.imageSrc = this.event.issuer.verified_by.image
                }
                details.push(verifiedBy)
            }

            return details
        }
    }
}
</script>
