import Bowser from 'bowser'
import PdfWasmWrapper from './pdf.wasm.wrapper'
import PdfWorker from 'web-worker:./pdf.worker'

export default class PdfService {
    /**
     * PDF Service
     *
     * @constructor
     *
     * @param {URL} pdfWasmUrl
     */
    constructor(pdfWasmUrl) {
        this.pdfWasmUrl = pdfWasmUrl

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
            const wasmModule = await PdfWasmWrapper.load(this.pdfWasmUrl)

            if (this.isNonChromiumEdge === true) {
                PdfWasmWrapper.run(wasmModule)
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

                // Fail if the wasm isn't loaded after 15 seconds
                if (count > 1500) {
                    self.clearInterval(checkInterval)
                    return reject(new Error('PDF wasm wasn\'t loaded after 15 seconds.'))
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
            encryptionKeys = await PdfWasmWrapper.extractEncryptionKeys(pdfBytes)
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
                    cmd: 'extract_encryption_keys',
                    pdfWasmModule: this.pdfWasmModule,
                    pdfBytes
                })
            }
        })
    }

    /**
     * Decrypt the given pdf bytes with the given encryption key
     *
     * @param {Uint8Array} pdfBytes
     * @param {string} encryptionKey
     *
     * @returns {Promise<void>}
     */
    async decryptPdf(pdfBytes, encryptionKey) {
        await this.waitUntilLoaded()

        let decryptedPdfBytes = null
        if (this.isNonChromiumEdge === true) {
            decryptedPdfBytes = await PdfWasmWrapper.decryptPdf(pdfBytes, encryptionKey)
        }

        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                if (decryptedPdfBytes === null) {
                    reject(new Error('decryptedPdfBytes is null'))
                }

                resolve(decryptedPdfBytes)
            } else {
                const worker = new PdfWorker()

                worker.addEventListener('message', function(e) {
                    if (e.data.status === true) {
                        resolve(e.data.decryptedPdfBytes)
                    } else {
                        reject(e.data.error)
                    }
                }, false)

                worker.postMessage({
                    cmd: 'decrypt_pdf',
                    pdfWasmModule: this.pdfWasmModule,
                    pdfBytes,
                    encryptionKey
                })
            }
        })
    }
}
