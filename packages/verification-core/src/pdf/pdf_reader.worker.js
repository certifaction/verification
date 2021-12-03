import PdfReaderWasmWrapper from './pdf_reader.wasm.wrapper'

self.addEventListener('message', async (e) => {
    try {
        PdfReaderWasmWrapper.run(e.data.pdfWasmModule)

        switch (e.data.cmd) {
            case 'extract_metadata': {
                const metadata = await PdfReaderWasmWrapper.extractMetadata(e.data.pdfBytes)
                if (metadata !== null && 'error' in metadata) {
                    throw metadata.error
                }

                self.postMessage({
                    status: true,
                    metadata
                })
                break
            }

            case 'extract_encryption_keys': {
                const encryptionKeys = await PdfReaderWasmWrapper.extractEncryptionKeys(e.data.pdfBytes)
                if (encryptionKeys !== null && 'error' in encryptionKeys) {
                    throw encryptionKeys.error
                }

                self.postMessage({
                    status: true,
                    encryptionKeys
                })
                break
            }

            case 'decrypt': {
                const decryptedPdfBytes = await PdfReaderWasmWrapper.decrypt(e.data.pdfBytes, e.data.encryptionKey)
                if ('error' in decryptedPdfBytes) {
                    throw decryptedPdfBytes.error
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