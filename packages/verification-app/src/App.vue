<template>
    <div id="app" class="verification-app">
        <CertifactionVerification :demo="false"
                                  :pdf-wasm-url="pdfWasm"
                                  :pdfjs-worker-src="pdfjsWorkerSrc"
                                  :pdfjs-c-map-url="pdfjsCMapUrl"
                                  :provider-url="providerUrl"
                                  :legacy-contract-address="legacyContractAddress"
                                  :legacy-contract-fallback-addresses="legacyContractFallbackAddresses"
                                  :claim-contract-address="claimContractAddress"
                                  :accepted-issuer-key="acceptedIssuerKey"
                                  :certifaction-api-url="certifactionApiUrl"
                                  :offchain-verifier="CertifactionOffchainVerifier"
                                  :digital-twin-information="digitalTwinInformation"/>
    </div>
</template>

<script>
import CertifactionOffchainVerifier from './lib/CertifactionOffchainVerifier'
import pdfWasm from './wasm/pdf_reader.wasm'
import pdfjsWorkerSrc from '@certifaction/verification-vue-component/dist/pdf/pdf.worker.min'

export default {
    name: 'App',
    components: {
        CertifactionVerification: () =>
            import(/* webpackChunkName: "certifaction-verification" */ '@certifaction/verification-vue-component')
                .then(({ CertifactionVerification }) => CertifactionVerification)
    },
    data() {
        return {
            pdfWasm,
            pdfjsWorkerSrc,
            pdfjsCMapUrl: 'pdf/cmaps/',
            providerUrl: process.env.VUE_APP_PROVIDER_URL,
            legacyContractAddress: process.env.VUE_APP_LEGACY_CONTRACT_ADDRESS,
            claimContractAddress: process.env.VUE_APP_CLAIM_CONTRACT_ADDRESS,
            acceptedIssuerKey: process.env.VUE_APP_ACCEPTED_ISSUER_KEY,
            certifactionApiUrl: process.env.VUE_APP_CERTIFACTION_API_URL,
            CertifactionOffchainVerifier,
            searchParams: null,
            digitalTwinInformation: {
                fileUrl: null,
                decryptionKey: null
            }
        }
    },
    computed: {
        locale() {
            return this.searchParams.has('lang') ? this.searchParams.get('lang') : 'en'
        },
        legacyContractFallbackAddresses() {
            const fallbackAddresses = process.env.VUE_APP_LEGACY_CONTRACT_FALLBACK_ADDRESSES
            return (fallbackAddresses && fallbackAddresses.length > 0) ? fallbackAddresses.split(',') : []
        }
    },
    mounted() {
        this.searchParams = new URLSearchParams(location.search)
        if (this.searchParams.has('file')) {
            this.digitalTwinInformation = {
                fileUrl: this.searchParams.get('file'),
                decryptionKey: window.location.hash
            }
        }
        this.$i18n.locale = this.locale
    }
}
</script>

<style lang="scss">
@import "assets/scss/app";
</style>
