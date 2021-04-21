<template>
    <div class="item-container"
         :class="{ 'confirmation-step': digitalTwin.confirmationStep, 'error': digitalTwinInformation.error }">
        <div class="card-container">
            <div v-if="digitalTwinInformation.active" class="header">
                <img src="../../../assets/img/certifaction_logo.svg" alt="Certifaction"/>
            </div>

            <ShadowCard v-if="isLoading"/>

            <SupportCard v-else-if="showSupport"
                         @toggle-help="toggleHelp"/>

            <ContactCard v-else-if="showContact"
                         @toggle-help="toggleHelp"
                         :certifaction-api-url="verifierInformation.certifactionApiUrl"/>

            <TechnicalProblemCard v-else-if="isTechnicalProblem"
                                  :verification-item="verificationItem"
                                  @toggle-help="toggleHelp"/>

            <NotFoundCard v-else-if="isNotFound"
                          :verification-item="verificationItem"
                          @toggle-help="toggleHelp"/>

            <template v-else>
                <FileErrorCard v-if="digitalTwinInformation.error"
                               @toggle-help="toggleHelp"/>

                <FileConfirmationCard v-else-if="digitalTwinInformation.active && digitalTwin.confirmationStep"
                                      @approve-or-decline="digitalTwinApproveOrDecline"
                                      :file-name="verificationItem.name"/>

                <template v-else>
                    <FileDeclinedCard v-if="digitalTwinInformation.active && !digitalTwin.fileApproved"
                                      :file-name="verificationItem.name"
                                      @toggle-help="toggleHelp"/>

                    <SigningCard v-else-if="isSigning"
                                 :verification-item="verificationItem"
                                 :net="verifierInformation.net"
                                 @toggle-help="toggleHelp"/>

                    <CertifyingCard v-else
                                    :verification-item="verificationItem"
                                    :net="verifierInformation.net"
                                    @toggle-help="toggleHelp"/>
                </template>
            </template>

            <div v-if="digitalTwinInformation.active && !digitalTwin.confirmationStep" class="action-box">
                <div class="actions navigate">
                    <button class="btn btn-light" @click="digitalTwinRecheck">
                        <span>{{ _$t('verification.digitalTwin.actionBox.actions.recheck') }}</span>
                    </button>
                    <a :href="digitalTwinInformation.fileUrl"
                       class="btn btn-primary"
                       :download="digitalTwinDownloadFileName">
                        <span>{{ _$t('verification.digitalTwin.actionBox.actions.download') }}</span>
                    </a>
                </div>
            </div>
        </div>
        <PDFViewer v-if="digitalTwinInformation.active && !digitalTwinInformation.error && !isLoading"
                   :url="digitalTwinInformation.fileUrl"
                   :pdfjs-worker-src="pdfjsWorkerSrc"
                   :pdfjs-c-map-url="pdfjsCMapUrl"/>
    </div>
</template>

<script>
import PDFViewer from '@certifaction/vue-pdf-viewer'
import i18nWrapperMixin from '../../../mixins/i18n-wrapper'
import ShadowCard from './cards/ShadowCard.vue'
import NotFoundCard from './cards/NotFoundCard.vue'
import TechnicalProblemCard from './cards/TechnicalProblemCard.vue'
import SupportCard from './cards/SupportCard.vue'
import ContactCard from './cards/ContactCard.vue'
import CertifyingCard from './cards/CertifyingCard.vue'
import SigningCard from './cards/SigningCard.vue'
import FileConfirmationCard from './cards/DigitalTwin/FileConfirmationCard.vue'
import FileDeclinedCard from './cards/DigitalTwin/FileDeclinedCard.vue'
import FileErrorCard from './cards/DigitalTwin/FileErrorCard.vue'

export default {
    name: 'VerificationItem',
    mixins: [
        i18nWrapperMixin
    ],
    components: {
        ShadowCard,
        NotFoundCard,
        TechnicalProblemCard,
        SupportCard,
        ContactCard,
        CertifyingCard,
        SigningCard,
        FileConfirmationCard,
        FileDeclinedCard,
        FileErrorCard,
        PDFViewer
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
    inject: ['pdfjsWorkerSrc', 'pdfjsCMapUrl'],
    data() {
        return {
            showSupport: false,
            showContact: false,
            confirmationStep: true,
            digitalTwin: {
                confirmationStep: true,
                fileApproved: false
            }
        }
    },
    computed: {
        isLoading() {
            return !this.verificationItem.hashed
        },
        isTechnicalProblem() {
            if (this.isLoading) {
                return false
            }

            if (!this.verificationItem.events || (this.verificationItem.events && this.verificationItem.events.length === 0)) {
                return (this.verificationItem.offchainError || this.verificationItem.error)
            } else {
                return (this.verificationItem.offchainError && this.verificationItem.error)
            }
        },
        isNotFound() {
            return (
                !this.isLoading &&
                !this.isTechnicalProblem &&
                (!this.verificationItem.events || (this.verificationItem.events && this.verificationItem.events.length === 0))
            )
        },
        isSigning() {
            return (this.verificationItem.events && this.verificationItem.events.filter(event => event.scope === 'sign').length > 0)
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
                case 'support':
                    this.showContact = false
                    this.showSupport = !this.showSupport
                    break
                case 'contact':
                    this.showSupport = false
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
            this.showSupport = false
            this.showContact = false
        },
        issuerDisplayName(event) {
            const eventDate = new Date(event.date)
            if (eventDate instanceof Date && !isNaN(eventDate)) {
                const migrationDate = new Date('2021-04-22')
                if (eventDate < migrationDate && event.issuer.name) {
                    return event.issuer.name
                }
            }

            if (event.issuer.name_verified === true) {
                return event.issuer.name
            }
            if (event.issuer.email_verified === true) {
                return event.issuer.email
            }
            if (event.issuer.email) {
                return event.issuer.email
            }
            return event.issuer.name
        }
    }
}
</script>
