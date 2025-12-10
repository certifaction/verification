<template>
    <div
        class="item-container"
        :class="{ 'confirmation-step': digitalTwin.confirmationStep, error: digitalTwinInformation.error }">
        <div class="card-container">
            <div v-if="digitalTwinInformation.active" class="header">
                <div class="logo" />
            </div>

            <ShadowCard v-if="isLoading" />

            <SupportCard v-else-if="showSupport" @toggle-help="toggleHelp" />

            <ContactCard
                v-else-if="showContact"
                :certifaction-api-url="verifierInformation.certifactionApiUrl"
                @toggle-help="toggleHelp" />

            <TechnicalProblemCard
                v-else-if="isTechnicalProblem"
                :verification-item="verificationItem"
                @toggle-help="toggleHelp" />

            <NotFoundCard v-else-if="isNotFound" :verification-item="verificationItem" @toggle-help="toggleHelp" />

            <template v-else>
                <FileErrorCard v-if="digitalTwinInformation.error" @toggle-help="toggleHelp" />

                <FileConfirmationCard
                    v-else-if="digitalTwinInformation.active && digitalTwin.confirmationStep"
                    :file-name="verificationItem.name"
                    @approve-or-decline="digitalTwinApproveOrDecline" />

                <template v-else>
                    <FileDeclinedCard
                        v-if="digitalTwinInformation.active && !digitalTwin.fileApproved"
                        :file-name="verificationItem.name"
                        @toggle-help="toggleHelp" />

                    <PadesCard v-else-if="isPades" :verification-item="verificationItem" @toggle-help="toggleHelp" />

                    <SigningCard
                        v-else-if="isSigning"
                        :verification-item="verificationItem"
                        :eth-scan-url="verifierInformation.ethScanUrl"
                        @toggle-help="toggleHelp" />

                    <CertifyingCard
                        v-else
                        :verification-item="verificationItem"
                        :eth-scan-url="verifierInformation.ethScanUrl"
                        @toggle-help="toggleHelp" />
                </template>
            </template>

            <div v-if="digitalTwinInformation.active && !digitalTwin.confirmationStep" class="action-box">
                <div class="actions navigate">
                    <button class="btn btn-secondary" @click="digitalTwinRecheck">
                        <span>{{ _$t('verification.digitalTwin.actionBox.actions.recheck') }}</span>
                    </button>
                    <a
                        :href="digitalTwinInformation.fileUrl"
                        class="btn btn-primary"
                        :download="digitalTwinDownloadFileName">
                        <span>{{ _$t('verification.digitalTwin.actionBox.actions.download') }}</span>
                    </a>
                </div>
            </div>
        </div>

        <PdfViewer
            v-if="digitalTwinInformation.active && !digitalTwinInformation.error && !isLoading"
            :source="digitalTwinInformation.fileUrl"
            :translate="translate"
            :pdfjs-worker-src="pdfjsWorkerSrc"
            :pdfjs-worker-instance="pdfjsWorkerInstance"
            :pdfjs-c-map-url="pdfjsCMapUrl"
            :pdfjs-icc-url="pdfjsIccUrl"
            :pdfjs-wasm-url="pdfjsWasmUrl" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PdfViewer from '@certifaction/vue-pdf-viewer/src/components/PdfViewer.vue'
import i18nWrapperMixin from '../../mixins/i18n-wrapper.ts'
import ShadowCard from './item/cards/ShadowCard.vue'
import NotFoundCard from './item/cards/NotFoundCard.vue'
import TechnicalProblemCard from './item/cards/TechnicalProblemCard.vue'
import SupportCard from './item/cards/SupportCard.vue'
import ContactCard from './item/cards/ContactCard.vue'
import PadesCard from './item/cards/PadesCard.vue'
import CertifyingCard from './item/cards/CertifyingCard.vue'
import SigningCard from './item/cards/SigningCard.vue'
import FileConfirmationCard from './item/cards/DigitalTwin/FileConfirmationCard.vue'
import FileDeclinedCard from './item/cards/DigitalTwin/FileDeclinedCard.vue'
import FileErrorCard from './item/cards/DigitalTwin/FileErrorCard.vue'

export default defineComponent({
    name: 'VerificationItem',
    components: {
        ShadowCard,
        NotFoundCard,
        TechnicalProblemCard,
        SupportCard,
        ContactCard,
        PadesCard,
        CertifyingCard,
        SigningCard,
        FileConfirmationCard,
        FileDeclinedCard,
        FileErrorCard,
        PdfViewer,
    },
    mixins: [i18nWrapperMixin],
    provide: {
        isBeforeDetailedVerifiedMigration(event) {
            const eventDate = new Date(event.date)
            if (!(eventDate instanceof Date) || isNaN(eventDate)) {
                return false
            }
            const migrationDate = new Date('2021-04-22')
            return eventDate < migrationDate
        },
        issuerDisplayName(event) {
            if (event.issuer.name && this.isBeforeDetailedVerifiedMigration(event)) {
                return event.issuer.name
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
        },
    },
    inject: ['pdfjsWorkerSrc', 'pdfjsWorkerInstance', 'pdfjsCMapUrl', 'pdfjsIccUrl', 'pdfjsWasmUrl'],
    props: {
        verificationItem: {
            type: Object,
            required: true,
        },
        verifierInformation: {
            type: Object,
            required: true,
        },
        digitalTwinInformation: {
            type: Object,
            required: false,
        },
    },
    data() {
        return {
            showSupport: false,
            showContact: false,
            confirmationStep: true,
            digitalTwin: {
                confirmationStep: true,
                fileApproved: false,
            },
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

            if (
                !this.verificationItem.events ||
                (this.verificationItem.events && this.verificationItem.events.length === 0)
            ) {
                return this.verificationItem.offchainError || this.verificationItem.error
            } else {
                return this.verificationItem.offchainError && this.verificationItem.error
            }
        },
        isPades() {
            return this.verificationItem.pades === true
        },
        isNotFound() {
            return (
                !this.isLoading &&
                !this.isTechnicalProblem &&
                !this.isPades &&
                (!this.verificationItem.events ||
                    (this.verificationItem.events && this.verificationItem.events.length === 0))
            )
        },
        isSigning() {
            return (
                this.verificationItem.events &&
                this.verificationItem.events.filter((event) => event.scope === 'sign').length > 0
            )
        },
        digitalTwinDownloadFileName() {
            if (!this.digitalTwinInformation.active) {
                return null
            }

            const shortHash = this.verificationItem.hash.substr(2, 8)

            return `digital_twin_${shortHash}.pdf`
        },
    },
    methods: {
        translate(key) {
            return this._$t(key)
        },
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
    },
})
</script>
