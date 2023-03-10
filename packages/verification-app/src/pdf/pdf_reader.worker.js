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

            case 'extract_claim_encryption_keys': {
                const encryptionKeys = await PdfReaderWasmWrapper.extractClaimEncryptionKeys(e.data.pdfBytes)
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

            case 'fetch_document': {
                const fetchedDocumentObject = await PdfReaderWasmWrapper.fetchDocument(
                    e.data.digitalArchiveUri,
                    e.data.encryptionKeyPassword
                )
                if (fetchedDocumentObject !== null && 'error' in fetchedDocumentObject) {
                    throw fetchedDocumentObject.error
                }

                self.postMessage({
                    status: true,
                    fetchedDocumentObject
                })
                break
            }

            case 'has_certifaction_pades_signatures': {
                const hasCertifactionPadesSignatures = await PdfReaderWasmWrapper.hasCertifactionPadesSignatures(e.data.pdfBytes)
                if (typeof hasCertifactionPadesSignatures === 'object' && 'error' in hasCertifactionPadesSignatures) {
                    throw hasCertifactionPadesSignatures.error
                }

                self.postMessage({
                    status: true,
                    hasCertifactionPadesSignatures
                })
                break
            }

            default: {
                throw new Error(`pdf_reader worker: cmd "${e.data.cmd}" invalid`)
            }
        }
    } catch (e) {
        self.postMessage({ status: false, error: e })
    }
}, false)
