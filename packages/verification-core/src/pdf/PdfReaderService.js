import Bowser from 'bowser'
import PdfReaderWasmWrapper from './pdf_reader.wasm.wrapper'
import PdfReaderWorker from 'web-worker:./pdf_reader.worker'

export default class PdfReaderService {
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
            const wasmModule = await PdfReaderWasmWrapper.load(this.pdfWasmUrl)

            if (this.isNonChromiumEdge === true) {
                PdfReaderWasmWrapper.run(wasmModule)
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
                    return reject(new Error('PDF reader wasm wasn\'t loaded after 15 seconds.'))
                }

                count++
            }, 10)
        })
    }

    /**
     * Get pdf bytes (Uint8Array) of the give pdf file
     *
     * @param {File} pdfFile
     *
     * @returns {Promise<Uint8Array>}
     */
    getPdfBytes(pdfFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => {
                resolve(new Uint8Array(reader.result))
            }

            reader.onerror = reject

            reader.readAsArrayBuffer(pdfFile)
        })
    }

    /**
     * Extract metadata from pdf
     *
     * @param {Uint8Array} pdfBytes
     *
     * @returns {Promise<Object>}
     */
    async extractMetadata(pdfBytes) {
        await this.waitUntilLoaded()

        let metadata = null
        if (this.isNonChromiumEdge === true) {
            metadata = await PdfReaderWasmWrapper.extractMetadata(pdfBytes)
        }

        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                resolve(metadata)
            } else {
                const worker = new PdfReaderWorker()

                worker.addEventListener('message', (event) => {
                    if (event.data.status === true) {
                        resolve(event.data.metadata)
                    } else {
                        reject(event.data.error)
                    }
                })

                worker.postMessage({
                    cmd: 'extract_metadata',
                    pdfWasmModule: this.pdfWasmModule,
                    pdfBytes
                })
            }
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
            encryptionKeys = await PdfReaderWasmWrapper.extractEncryptionKeys(pdfBytes)
        }

        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                resolve(encryptionKeys)
            } else {
                const worker = new PdfReaderWorker()

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
    async decrypt(pdfBytes, encryptionKey) {
        await this.waitUntilLoaded()

        let decryptedPdfBytes = null
        if (this.isNonChromiumEdge === true) {
            decryptedPdfBytes = await PdfReaderWasmWrapper.decrypt(pdfBytes, encryptionKey)
        }

        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                if ('error' in decryptedPdfBytes) {
                    throw reject(decryptedPdfBytes.error)
                }

                resolve(decryptedPdfBytes)
            } else {
                const worker = new PdfReaderWorker()

                worker.addEventListener('message', function(e) {
                    if (e.data.status === true) {
                        resolve(e.data.decryptedPdfBytes)
                    } else {
                        reject(e.data.error)
                    }
                }, false)

                worker.postMessage({
                    cmd: 'decrypt',
                    pdfWasmModule: this.pdfWasmModule,
                    pdfBytes,
                    encryptionKey
                })
            }
        })
    }

    /**
     * Fetch document from digital archive
     *
     * @param {string} digitalArchiveUriWithEncryptionKey
     *
     * @returns {Promise<Object>}
     */
    async fetchDocument(digitalArchiveUriWithEncryptionKey) {
        await this.waitUntilLoaded()

        let fetchedDocumentObject = null
        if (this.isNonChromiumEdge === true) {
            fetchedDocumentObject = await PdfReaderWasmWrapper.fetchDocument(digitalArchiveUriWithEncryptionKey)
        }

        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                if ('error' in fetchedDocumentObject) {
                    throw reject(fetchedDocumentObject.error)
                }

                return resolve(fetchedDocumentObject)
            } else {
                const worker = new PdfReaderWorker()

                worker.addEventListener('message', (e) => {
                    if (e.data.status === true) {
                        return resolve(e.data.fetchedDocumentObject)
                    }
                    return reject(e.data.error)
                }, false)

                worker.postMessage({
                    cmd: 'fetch_document',
                    pdfWasmModule: this.pdfWasmModule,
                    digitalArchiveUriWithEncryptionKey
                })
            }
        })
    }

    /**
     * Check if the given document has Certifaction PAdES PDF signatures
     *
     * @param {Uint8Array} pdfBytes
     *
     * @returns {Promise<boolean>}
     */
    async hasCertifactionPadesSignatures(pdfBytes) {
        await this.waitUntilLoaded()

        let hasCertifactionPadesSignatures = null
        if (this.isNonChromiumEdge === true) {
            hasCertifactionPadesSignatures = PdfReaderWasmWrapper.hasCertifactionPadesSignatures(pdfBytes)
        }

        return new Promise((resolve, reject) => {
            if (this.isNonChromiumEdge === true) {
                if (typeof hasCertifactionPadesSignatures === 'object' && 'error' in hasCertifactionPadesSignatures) {
                    throw reject(hasCertifactionPadesSignatures.error)
                }

                return resolve(hasCertifactionPadesSignatures)
            } else {
                const worker = new PdfReaderWorker()

                worker.addEventListener('message', (e) => {
                    if (e.data.status === true) {
                        return resolve(e.data.hasCertifactionPadesSignatures)
                    }
                    return reject(e.data.error)
                }, false)

                worker.postMessage({
                    cmd: 'has_certifaction_pades_signatures',
                    pdfWasmModule: this.pdfWasmModule,
                    pdfBytes
                })
            }
        })
    }
}
