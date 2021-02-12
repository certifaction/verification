import axios from 'axios'

// Off chain verifier, used for verification tool "@certifaction/verification-vue-component"
class CertifactionOffchainVerifier {
    async verify(fileHash) {
        try {
            const res = await axios.get(`${process.env.VUE_APP_CERTIFACTION_API_URL}file/${fileHash}/verify`)

            if (res.status === 200) {
                const data = res.data

                let issuerName = null
                if (data.user_name) {
                    issuerName = data.user_name
                } else if (data.issuer_name) {
                    issuerName = data.issuer_name
                }
                if (data.issuer_title && issuerName) {
                    issuerName = data.issuer_title + ' ' + issuerName
                }

                const fileVerification = {
                    onBlockchain: data.on_blockchain,
                    issuerVerified: data.issuer_verified,
                    status: data.file.status,
                    encrypted: data.encrypted,
                    revoked: data.revoked
                }

                if (data.issuer_address) {
                    fileVerification.issuerAddress = data.issuer_address
                }
                if (issuerName) {
                    fileVerification.issuerName = issuerName
                }
                if (data.issuer_verifiedby) {
                    fileVerification.issuerVerifiedBy = data.issuer_verifiedby
                } else if (fileVerification.issuerVerified === true) {
                    fileVerification.issuerVerifiedBy = 'Certifaction AG'
                }
                if (data.issuer_img) {
                    fileVerification.issuerVerifiedImg = data.issuer_img
                }
                if (data.claims && data.claims.length > 0) {
                    fileVerification.claims = data.claims
                }

                return fileVerification
            }

            throw new Error(`Unexpected status ${res.status}`)
        } catch (e) {
            if (e.response.status === 404) {
                return null
            }
            throw e
        }
    }
}

export default new CertifactionOffchainVerifier()
