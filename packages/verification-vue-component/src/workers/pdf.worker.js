import PdfWasm from '../wasm/pdf.wasm.init'

self.addEventListener('message', async (e) => {
    try {
        console.log("pdfwasm init")
        await PdfWasm.init()

        const pdfBytes = self.wasmProcessPdf(e.data.pdfBytes, e.data.watermarkPdfBytes, e.data.watermarkReplacements)

        self.postMessage({
            status: true,
            pdfBytes,
        })
    } catch (error) {
        self.postMessage({status: false, error: 'file encrypted'})
    }
}, false)

export default {

}
