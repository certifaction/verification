import Bowser from 'bowser'
import PdfWasm from './pdf.wasm.wrapper'
import PdfWorker from 'web-worker:./pdf.worker'

export default class PdfService {
    /**
     * PDF Service
     *
     * @constructor
     *
     * @param {string} pdfWasmUrl
     */
    constructor(pdfWasmUrl) {
        this.pdfWasmUrl = new URL(pdfWasmUrl, self.location.origin)

        const browser = Bowser.getParser(self.navigator.userAgent)
        this.isNonChromiumEdge = browser.satisfies({ edge: '<=18' })

        this.loadPdfWasm()
    }

    /**
     * Separate function to load PDF wasm with await
     *
     * @returns {Promise<void>}
     */
    async loadPdfWasm() {
        try {
            const wasmModule = await PdfWasm.load(this.pdfWasmUrl)

            if (this.isNonChromiumEdge === true) {
                PdfWasm.run(wasmModule)
            }

            this.pdfWasmModule = wasmModule
        } catch (e) {
            console.error(`Error while loading PDF wasm: ${e.name} - ${e.message}`)
        }
    }

    /**
     * Waits until the PDF wasm is loaded
     *
     * @returns {Promise<void>}
     */
    waitUntilLoaded() {
        return new Promise((resolve, reject) => {
            if (typeof this.pdfWasmModule !== 'undefined') {
                return resolve()
            }

            let count = 0

            const checkInterval = self.setInterval(() => {
                if (typeof this.pdfWasmModule !== 'undefined') {
                    self.clearInterval(checkInterval)
                    return resolve()
                }

                // Fail if the wasm isn't loaded after 1 second
                if (count > 100) {
                    self.clearInterval(checkInterval)
                    return reject(new Error('PDF wasm wasn\'t loaded after 1 second.'))
                }

                count++
            }, 10)
        })
    }

    /**
     * Reads the given file and returns an Uint8Array
     *
     * @param {File} file
     *
     * @returns {Promise<Uint8Array>}
     */
    readPdfBytes(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => {
                resolve(new Uint8Array(reader.result))
            }

            reader.onerror = (error) => {
                reject(error)
            }

            reader.readAsArrayBuffer(file)
        })
    }

    /**
     * Extract encryption keys from pdf
     *
     * @param {Uint8Array} pdfBytes
     *
     * @returns {Promise<Object>}
     */
    async extractEncryptionKeys(pdfBytes) {
        await this.waitUntilLoaded()

        let encryptionKeys = null
        if (this.isNonChromiumEdge === true) {
            encryptionKeys = await PdfWasm.extractEncryptionKeys(pdfBytes)
        }

        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                resolve(encryptionKeys)
            } else {
                const worker = new PdfWorker()

                worker.addEventListener('message', (event) => {
                    if (event.data.status === true) {
                        resolve(event.data.encryptionKeys)
                    } else {
                        reject(event.data.error)
                    }
                })

                worker.postMessage({
                    pdfWasmModule: this.pdfWasmModule,
                    pdfBytes
                })
            }
        })
    }
}
