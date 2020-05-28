import axios from 'axios'

// This is an example of an OffchainVerifierInterface's implementation
class CertifactionVerifierExample {
    async verify (filehash) {
        try {
            const res =  await axios.get(`https://api.certifaction.io/file/${filehash}/verify`)
            if (res.status === 200) {
                const data = res.data
                return {
                    onBlockchain: data.on_blockchain,
                    issuer: data.issuer_address,
                    issuerName: data.user_name,
                    issuerVerified: data.issuer_verified,
                    revoked: data.revoked
                }
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

export default new CertifactionVerifierExample()