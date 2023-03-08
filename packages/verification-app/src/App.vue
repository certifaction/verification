<template>
    <div id="app" class="verification-app">
        <CertifactionVerification :demo="false"
                                  :pdf-wasm-url="pdfReaderWasmUrl"
                                  :pdfjs-worker-instance="pdfjsWorker"
                                  :pdfjs-c-map-url="pdfjsCMapUrl"
                                  :provider-url="providerUrl"
                                  :legacy-contract-address="legacyContractAddress"
                                  :legacy-contract-fallback-addresses="legacyContractFallbackAddresses"
                                  :claim-contract-address="claimContractAddress"
                                  :accepted-issuer-key="acceptedIssuerKey"
                                  :certifaction-api-url="certifactionApiUrl"
                                  :offchain-verifier="CertifactionOffchainVerifier"/>
    </div>
</template>

<script>
import CertifactionOffchainVerifier from './lib/CertifactionOffchainVerifier'
import PdfjsWorker from '@certifaction/pdfjs/dist/pdfjs.worker.min'

export default {
    name: 'App',
    components: {
        CertifactionVerification: () =>
            import(/* webpackChunkName: "certifaction-verification" */ '@certifaction/verification-vue-component')
                .then(({ CertifactionVerification }) => CertifactionVerification)
    },
    data() {
        const pdfWasmVersion = process.env.VUE_APP_PDF_WASM_VERSION
        const cacheBuster = process.env.VUE_APP_CACHE_BUSTER
        const cdnBaseUrl = process.env.VUE_APP_CERTIFACTION_CDN_BASE_URL

        return {
            pdfReaderWasmUrl: new URL(`/wasm/pdf-${pdfWasmVersion}/pdf_reader.wasm?t=${cacheBuster}`, cdnBaseUrl),
            pdfjsWorker: new PdfjsWorker(),
            pdfjsCMapUrl: 'pdf/cmaps/',
            providerUrl: process.env.VUE_APP_PROVIDER_URL,
            legacyContractAddress: process.env.VUE_APP_LEGACY_CONTRACT_ADDRESS,
            claimContractAddress: process.env.VUE_APP_CLAIM_CONTRACT_ADDRESS,
            acceptedIssuerKey: process.env.VUE_APP_ACCEPTED_ISSUER_KEY,
            certifactionApiUrl: process.env.VUE_APP_CERTIFACTION_API_URL,
            CertifactionOffchainVerifier
        }
    },
    computed: {
        locale() {
            const searchParams = new URLSearchParams(window.location.search)
            return searchParams.has('lang') ? searchParams.get('lang') : 'en'
        },
        legacyContractFallbackAddresses() {
            const fallbackAddresses = process.env.VUE_APP_LEGACY_CONTRACT_FALLBACK_ADDRESSES
            return (fallbackAddresses && fallbackAddresses.length > 0) ? fallbackAddresses.split(',') : []
        }
    },
    mounted() {
        this.$i18n.locale = this.locale
    }
}
</script>

<style lang="scss">
@import "assets/scss/app";
</style>
