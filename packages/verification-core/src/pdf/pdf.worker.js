import PdfWasmWrapper from './pdf.wasm.wrapper'

self.addEventListener('message', async (e) => {
    try {
        PdfWasmWrapper.run(e.data.pdfWasmModule)

        const encryptionKeys = await PdfWasmWrapper.extractEncryptionKeys(e.data.pdfBytes)

        self.postMessage({
            status: true,
            encryptionKeys
        })
    } catch (e) {
        self.postMessage({ status: false, error: e })
    }
}, false)
