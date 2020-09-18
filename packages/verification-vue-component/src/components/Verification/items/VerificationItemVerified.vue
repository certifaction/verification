<template>
    <LayoutVerificationItem :verificationItem="verificationItem">
        <template #icon>
            <MDIcon :icon="mdiShieldCheck" class="icon-verified"/>
        </template>
        <template #title>{{ _$t('verification.result.verified.status') }}</template>
        <template #description>
            <div v-html="_$t('verification.result.verified.message')"></div>
        </template>
    </LayoutVerificationItem>
</template>

<script>
import { mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import LayoutVerificationItem from './LayoutVerificationItem.vue'
import MDIcon from '../../MDIcon.vue'

export default {
    name: 'VerificationItemVerified',
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
