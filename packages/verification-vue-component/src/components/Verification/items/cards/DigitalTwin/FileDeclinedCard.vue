<template>
    <BaseCard class="file-declined-card">
        <template #body>
            <h3>{{ _$t('verification.digitalTwin.fileDeclined.title') }}</h3>
            <p v-html="_$t('verification.digitalTwin.fileDeclined.copy')"/>
            <button class="btn primary" @click="toggleHelp('contact')">
                <span>{{ _$t('verification.digitalTwin.error.btn.contactSupport') }}</span>
            </button>
        </template>
    </BaseCard>
</template>

<script>
import BaseCard from '../BaseCard.vue'
import i18nWrapperMixin from '../../../../../mixins/i18n-wrapper'

export default {
    name: 'FileDeclinedCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard
    },
    props: {
        fileName: {
            type: String,
            required: true
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
