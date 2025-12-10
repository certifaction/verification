import axios from 'axios'
import { type FileVerification } from '../src/verifier/CertifactionClaimVerifier.ts'

// This is an example of an offchain VerifierInterface's implementation
class CertifactionOffchainVerifierExample {
    async verify(fileHash) {
        try {
            const res = await axios.get(`https://api.certifaction.io/file/${fileHash}/verify`)

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

                const fileVerification: FileVerification = {
                    on_blockchain: data.on_blockchain,
                    issuerVerified: data.issuer_verified,
                    status: data.file.status,
                    encrypted: data.encrypted,
                    revoked: data.revoked,
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
                if (data.events && data.events.length > 0) {
                    fileVerification.events = data.events
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

export default new CertifactionOffchainVerifierExample()
