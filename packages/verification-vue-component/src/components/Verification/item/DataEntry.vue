<template>
    <div class="data-entry" :class="{ collapsed: hasDetails && collapsed, 'no-details': !hasDetails }">
        <div class="header" @click="onClickHeader">
            <div v-if="iconSrc || mdIcon" class="icon">
                <img v-if="iconSrc" :src="iconSrc" class="icon" alt="Icon"/>
                <MDIcon v-if="mdIcon" :icon="mdIcon"/>
            </div>
            <div class="title" v-html="title"/>
            <div v-if="hasDetails" class="collapse-indicator">
                <MDIcon :icon="mdiChevronUp"/>
            </div>
        </div>
        <transition name="collapse"
                    @enter="onEnterTransition"
                    @after-enter="onAfterEnterTransition"
                    @leave="onLeaveTransition">
            <div v-if="hasDetails && !collapsed" class="details">
                <div v-if="eventDetails" class="event-data">
                    <div v-for="details in eventDetails" :key="details.label" class="data-row">
                        <div v-if="details.verifiable" :class="details.verified === true ? 'verified' : 'unverified'">
                            <MDIcon :icon="mdiCheck"/>
                        </div>
                        <div class="label">{{ details.label }}</div>
                        <div class="value">
                            <img v-if="details.imageSrc"
                                 :src="details.imageSrc"
                                 :alt="details.value"
                                 :title="details.value"/>
                            <template v-else>{{ details.value }}</template>
                        </div>
                    </div>
                </div>
                <slot v-else/>
            </div>
        </transition>
    </div>
</template>

<script>
import { mdiChevronUp, mdiCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import MDIcon from '../../MDIcon.vue'

export default {
    name: 'DataEntry',
    mixins: [i18nWrapperMixin],
    components: {
        MDIcon
    },
    props: {
        iconSrc: {
            type: String
        },
        mdIcon: {
            type: String
        },
        title: {
            type: String,
            required: true
        },
        event: {
            type: Object
        }
    },
    inject: ['isBeforeDetailedVerifiedMigration'],
    data() {
        return {
            mdiChevronUp,
            mdiCheck,
            collapsed: true
        }
    },
    computed: {
        hasDetails() {
            if (this.event) {
                return true
            }
            if (this.$slots.default) {
                return true
            }
            return false
        },
        eventDetails() {
            if (!this.event) {
                return null
            }

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
    },
    methods: {
        onClickHeader() {
            if (this.hasDetails) {
                this.collapsed = !this.collapsed
            }
        },
        onEnterTransition(el) {
            el.style.height = 'auto'
            const height = window.getComputedStyle(el).height
            el.style.height = 0
            window.getComputedStyle(el)
            window.setTimeout(() => {
                el.style.height = height
            })
        },
        onAfterEnterTransition(el) {
            el.style.height = 'auto'
        },
        onLeaveTransition(el) {
            el.style.height = window.getComputedStyle(el).height
            window.getComputedStyle(el)
            window.setTimeout(() => {
                el.style.height = 0
            })
        }
    }
}
</script>
