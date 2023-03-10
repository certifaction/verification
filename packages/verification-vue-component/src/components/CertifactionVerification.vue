<template>
    <div class="certifaction-verification"
         :class="{ dragover: dropbox.draggingOver }"
         @dragover.prevent="dragOver"
         @dragleave="dragLeave"
         @drop.prevent="handleDrop">

        <VerificationDropBox v-if="!digitalTwinModeActive"
                             :first-verification="filteredVerificationItems.length === 0"/>

        <VerificationDemo v-if="demo !== false && !digitalTwinModeActive"
                          @verify-demo="verifyDemo"
                          @dragging-demo-doc="onDraggingDemoDoc"/>

        <div v-if="filteredVerificationItems.length"
             class="verification-item-list"
             :class="{ 'digital-twin': digitalTwinModeActive }"
             ref="results">
            <VerificationItem v-for="verificationItem in filteredVerificationItems"
                              :key="verificationItem.hash"
                              :verification-item="verificationItem"
                              :verifier-information="verifierInformation"
                              :digital-twin-information="digitalTwinStatus"/>
        </div>

        <VerificationFileSelector v-if="!digitalTwinModeActive" @files-selected="verify"
                                  :first-verification="filteredVerificationItems.length === 0"/>

        <div v-if="!digitalTwinModeActive" class="powered-by">
            <span class="label">{{ _$t('verification.poweredBy.label') }}</span>
            <a href="https://certifaction.com" target="_blank">
                <img src="../assets/img/certifaction_logo.svg" alt="Certifaction"/>
            </a>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import { CertifactionEthVerifier, Interface, VerifierInterface } from '@certifaction/verification-core'
import i18nWrapperMixin from '../mixins/i18n-wrapper'
import VerificationDemo from './Verification/VerificationDemo.vue'
import VerificationFileSelector from './Verification/VerificationFileSelector.vue'
import VerificationDropBox from './Verification/VerificationDropBox.vue'
import VerificationItem from './Verification/VerificationItem.vue'
import demoDocuments from '../resources/demo/demo-documents'
import axios from 'axios'

export default {
    name: 'CertifactionVerification',
    mixins: [
        i18nWrapperMixin
    ],
    components: {
        VerificationDemo,
        VerificationFileSelector,
        VerificationDropBox,
        VerificationItem
    },
    props: {
        demo: {
            type: Boolean,
            required: false,
            default: false
        },
        hashingService: {
            type: Object,
            required: true
        },
        pdfReaderService: {
            type: Object,
            required: true
        },
        pdfjsWorkerSrc: {
            type: String,
            required: false
        },
        pdfjsWorkerInstance: {
            type: Worker,
            required: false
        },
        pdfjsCMapUrl: {
            type: String,
            required: true
        },
        providerUrl: {
            type: String,
            required: false
        },
        legacyContractAddress: {
            type: String,
            required: false
        },
        legacyContractFallbackAddresses: {
            type: Array,
            required: false
        },
        claimContractAddress: {
            type: String,
            required: false
        },
        acceptedIssuerKey: {
            type: String,
            required: false
        },
        certifactionApiUrl: {
            type: String,
            required: false
        },
        offchainVerifier: {
            type: Object,
            required: false,
            validator(value) {
                Interface.ensureImplements(value, VerifierInterface)
                return true
            }
        }
    },
    provide() {
        return {
            pdfjsWorkerSrc: this.pdfjsWorkerSrc,
            pdfjsWorkerInstance: this.pdfjsWorkerInstance,
            pdfjsCMapUrl: this.pdfjsCMapUrl
        }
    },
    data() {
        return {
            certifactionEthVerifier: new CertifactionEthVerifier(
                this.providerUrl,
                this.legacyContractAddress,
                this.legacyContractFallbackAddresses,
                this.claimContractAddress,
                this.acceptedIssuerKey,
                this.certifactionApiUrl
            ),
            verificationItems: [],
            draggingDemoDoc: undefined,
            dropbox: {
                draggingOver: false,
                dragLeaveLocked: false
            },
            digitalTwin: {
                error: false,
                fileUrl: null
            }
        }
    },
    computed: {
        filteredVerificationItems() {
            return this.verificationItems.map(item => {
                if (item.hash === undefined && !item.error) {
                    return {
                        hashed: false
                    }
                }
                return {
                    hashed: true,
                    ...item
                }
            })
        },
        verifierInformation() {
            return {
                net: this.certifactionEthVerifier.certifactionEthClient.eth.currentProvider.host.indexOf('goerli') >= 0 ? 'goerli.etherscan.io' : 'etherscan.io',
                certifactionApiUrl: this.certifactionApiUrl
            }
        },
        digitalTwinInformation() {
            const searchParams = new URLSearchParams(window.location.search)
            if (searchParams.has('file') && window.location.hash.length > 1) {
                return {
                    fileUrl: searchParams.get('file'),
                    decryptionKey: window.location.hash.split('#')[1]
                }
            }

            return null
        },
        digitalTwinModeActive() {
            return this.digitalTwinInformation !== null
        },
        digitalTwinStatus() {
            return { ...this.digitalTwin, ...{ active: this.digitalTwinModeActive } }
        }
    },
    methods: {
        async verify(files) {
            this.$emit('verificationStart')

            this.verificationItems = []

            try {
                for (const file of files) {
                    this.verificationItems.push({ file, name: file.name })
                }

                for (const [key, item] of this.verificationItems.entries()) {
                    this.verifyItem(item, key)
                }

                await this.$nextTick()

                VueScrollTo.scrollTo(this.$refs.results, 400)
            } catch (e) {
                console.error(`Error while verifying files: ${e.name} - ${e.message}`)
            }

            this.$emit('verificationComplete')
        },
        async verifyItem(item, key) {
            const pdfBytes = await this.pdfReaderService.getPdfBytes(item.file)

            const [isPadesDocument, metadata, fileHash] = await Promise.all([
                this.pdfReaderService.hasCertifactionPadesSignatures(pdfBytes),
                this.pdfReaderService.extractMetadata(pdfBytes),
                this.hashingService.hashFile(pdfBytes)
            ])

            let verification = null

            if (isPadesDocument) {
                verification = {
                    pades: true,
                    hash: fileHash,
                    name: item.name
                }
            } else {
                let decryptionKey = null
                if (metadata && metadata.CertifactionEncryptionPrivateKey) {
                    decryptionKey = metadata.CertifactionEncryptionPrivateKey
                }

                verification = await this.certifactionEthVerifier.verify(fileHash, decryptionKey)
                if (this.offchainVerifier) {
                    verification = await this.offchainVerification(verification, decryptionKey)
                }
                verification.pades = false
            }

            const oldResult = JSON.stringify(this.verificationItems[key])
            const newResult = JSON.stringify({ ...item, ...verification })

            if (oldResult !== newResult) {
                verification.loaded = true
                Vue.set(this.verificationItems, key, { ...item, ...verification })
            }
        },
        async offchainVerification(verification, decryptionKey) {
            // TODO(Cyrill): Simplify offchain verification
            // Make a call to the off-chain validator
            try {
                const offchainVerification = await this.offchainVerifier.verify(verification.hash)

                if (offchainVerification) {
                    if (offchainVerification.encrypted && offchainVerification.claims && offchainVerification.claims.length > 0) {
                        const claimVerification = await this.certifactionEthVerifier.certifactionClaimVerifier.resolveAndVerifyClaims(offchainVerification.claims, decryptionKey)
                        offchainVerification.claims = claimVerification.claims

                        if (!offchainVerification.revoked) {
                            offchainVerification.revoked = claimVerification.revoked
                        }
                        if (!offchainVerification.issuerVerified && typeof claimVerification.issuerVerified === 'boolean') {
                            offchainVerification.issuerVerified = claimVerification.issuerVerified
                        }
                        if (!offchainVerification.issuerAddress && claimVerification.issuerAddress) {
                            offchainVerification.issuerAddress = claimVerification.issuerAddress
                        }
                        if (!offchainVerification.issuerName && claimVerification.issuerName) {
                            offchainVerification.issuerName = claimVerification.issuerName
                        }
                        if (!offchainVerification.issuerVerifiedBy && claimVerification.issuerVerifiedBy) {
                            offchainVerification.issuerVerifiedBy = claimVerification.issuerVerifiedBy
                        }
                        if (!offchainVerification.issuerVerifiedImg && claimVerification.issuerVerifiedImg) {
                            offchainVerification.issuerVerifiedImg = claimVerification.issuerVerifiedImg
                        }

                        // Merge events from decrypted claims with the events from the verify endpoint
                        offchainVerification.events = claimVerification.events.map(claimEvent => {
                            const offchainEvent = offchainVerification.events.find(offchainEvent => offchainEvent.ref === claimEvent.ref)
                            const newEvent = { ...claimEvent }

                            if (offchainEvent.date) {
                                newEvent.date = offchainEvent.date
                            }
                            if (offchainEvent.on_blockchain) {
                                newEvent.on_blockchain = offchainEvent.on_blockchain
                            }

                            return newEvent
                        })
                    }

                    if (verification.events && verification.events.length > 0 && offchainVerification.status !== 'registering') {
                        // If it's already verified on blockchain, do not override all values;
                        // just issuerName & issuer verifier can be taken from off-chain information
                        if (!verification.issuerName && offchainVerification.issuerName) {
                            verification.issuerName = offchainVerification.issuerName
                        }
                        if (!verification.issuerVerified && typeof offchainVerification.issuerVerified === 'boolean') {
                            verification.issuerVerified = offchainVerification.issuerVerified
                        }
                        if (!verification.issuerVerifiedBy && offchainVerification.issuerVerifiedBy) {
                            verification.issuerVerifiedBy = offchainVerification.issuerVerifiedBy
                        }
                        if (!verification.issuerVerifiedImg && offchainVerification.issuerVerifiedImg) {
                            verification.issuerVerifiedImg = offchainVerification.issuerVerifiedImg
                        }

                        if (typeof offchainVerification.on_blockchain === 'boolean') {
                            verification.on_blockchain = offchainVerification.on_blockchain
                        }
                        if (typeof offchainVerification.revoked === 'boolean') {
                            verification.revoked = offchainVerification.revoked
                        }

                        if (offchainVerification.events.length > 0) {
                            const mergedEvents = []

                            verification.events = verification.events.map(event => {
                                const offchainEvent = offchainVerification.events.find(offchainEvent => offchainEvent.ref === event.ref)

                                if (!offchainEvent) {
                                    return event
                                }

                                const newEvent = { ...event }

                                if (offchainEvent.issuer) {
                                    const issuer = { ...event.issuer }
                                    if (!issuer.id && offchainEvent.issuer.id) {
                                        issuer.id = offchainEvent.issuer.id
                                    }
                                    if (!issuer.name && offchainEvent.issuer.name) {
                                        issuer.name = offchainEvent.issuer.name
                                    }
                                    if (!issuer.name_verified && typeof offchainEvent.issuer.name_verified === 'boolean') {
                                        issuer.name_verified = offchainEvent.issuer.name_verified
                                    }
                                    if (!issuer.email && offchainEvent.issuer.email) {
                                        issuer.email = offchainEvent.issuer.email
                                    }
                                    if (!issuer.email_verified && typeof offchainEvent.issuer.email_verified === 'boolean') {
                                        issuer.email_verified = offchainEvent.issuer.email_verified
                                    }

                                    if (offchainEvent.issuer.verified_by) {
                                        const verifiedBy = { ...event.issuer.verified_by }
                                        if (!verifiedBy.name && offchainEvent.issuer.verified_by.name) {
                                            verifiedBy.name = offchainEvent.issuer.verified_by.name
                                        }
                                        if (!verifiedBy.image && offchainEvent.issuer.verified_by.image) {
                                            verifiedBy.image = offchainEvent.issuer.verified_by.image
                                        }

                                        issuer.verified = true
                                        issuer.verified_by = verifiedBy
                                    }

                                    newEvent.issuer = issuer
                                }

                                if (offchainEvent.signature) {
                                    const signature = { ...event.signature }
                                    if (!signature.level && offchainEvent.signature.level) {
                                        signature.level = offchainEvent.signature.level
                                    }
                                    if (!signature.jurisdiction && offchainEvent.signature.jurisdiction) {
                                        signature.jurisdiction = offchainEvent.signature.jurisdiction
                                    }

                                    newEvent.signature = signature
                                }

                                mergedEvents.push(offchainEvent.ref)

                                return newEvent
                            })

                            const unknownOffchainEvents = offchainVerification.events.filter(offchainEvent => mergedEvents.indexOf(offchainEvent.ref) < 0)
                            verification.events = [
                                ...verification.events,
                                ...unknownOffchainEvents
                            ]
                        }
                    } else {
                        // File not found on blockchain and offchain status is registering
                        verification = {
                            ...verification,
                            ...offchainVerification
                        }
                    }

                    // Use legacy issuerVerifiedImg to support encrypted claims in progress (https://certifaction.atlassian.net/browse/BP-2741)
                    if (verification.issuerVerifiedImg && verification.events && verification.events.length > 0) {
                        verification.events = verification.events.map(event => {
                            if (event.issuer.verified_by && !event.issuer.verified_by.image) {
                                event.issuer.verified_by.image = verification.issuerVerifiedImg
                            }

                            return event
                        })
                    }
                }
            } catch (e) {
                console.error(`Error while verifying by offchain verification: ${e.name} - ${e.message}`)
                verification.offchainError = true
            }

            console.log(`Verification result for file ${verification.hash}:`, JSON.parse(JSON.stringify(verification)))

            return verification
        },
        async processDigitalTwinUrl() {
            if (!this.digitalTwinInformation.decryptionKey) {
                console.log('No decryption key')
                this.digitalTwin.error = true
                return
            }

            axios.defaults.headers.common['Certifaction-Analytics-Dt'] = true

            try {
                const documentUrl = `${this.digitalTwinInformation.fileUrl}#${this.digitalTwinInformation.decryptionKey}`
                const fetchedDocumentObject = await this.pdfReaderService.fetchDocument(documentUrl)

                if (fetchedDocumentObject.pdfBytes instanceof Uint8Array && fetchedDocumentObject.pdfBytes.length > 0) {
                    const decryptedFile = new File([fetchedDocumentObject.pdfBytes.buffer], '', {
                        type: 'application/pdf'
                    })

                    await this.verify([decryptedFile])

                    this.digitalTwin.fileUrl = URL.createObjectURL(decryptedFile)
                } else {
                    this.digitalTwin.error = true
                }
            } catch (e) {
                if (!(e instanceof Error) && e.error?.message) {
                    e = new Error(e.error.message)
                }
                console.error(`Error while processing digital twin url: ${e.name} - ${e.message}`)
                this.digitalTwin.error = true
            }
        },
        onDraggingDemoDoc(demoDoc) {
            this.draggingDemoDoc = demoDoc
        },
        async verifyDemo(type) {
            if (demoDocuments[type]) {
                this.verificationItems = [demoDocuments[type]]
                await this.$nextTick()
                VueScrollTo.scrollTo(this.$refs.results, 400)
            }
        },
        handleDrop(e) {
            if (this.digitalTwinModeActive) {
                return
            }

            this.dropbox.draggingOver = false
            this.verify(e.dataTransfer.files)
        },
        async dragOver() {
            if (this.digitalTwinModeActive) {
                return
            }

            if (!this.dropbox.draggingOver) {
                this.dropbox.draggingOver = true
                this.dropbox.dragLeaveLocked = true

                window.setTimeout(() => {
                    this.dropbox.dragLeaveLocked = false
                }, 100)
            }
        },
        dragLeave() {
            if (!this.dropbox.dragLeaveLocked) {
                this.dropbox.draggingOver = false
            }
        }
    },
    async mounted() {
        if (this.digitalTwinInformation) {
            this.$emit('initialized', true)
            await this.processDigitalTwinUrl()
        } else {
            this.$emit('initialized', false)
        }
    }
}
</script>
