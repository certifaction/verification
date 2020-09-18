<template>
    <LayoutVerificationItem :verificationItem="verificationItem">
        <template #icon>
            <MDIcon :icon="mdiShieldCheck" class="icon-unverified"/>
        </template>
        <template #title>{{ _$t('verification.result.selfDeclared.status') }}</template>
        <template #description>
            <div v-html="_$t('verification.result.selfDeclared.message')"></div>
        </template>
    </LayoutVerificationItem>
</template>

<script>
import { mdiShieldCheck } from '@mdi/js'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import LayoutVerificationItem from './LayoutVerificationItem.vue'
import MDIcon from '../../MDIcon.vue'

export default {
    name: 'VerificationItemUnverifiedIssuer',
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
