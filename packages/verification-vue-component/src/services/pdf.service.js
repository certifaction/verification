// import PdfWasm from '../wasm/pdf.wasm.init'
import Bowser from 'bowser'
// import PdfWorker from '../workers/pdf.worker.js'
import PdfWasm from '../wasm/pdf.wasm.init'


export default {
    /**
     * Read keywords from pdf
     * @param pdfBytes
     * @returns {Promise<String>}
     */
    readKeywords (pdfBytes) {
        console.log("Service loaded")
        const browser = Bowser.getParser(window.navigator.userAgent)
        const isNonChromiumEdge = browser.satisfies({ edge: '<=18' })

        return new Promise(async (resolve, reject) => {
                try {
                    await PdfWasm.init()

                    const processedPdfBytes = self.wasmReadPdf(pdfBytes)

                    resolve(processedPdfBytes)
                } catch (err) {
                    reject(err)
                }
        })
    },
}
