<template>
    <BaseCard class="not-found-card">
        <template v-if="verificationItem.name" #header>
            <div class="icon">
                <MDIcon :icon="mdiFileDocument" class="icon-verified"/>
            </div>
            <div class="title">
                <div class="filename">{{ verificationItem.name }}</div>
            </div>
        </template>
        <template #body>
            <ResultDetail verification-mode="error" :not-found="true"/>
            <div class="verification-info">
                <div class="verification-entry error">
                    <p v-html="_$t(`verification.result.error.notFound.details`)"/>
                </div>
                <div v-if="verificationItem.hash" class="verification-entry fingerprint">
                    <div class="label">{{ _$t('verification.result.meta.fingerprint') }}</div>
                    <div class="value">
                        <span class="hash">{{ verificationItem.hash }}</span>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="left"/>
            <div class="right">
                <button class="btn btn-primary" @click="toggleHelp('contact')">
                    <span>{{ _$t('verification.card.btn.contact') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script>
import { mdiFileDocument } from '@mdi/js'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper'
import BaseCard from './BaseCard.vue'
import MDIcon from '../../../MDIcon.vue'
import ResultDetail from '../ResultDetail.vue'

export default {
    name: 'NotFoundCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard,
        MDIcon,
        ResultDetail
    },
    props: {
        verificationItem: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            mdiFileDocument
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
