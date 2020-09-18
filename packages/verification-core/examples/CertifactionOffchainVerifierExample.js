import axios from 'axios'

// This is an example of an offchain VerifierInterface's implementation
class CertifactionOffchainVerifierExample {
    async verify(fileHash) {
        try {
            const res = await axios.get(`https://api.certifaction.io/file/${fileHash}/verify?offchainOnly=true`)
            if (res.status === 200) {
                const data = res.data
                let name = data.user_name
                if (data.issuer_title && data.issuer_title.length > 0) {
                    name = data.issuer_title + ' ' + name
                }

                return {
                    onBlockchain: data.on_blockchain,
                    issuerAddress: data.issuer_address,
                    issuerName: name,
                    issuerVerified: data.issuer_verified,
                    issuerVerifiedBy: data.issuer_verifiedby,
                    issuerVerifiedImg: data.issuer_img,
                    status: data.file.status,
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

export default new CertifactionOffchainVerifierExample()
