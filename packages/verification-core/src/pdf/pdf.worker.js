import PdfWasmWrapper from './pdf.wasm.wrapper'

self.addEventListener('message', async (e) => {
    try {
        PdfWasmWrapper.run(e.data.pdfWasmModule)

        switch (e.data.cmd) {
            case 'extract_encryption_keys': {
                const encryptionKeys = await PdfWasmWrapper.extractEncryptionKeys(e.data.pdfBytes)

                self.postMessage({
                    status: true,
                    encryptionKeys
                })
                break
            }

            case 'decrypt_pdf': {
                const decryptedPdfBytes = await PdfWasmWrapper.decryptPdf(e.data.pdfBytes, e.data.encryptionKey)
                if (decryptedPdfBytes === null) {
                    throw new Error('couldn\t decrypt pdf')
                }

                self.postMessage({
                    status: true,
                    decryptedPdfBytes
                })
                break
            }

            default: {
                throw new Error('invalid cmd')
            }
        }
    } catch (e) {
        self.postMessage({ status: false, error: e })
    }
}, false)
