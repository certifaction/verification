import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import pkg from '../package.json'

const externals = [
    ...(pkg.dependencies) ? Object.keys(pkg.dependencies).filter(item => ['js-sha3'].indexOf(item) < 0) : [],
    ...(pkg.peerDependencies) ? Object.keys(pkg.peerDependencies) : []
]

const sourcemap = true

const plugins = [
    resolve(),
    commonjs(),
    babel({
        runtimeHelpers: true
    }),
    webWorkerLoader({
        targetPlatform: 'browser'
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
