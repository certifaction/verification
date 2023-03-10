import { string } from 'rollup-plugin-string'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import pkg from '../package.json' assert { type: 'json' }

const externals = [
    ...(pkg.dependencies) ? Object.keys(pkg.dependencies) : [],
    ...(pkg.peerDependencies) ? Object.keys(pkg.peerDependencies) : []
]

const sourcemap = true

const plugins = [
    string({
        include: '**/wasm_exec.js'
    }),
    resolve(),
    commonjs(),
    babel({
        babelHelpers: 'runtime'
    })
]

const defaultConfig = {
    input: 'src/index.js',
    plugins,
    external: externals
}

export default [
    {
        ...defaultConfig,
        output: [
            {
                format: 'cjs',
                file: pkg.main,
                sourcemap
            },
            {
                format: 'es',
                file: pkg.module,
                sourcemap
            }
        ]
    }
]
