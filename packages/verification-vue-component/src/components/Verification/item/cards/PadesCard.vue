<template>
    <BaseCard class="pades-card">
        <template v-if="verificationItem.name" #header>
            <div class="icon">
                <MDIcon :icon="mdiFileDocument" class="icon-verified" />
            </div>
            <div class="title">
                <div class="filename">{{ verificationItem.name }}</div>
            </div>
        </template>
        <template #body>
            <div class="result-detail success">
                <div class="detail-header">
                    <div class="header-label">
                        {{ _$t('verification.result.pades.status') }}
                    </div>
                </div>
            </div>
            <div class="verification-info">
                <div class="section info">
                    <p v-html="_$t(`verification.result.pades.details`)" />
                </div>
            </div>
        </template>
        <template #footer>
            <div class="left" />
            <div class="right">
                <button class="btn btn-secondary" @click="toggleHelp('contact')">
                    <span>{{ _$t('verification.card.btn.support') }}</span>
                </button>
            </div>
        </template>
    </BaseCard>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mdiFileDocument } from '@mdi/js'
import i18nWrapperMixin from '../../../../mixins/i18n-wrapper.ts'
import MDIcon from '../../../MDIcon.vue'
import BaseCard from './BaseCard.vue'

export default defineComponent({
    name: 'PadesCard',
    components: {
        BaseCard,
        MDIcon,
    },
    mixins: [i18nWrapperMixin],
    props: {
        verificationItem: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            mdiFileDocument,
        }
    },
    methods: {
        toggleHelp(type) {
            this.$emit('toggle-help', type)
        },
    },
})
</script>
