<template>
    <div class="item-container">
        <ShadowCard v-if="isLoading" />
        <FaqCard v-else-if="showFaq" @toggle-help="toggleHelp($event)" />
        <ContactCard v-else-if="showContact" @toggle-help="toggleHelp($event)" :certifaction-api-url="verifierInformation.certifactionApiUrl" />
        <template v-else>
            <SigningCard v-if="isSigning" :verification-item="verificationItem" :net="verifierInformation.net" @toggle-help="toggleHelp($event)" />
            <VerificationCard v-else :verification-item="verificationItem" :net="verifierInformation.net" @toggle-help="toggleHelp($event)" />
        </template>
    </div>
</template>

<script>
import VerificationCard from './cards/VerificationCard.vue'
import SigningCard from './cards/SigningCard.vue'
import ShadowCard from './cards/ShadowCard.vue'
import FaqCard from './cards/FaqCard.vue'
import ContactCard from './cards/ContactCard.vue'

export default {
    name: 'VerificationItem',
    components: {
        VerificationCard,
        SigningCard,
        ShadowCard,
        FaqCard,
        ContactCard
    },
    data() {
        return {
            showFaq: false,
            showContact: false
        }
    },
    props: {
        verificationItem: {
            type: Object,
            required: true
        },
        verifierInformation: {
            type: Object,
            required: true
        }
    },
    computed: {
        isLoading() {
            return this.verificationItem.hashed === undefined || this.verificationItem.hashed === false
        },
        isSigning() {
            return (this.verificationItem.events.filter(event => event.scope === 'sign')).length !== 0
        }
    },
    methods: {
        toggleHelp(type) {
            switch (type) {
                case 'faq':
                    this.showContact = false
                    this.showFaq = !this.showFaq
                    break
                case 'contact':
                    this.showFaq = false
                    this.showContact = !this.showContact
            }
        }
    }
}
</script>
