<template>
    <LayoutVerificationItem :verificationItem="verificationItem">
        <template #icon>
            <MDIcon :icon="mdiShieldCheck" class="icon-revoked"/>
        </template>
        <template #title>{{ _$t('verification.result.revoked.status') }}</template>
        <template #description>
            <div v-html="_$t('verification.result.revoked.message')"></div>
        </template>
    </LayoutVerificationItem>
</template>

<script>
import { mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import LayoutVerificationItem from './LayoutVerificationItem.vue'
import MDIcon from '../../MDIcon.vue'

export default {
    name: 'VerificationItemRevoked',
    mixins: [i18nWrapperMixin],
    props: ['verificationItem'],
    components: {
        MDIcon,
        LayoutVerificationItem
    },
    data() {
        return {
            mdiShieldCheck
        }
    }
}
</script>
