import wasmExec from '../wasm/wasm_exec.js'

export default {
    /**
     * Load the given PDF wasm
     *
     * @param {URL} pdfWasmUrl
     *
     * @returns {Promise<WebAssembly.Module>}
     */
    async load(pdfWasmUrl) {
        // Polyfill
        if (!WebAssembly.compileStreaming) {
            WebAssembly.compileStreaming = async (source) => {
                const response = await source
                const arrayBuffer = await response.arrayBuffer()
                return WebAssembly.compile(arrayBuffer)
            }
        }

        return WebAssembly.compileStreaming(fetch(pdfWasmUrl))
    },
    /**
     * Run the given WebAssembly module (this function needs to be run without await, because it's blocking the execution)
     *
     * @param {WebAssembly.Module} module
     *
     * @returns {Promise<void>}
     */
    async run(module) {
        // Execute raw js code (wasm_exec.js)
        // eslint-disable-next-line no-eval,no-useless-call
        eval.call(null, wasmExec)

        // eslint-disable-next-line no-undef
        const go = new Go()

        const instance = await WebAssembly.instantiate(module, go.importObject)

        await go.run(instance)
    },
    /**
     * Wait until the PDF wasm is ready
     *
     * @returns {Promise<void>}
     */
    waitUntilReady() {
        return new Promise((resolve, reject) => {
            if (typeof self.wasmPdfReaderReady !== 'undefined' && self.wasmPdfReaderReady === true) {
                return resolve()
            }

            let count = 0

            const checkInterval = self.setInterval(() => {
                if (typeof self.wasmPdfReaderReady !== 'undefined' && self.wasmPdfReaderReady === true) {
                    self.clearInterval(checkInterval)
                    return resolve()
                }

                // Fail if the wasm isn't ready after 15 seconds
                if (count > 1500) {
                    self.clearInterval(checkInterval)
                    return reject(new Error('PDF wasm wasn\'t ready after 15 seconds.'))
                }

                count++
            }, 10)
        })
    },
    /**
     * Wrapper function for "wasmPdfExtractEncryptionKeys"
     *
     * @param {Uint8Array} pdfBytes
     *
     * @returns {Promise<Object>}
     */
    async extractEncryptionKeys(pdfBytes) {
        await this.waitUntilReady()
        return self.wasmPdfExtractEncryptionKeys(pdfBytes)
    },
    /**
     * Wrapper function for "wasmDecryptPdf"
     *
     * @param {Uint8Array} pdfBytes
     * @param {string} encryptionKey
     *
     * @returns {Promise<void>}
     */
    async decryptPdf(pdfBytes, encryptionKey) {
        await this.waitUntilReady()
        return self.wasmDecryptPdf(pdfBytes, encryptionKey)
    }
}
