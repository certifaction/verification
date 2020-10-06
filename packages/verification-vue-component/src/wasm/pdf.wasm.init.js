// import pdfWasm from './pdf.wasm'
// eslint-disable-next-line import/no-webpack-loader-syntax
import wasmExec from './wasm_exec.js'

let pdfWasmModule = null
let pdfWasmInstance = null

export default {
    async init () {
        console.log("WASM LOADED")
        // Execute raw js code (wasm_exec.js)
        // eslint-disable-next-line no-eval,no-useless-call
        eval.call(null, wasmExec)

        // eslint-disable-next-line no-undef
        const go = new Go()

        try {
            // const wasm = cdfWasm({ });
            // pdfWasmInstance = wasm

            if (!WebAssembly.instantiateStreaming) { // polyfill
                WebAssembly.instantiateStreaming = async (resp, importObject) => {
                    const source = await (await resp).arrayBuffer()
                    const instance = await WebAssembly.instantiate(source, importObject)
                    return instance
                }
            }

            const pdfWasmUrl = new URL('/wasm/pdf.a5957117.wasm', self.location.origin)
            const fetchedWasm = await fetch(pdfWasmUrl)
            let { module, instance } = await WebAssembly.instantiateStreaming(fetchedWasm, go.importObject)

            pdfWasmModule = module
            pdfWasmInstance = instance

            this.run(go)
        } catch (err) {
            console.log('catch()', err)
        }
    },
    async run (go) {
        await go.run(pdfWasmInstance)
        pdfWasmInstance = await WebAssembly.instantiate(pdfWasmModule, go.importObject)
    },
}
