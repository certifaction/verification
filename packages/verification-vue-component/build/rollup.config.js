import vue from 'rollup-plugin-vue'
import image from '@rollup/plugin-image'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import pkg from '../package.json' assert { type: 'json' }

const externals = [
    ...(pkg.dependencies) ? Object.keys(pkg.dependencies) : [],
    ...(pkg.peerDependencies) ? Object.keys(pkg.peerDependencies) : []
]
const externalExcludes = []

const sourcemap = true

const plugins = [
    vue({
        css: false
    }),
    image(),
    resolve({
        preferBuiltins: false
    }),
    commonjs(),
    babel()
]

const defaultConfig = {
    plugins,
    external: externals.filter(dep => !externalExcludes.includes(dep))
}

export default [
    {
        ...defaultConfig,
        input: 'src/index.js',
        output: [
            {
                format: 'cjs',
                file: pkg.main,
                exports: 'named',
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
