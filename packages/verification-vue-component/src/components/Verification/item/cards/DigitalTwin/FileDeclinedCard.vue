<template>
    <BaseCard class="file-declined-card">
        <template #body>
            <h3>{{ _$t('verification.digitalTwin.fileDeclined.title') }}</h3>
            <p v-html="_$t('verification.digitalTwin.fileDeclined.copy')" />
            <button class="btn btn-primary" @click="toggleHelp('contact')">
                <span>{{ _$t('verification.digitalTwin.error.btn.contactSupport') }}</span>
            </button>
        </template>
    </BaseCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseCard from '../BaseCard.vue'
import i18nWrapperMixin from '../../../../../mixins/i18n-wrapper.ts'

export default defineComponent({
    name: 'FileDeclinedCard',
    components: {
        BaseCard,
    },
    mixins: [i18nWrapperMixin],
    props: {
        fileName: {
            type: String,
            required: true,
        },
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        },
    },
})
</script>
