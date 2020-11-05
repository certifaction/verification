import PdfWasm from './pdf.wasm.init'

self.addEventListener('message', async (e) => {
    try {
        switch (e.data.cmd) {
            case 'init':
                await PdfWasm.init(e.data.pdfWasmUrl)
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
