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
     * Extract encryption keys from pdf
     * @param pdfBytes
     * @returns {Promise<Object>}
     */
    extractEncryptionKeys(pdfBytes) {
        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                try {
                    const encryptionKeys = self.wasmPdfExtractEncryptionKeys(pdfBytes)
                    resolve(encryptionKeys)
                } catch (err) {
                    reject(err)
                }
            } else {
                this.worker.addEventListener('message', function(e) {
                    if (e.data.status === true) {
                        resolve(e.data.encryptionKeys)
                    } else {
                        reject(e.data.error)
                    }
                }, false)

                this.worker.postMessage({
                    cmd: 'extractEncryptionKeys',
                    pdfBytes
                })
            }
        })
    }
}
