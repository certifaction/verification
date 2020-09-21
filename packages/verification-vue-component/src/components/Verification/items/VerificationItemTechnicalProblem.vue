<template>
    <LayoutVerificationItem :verificationItem="verificationItem">
        <template #icon>
            <MDIcon :icon="mdiAlertCircle" class="icon-not-found"/>
        </template>
        <template #title>{{ _$t('verification.result.technicalProblem.status') }}</template>
        <template #description v-if="!verificationItem.offchainError">
            <div v-html="_$t('verification.result.technicalProblem.message')"></div>
        </template>
        <template #description v-else>
            <div v-html="_$t('verification.result.technicalProblem.offchainMessage')"></div>
        </template>
    </LayoutVerificationItem>
</template>

<script>
import { mdiAlertCircle } from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import LayoutVerificationItem from './LayoutVerificationItem.vue'
import MDIcon from '../../MDIcon.vue'

export default {
    name: 'VerificationItemNotFound',
    mixins: [i18nWrapperMixin],
    props: ['verificationItem'],
    components: {
        LayoutVerificationItem,
        MDIcon
    },
    data() {
        return {
            mdiAlertCircle
        }
    }
}
</script>
