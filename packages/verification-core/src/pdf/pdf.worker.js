import PdfWasm from './pdf.wasm.init'

self.addEventListener('message', async (e) => {
    try {
        switch (e.data.cmd) {
            case 'init':
                await PdfWasm.init(e.data.pdfWasmUrl)
                break

            case 'extractDecryptionKey':
                const decryptionKey = self.wasmPdfExtractDecryptionKey(e.data.pdfBytes)
                self.postMessage({
                    status: true,
                    decryptionKey
                })
                break
        }
    } catch (error) {
        self.postMessage({ status: false, error: error.message })
    }
}, false)
