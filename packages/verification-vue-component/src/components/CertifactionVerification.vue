<template>
    <div class="certifaction-verification">
        <VerificationDemo v-if="demo !== false" @verifyDemo="verifyDemo" @draggingDemoDoc="onDraggingDemoDoc"/>

        <VerificationDropBox @filesDropped="verify" @drop="drop"/>

        <div v-if="filteredVerificationItems.length" class="verification-item-list" ref="results">
            <VerificationItem v-for="verificationItem in filteredVerificationItems"
                              :key="verificationItem.hash"
                              :verificationItem="verificationItem"/>
        </div>

        <div class="powered-by">
            <span class="label">{{ _$t('verification.poweredBy.label') }}</span>
            <a href="https://certifaction.io" target="_blank">
                <img src="../assets/img/certifaction_logo.svg" alt="Certifaction"/>
            </a>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import {
    CertifactionEthVerifier,
    hashingService,
    Interface,
    mapVerificationItemType,
    VerifierInterface
} from '@certifaction/verification-core'
import i18nWrapperMixin from '../mixins/i18n-wrapper'
import VerificationDemo from './Verification/VerificationDemo.vue'
import VerificationDropBox from './Verification/VerificationDropBox.vue'
import VerificationItem from './Verification/items/VerificationItem.vue'
import demoDocuments from '../resources/demo/demo-documents'

export default {
    name: 'CertifactionVerification',
    mixins: [
        i18nWrapperMixin
    ],
    components: {
        VerificationDemo,
        VerificationDropBox,
        VerificationItem
    },
    props: {
        demo: {
            type: Boolean,
            required: false,
            default: false
        },
        enableClaims: {
            type: Boolean,
            required: false,
            default: false
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
    data() {
        return {
            certifactionEthVerifier: new CertifactionEthVerifier(
                this.enableClaims,
                this.providerUrl,
                this.legacyContractAddress,
                this.legacyContractFallbackAddresses,
                this.claimContractAddress,
                this.acceptedIssuerKey,
                this.certifactionApiUrl
            ),
            verificationItems: [],
            draggingDemoDoc: undefined
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
                    type: mapVerificationItemType(item),
                    ...item
                }
            })
        }
    },
    methods: {
        async verify(files) {
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
                console.log(e)
            }
        },
        async verifyItem(item, key) {
            let verification = {}

            try {
                const hash = await hashingService.hashFile(item.file)
                verification = await this.certifactionEthVerifier.verify(hash)

                Vue.set(this.verificationItems, key, { ...item, ...verification })

                if (this.offchainVerifier) {
                    verification = await this.offchainVerification(item, verification)
                }
            } catch (e) {
                console.log('An error occurred during hashing & retrieval of information', e)
                verification.error = e
            } finally {
                verification.loaded = true
            }

            Vue.set(this.verificationItems, key, { ...item, ...verification })
        },
        async offchainVerification(item, verification) {
            // Make a call to the off-chain validator
            try {
                const offchainVerification = await this.offchainVerifier.verify(verification.hash)

                if (offchainVerification) {
                    if (!verification.events && offchainVerification.status === 'registering') {
                        // File not found on blockchain and offchain status is registering
                        const identityVerifier = {}
                        if (offchainVerification.issuerVerifiedBy) {
                            identityVerifier.name = offchainVerification.issuerVerifiedBy
                        }
                        if (offchainVerification.issuerVerifiedImg) {
                            identityVerifier.image = offchainVerification.issuerVerifiedImg
                        }

                        verification = {
                            ...verification,
                            ...offchainVerification,
                            // TODO(Cyrill): Remove when verify endpoint returns an events array
                            events: [{
                                scope: 'register',
                                issuer: offchainVerification.issuerName,
                                identityVerifier: (Object.keys(identityVerifier).length > 0) ? identityVerifier : null
                            }]
                        }
                    } else if (['registered', 'registering', 'revoking', 'revoked'].indexOf(offchainVerification.status) >= 0) {
                        // If it's already verified on blockchain, do not override all values;
                        // just issuerName & issuer verifier can be taken from off-chain information
                        if (!verification.issuerName && offchainVerification.issuerName) {
                            verification.issuerName = offchainVerification.issuerName
                        }
                        if (!verification.issuerVerifiedBy && offchainVerification.issuerVerifiedBy) {
                            verification.issuerVerified = offchainVerification.issuerVerified
                            verification.issuerVerifiedBy = offchainVerification.issuerVerifiedBy
                        }
                        if (!verification.issuerVerifiedImg && offchainVerification.issuerVerifiedImg) {
                            verification.issuerVerifiedImg = offchainVerification.issuerVerifiedImg
                        }

                        if (verification.events.length > 0) {
                            verification.events = verification.events.map(event => {
                                const newEvent = { ...event }
                                const identityVerifier = { ...event.identityVerifier }

                                if (!event.issuer && offchainVerification.issuerName) {
                                    newEvent.issuer = offchainVerification.issuerName
                                }
                                if (!identityVerifier.name && offchainVerification.issuerVerifiedBy) {
                                    identityVerifier.name = offchainVerification.issuerVerifiedBy
                                }
                                if (!identityVerifier.image && offchainVerification.issuerVerifiedImg) {
                                    identityVerifier.image = offchainVerification.issuerVerifiedImg
                                }

                                if (Object.keys(identityVerifier).length > 0) {
                                    newEvent.identityVerifier = identityVerifier
                                }

                                return newEvent
                            })
                        }
                    }
                }
            } catch (e) {
                verification.offchainError = true
            }

            return verification
        },
        onDraggingDemoDoc(demoDoc) {
            this.draggingDemoDoc = demoDoc
        },
        drop() {
            if (this.draggingDemoDoc) {
                this.verifyDemo(this.draggingDemoDoc)
            }
        },
        async verifyDemo(type) {
            if (demoDocuments[type]) {
                this.verificationItems = [demoDocuments[type]]
                await this.$nextTick()
                VueScrollTo.scrollTo(this.$refs.results, 400)
            }
        }
    }
}
</script>
