<template>
    <BaseCard class="file-error-card">
        <template #body>
            <img src="../../../../../assets/img/error_document.svg" alt="DigitalTwin Error"/>
            <div class="error-message">
                <span>{{ _$t('verification.digitalTwin.error.decryption') }}</span>
            </div>
            <button class="btn primary" @click="toggleHelp('contact')">
                <span>{{ _$t('verification.digitalTwin.error.btn.contactSupport') }}</span>
            </button>
        </template>
    </BaseCard>
</template>

<script>
import i18nWrapperMixin from '../../../../../mixins/i18n-wrapper'
import BaseCard from '../BaseCard'

export default {
    name: 'FileErrorCard',
    mixins: [i18nWrapperMixin],
    components: {
        BaseCard
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        }
    }
}
</script>
