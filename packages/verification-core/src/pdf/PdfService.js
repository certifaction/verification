import Bowser from 'bowser'
import PdfWasm from './pdf.wasm.init'
import PdfWorker from 'web-worker:./pdf.worker'

export default class PdfService {
    constructor(pdfWasmUrl) {
        this.pdfWasmUrl = new URL(pdfWasmUrl, location.origin)

        const browser = Bowser.getParser(window.navigator.userAgent)
        this.isNonChromiumEdge = browser.satisfies({ edge: '<=18' })

        if (this.isNonChromiumEdge === true) {
            PdfWasm.init(this.pdfWasmUrl.href)
        } else {
            this.worker = new PdfWorker()
            this.worker.postMessage({
                cmd: 'init',
                pdfWasmUrl: this.pdfWasmUrl.href
            })
        }
    }

    /**
     * Extract decryption key from pdf
     * @param pdfBytes
     * @returns {Promise<String>}
     */
    extractDecryptionKey(pdfBytes) {
        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                try {
                    const decryptionKey = self.wasmPdfExtractDecryptionKey(pdfBytes)
                    resolve(decryptionKey)
                } catch (err) {
                    reject(err)
                }
            } else {
                this.worker.addEventListener('message', function(e) {
                    if (e.data.status === true) {
                        resolve(e.data.decryptionKey)
                    } else {
                        reject(e.data.error)
                    }
                }, false)

                this.worker.postMessage({
                    cmd: 'extractDecryptionKey',
                    pdfBytes
                })
            }
        })
    }
}
