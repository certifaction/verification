import Bowser from 'bowser'
import PdfWasm from './pdf.wasm.init'
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
        this.pdfWasmUrl = new URL(pdfWasmUrl, location.origin)
        this.pdfWasmInitialized = false

        const browser = Bowser.getParser(window.navigator.userAgent)
        this.isNonChromiumEdge = browser.satisfies({ edge: '<=18' })

        this.initPdfWasm()
    }

    /**
     * Separate function to initialize PDF wasm with await
     *
     * @returns {Promise<void>}
     */
    async initPdfWasm() {
        if (this.isNonChromiumEdge === true) {
            try {
                await PdfWasm.init(this.pdfWasmUrl.href)
                this.pdfWasmInitialized = true
            } catch (e) {
                console.error(`Error while initializing PDF wasm: ${e.name} - ${e.message}`)
            }
        } else {
            this.worker = new PdfWorker()

            this.worker.addEventListener('message', (event) => {
                if (event.data === true) {
                    this.pdfWasmInitialized = true
                }
            })

            this.worker.postMessage({
                cmd: 'init',
                pdfWasmUrl: this.pdfWasmUrl.href
            })
        }
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
    extractEncryptionKeys(pdfBytes) {
        return new Promise((resolve, reject) => {
            if (!this.pdfWasmInitialized) {
                // TODO(Cyrill): Wait until it's initialized
                reject(new Error('PDF wasm not initialized'))
            }

            if (this.isNonChromiumEdge === true) {
                try {
                    const encryptionKeys = self.wasmPdfExtractEncryptionKeys(pdfBytes)
                    resolve(encryptionKeys)
                } catch (e) {
                    reject(e)
                }
            } else {
                this.worker.addEventListener('message', (event) => {
                    if (event.data.status === true) {
                        resolve(event.data.encryptionKeys)
                    } else {
                        reject(event.data.error)
                    }
                })

                this.worker.postMessage({
                    cmd: 'extractEncryptionKeys',
                    pdfBytes
                })
            }
        })
    }
}
