<template>
    <BaseCard class="file-error-card">
        <template #body>
            <img src="../../../../../assets/img/error_document.svg" alt="DigitalTwin Error" />
            <div class="error-message">
                <span>{{ _$t('verification.digitalTwin.error.decryption') }}</span>
            </div>
            <button class="btn btn-primary" @click="toggleHelp('contact')">
                <span>{{ _$t('verification.digitalTwin.error.btn.contactSupport') }}</span>
            </button>
        </template>
    </BaseCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import i18nWrapperMixin from '../../../../../mixins/i18n-wrapper.ts'
import BaseCard from '../BaseCard.vue'

export default defineComponent({
    name: 'FileErrorCard',
    components: {
        BaseCard,
    },
    mixins: [i18nWrapperMixin],
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        },
    },
})
</script>
