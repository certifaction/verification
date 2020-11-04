<template>
    <div id="app" class="app">
        <CertifactionVerification :demo="false"
                                  :enable-claims="enableClaims"
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

export default {
    name: 'App',
    components: {
        CertifactionVerification: () =>
            import(/* webpackChunkName: "certifaction-verification" */ '@certifaction/verification-vue-component')
                .then(({ CertifactionVerification }) => CertifactionVerification)
    },
    data() {
        return {
            enableClaims: !!((process.env.VUE_APP_CLAIM_FF && process.env.VUE_APP_CLAIM_FF === 'true')),
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
            const searchParams = new URLSearchParams(location.search)
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
