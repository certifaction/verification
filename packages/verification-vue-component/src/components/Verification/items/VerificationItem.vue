<template>
    <div class="item-container">
        <ShadowCard v-if="isLoading" />
        <FaqCard v-else-if="showFaq" @toggle-help="toggleHelp($event)" />
        <VerificationCard v-else :verification-item="verificationItem" @toggle-help="toggleHelp($event)" />
    </div>
</template>

<script>
import VerificationCard from './cards/VerificationCard.vue'
import ShadowCard from './cards/ShadowCard.vue'
import FaqCard from './cards/FaqCard.vue'
import { mdiShieldCheck } from '@mdi/js'

export default {
    name: 'VerificationItem',
    components: {
        VerificationCard,
        ShadowCard,
        FaqCard
    },
    data() {
        return {
            mdiShieldCheck,
            showFaq: false
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
    },
    methods: {
        toggleHelp(type) {
            switch (type) {
                case 'faq':
                    this.showFaq = !this.showFaq
            }
        }
    }
}
</script>
