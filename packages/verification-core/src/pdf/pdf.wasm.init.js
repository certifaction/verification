import wasmExec from '../wasm/wasm_exec.js'

let pdfWasmModule = null
let pdfWasmInstance = null

export default {
    async init(pdfWasmUrl) {
        // Execute raw js code (wasm_exec.js)
        // eslint-disable-next-line no-eval,no-useless-call
        eval.call(null, wasmExec)

        // eslint-disable-next-line no-undef
        const go = new Go()

        try {
            if (!WebAssembly.instantiateStreaming) { // polyfill
                WebAssembly.instantiateStreaming = async (resp, importObject) => {
                    const source = await (await resp).arrayBuffer()
                    const instance = await WebAssembly.instantiate(source, importObject)
                    return instance
                }
            }

            const fetchedWasm = await fetch(pdfWasmUrl)
            let { module, instance } = await WebAssembly.instantiateStreaming(fetchedWasm, go.importObject)

            pdfWasmModule = module
            pdfWasmInstance = instance

            this.run(go)
        } catch (err) {
            console.log('catch()', err)
        }
    },
    async run(go) {
        await go.run(pdfWasmInstance)
        pdfWasmInstance = await WebAssembly.instantiate(pdfWasmModule, go.importObject)
    }
}
