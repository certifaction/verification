<template>
    <div class="item-container">
        <ShadowCard v-if="isLoading" />
        <VerificationCard v-else :verification-item="verificationItem" />
    </div>
</template>

<script>
import VerificationCard from './cards/VerificationCard.vue'
import ShadowCard from './cards/ShadowCard.vue'
import { mdiShieldCheck } from '@mdi/js'

export default {
    name: 'VerificationItem',
    components: {
        VerificationCard,
        ShadowCard
    },
    data() {
        return {
            mdiShieldCheck
        }
    },
    props: {
        verificationItem: {
            type: Object,
            required: true
        }
    },
    computed: {
        isLoading() {
            return this.verificationItem.hashed === undefined || this.verificationItem.hashed === false
        }
    }
}
</script>
