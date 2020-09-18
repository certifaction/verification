<template>
    <LayoutVerificationItem :verificationItem="verificationItem">
        <template #icon>
            <MDIcon :icon="mdiAlertCircle" class="icon-not-found"/>
        </template>
        <template #title>{{ _$t('verification.result.notFound.status') }}</template>
        <template #description>
            <div v-html="_$t('verification.result.notFound.message')"></div>
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
