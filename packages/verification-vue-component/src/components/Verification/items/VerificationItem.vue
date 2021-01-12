<template>
    <div class="item-container"
         :class="{ 'confirmation-step': digitalTwin.confirmationStep, 'error': digitalTwinInformation.error }">
        <div class="card-container">
            <div v-if="digitalTwinInformation.active" class="header">
                <img src="../../../assets/img/certifaction_logo.svg" alt="Certifaction"/>
            </div>

            <ShadowCard v-if="isLoading"/>

            <FaqCard v-else-if="showFaq" @toggle-help="toggleHelp($event)"/>
            <ContactCard v-else-if="showContact"
                         @toggle-help="toggleHelp($event)"
                         :certifaction-api-url="verifierInformation.certifactionApiUrl"/>

            <template v-else>
                <FileErrorCard v-if="digitalTwinInformation.error" @toggle-help="toggleHelp($event)"/>
                <FileConfirmationCard v-else-if="digitalTwinInformation.active && digitalTwin.confirmationStep"
                                      @approve-or-decline="digitalTwinApproveOrDecline"
                                      :file-name="verificationItem.name"/>

                <template v-else>
                    <FileDeclinedCard v-if="digitalTwinInformation.active && !digitalTwin.fileApproved"
                                      :file-name="verificationItem.name"/>
                    <SigningCard v-else-if="isSigning"
                                 :verification-item="verificationItem"
                                 :net="verifierInformation.net"
                                 @toggle-help="toggleHelp($event)"/>
                    <VerificationCard v-else
                                      :verification-item="verificationItem"
                                      :net="verifierInformation.net"
                                      @toggle-help="toggleHelp($event)"/>
                </template>
            </template>

            <div v-if="digitalTwinInformation.active && !digitalTwin.confirmationStep" class="action-box">
                <div class="actions navigate">
                    <button class="btn light" @click="digitalTwinRecheck">
                        <span>{{ _$t('verification.digitalTwin.actionBox.actions.recheck') }}</span>
                    </button>
                    <a :href="digitalTwinInformation.fileUrl"
                       class="btn primary"
                       :download="digitalTwinDownloadFileName">
                        <span>{{ _$t('verification.digitalTwin.actionBox.actions.download') }}</span>
                    </a>
                </div>
            </div>
        </div>
        <PDFViewer v-if="digitalTwinInformation.active && !digitalTwinInformation.error && !isLoading"
                   :url="digitalTwinInformation.fileUrl"/>
    </div>
</template>

<script>
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import VerificationCard from './cards/VerificationCard.vue'
import SigningCard from './cards/SigningCard.vue'
import ShadowCard from './cards/ShadowCard.vue'
import FaqCard from './cards/FaqCard.vue'
import ContactCard from './cards/ContactCard.vue'
import FileConfirmationCard from './cards/DigitalTwin/FileConfirmationCard.vue'
import FileDeclinedCard from './cards/DigitalTwin/FileDeclinedCard.vue'
import FileErrorCard from './cards/DigitalTwin/FileErrorCard.vue'
import PDFViewer from './cards/DigitalTwin/PDFViewer.vue'

export default {
    name: 'VerificationItem',
    mixins: [
        i18nWrapperMixin
    ],
    components: {
        VerificationCard,
        SigningCard,
        ShadowCard,
        FaqCard,
        ContactCard,
        FileConfirmationCard,
        FileDeclinedCard,
        FileErrorCard,
        PDFViewer
    },
    data() {
        return {
            showFaq: false,
            showContact: false,
            confirmationStep: true,
            digitalTwin: {
                confirmationStep: true,
                fileApproved: false
            }
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
        },
        digitalTwinInformation: {
            type: Object,
            required: false
        }
    },
    computed: {
        isLoading() {
            return this.verificationItem.hashed === undefined || this.verificationItem.hashed === false
        },
        isSigning() {
            return this.verificationItem.events ? (this.verificationItem.events.filter(event => event.scope === 'sign')).length !== 0 : false
        },
        digitalTwinDownloadFileName() {
            if (!this.digitalTwinInformation.active) {
                return null
            }

            const shortHash = this.verificationItem.hash.substr(2, 8)

            return `digital_twin_${shortHash}.pdf`
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
        },
        digitalTwinApproveOrDecline(approved) {
            this.digitalTwin.confirmationStep = false
            this.digitalTwin.fileApproved = approved
        },
        digitalTwinRecheck() {
            this.digitalTwin.confirmationStep = true
            this.digitalTwin.fileApproved = false
            this.showFaq = false
            this.showContact = false
        }
    }
}
</script>
