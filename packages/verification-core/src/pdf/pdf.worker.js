import PdfWasm from './pdf.wasm.init'

self.addEventListener('message', async (e) => {
    try {
        switch (e.data.cmd) {
            case 'init':
                try {
                    await PdfWasm.init(e.data.pdfWasmUrl)
                    self.postMessage(true)
                } catch (e) {
                    console.error(`Error while initializing PDF wasm: ${e.name} - ${e.message}`)
                    self.postMessage(false)
                }
                break

            case 'extractEncryptionKeys':
                const encryptionKeys = self.wasmPdfExtractEncryptionKeys(e.data.pdfBytes)
                self.postMessage({
                    status: true,
                    encryptionKeys
                })
                break
        }
    } catch (error) {
        self.postMessage({ status: false, error: error.message })
    }
}, false)
