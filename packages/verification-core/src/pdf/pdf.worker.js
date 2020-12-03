import PdfWasm from './pdf.wasm'

self.addEventListener('message', async (e) => {
    try {
        PdfWasm.run(e.data.pdfWasmModule)

        const encryptionKeys = await PdfWasm.extractEncryptionKeys(e.data.pdfBytes)

        self.postMessage({
            status: true,
            encryptionKeys
        })
    } catch (e) {
        self.postMessage({ status: false, error: e })
    }
}, false)
