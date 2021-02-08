import vue from 'rollup-plugin-vue'
import image from '@rollup/plugin-image'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import ignore from 'rollup-plugin-ignore'
import copy from 'rollup-plugin-copy'
import pkg from '../package.json'

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
        input: 'src/pdf/pdf.module.js',
        output: {
            file: 'dist/pdf/pdf.js',
            format: 'es'
        },
        plugins: [
            ignore(['./pdf.worker.js']),
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs(),
            copy({
                targets: [
                    {
                        src: [
                            '../../node_modules/pdfjs-dist/build/pdf.worker.js',
                            '../../node_modules/pdfjs-dist/build/pdf.worker.min.js',
                            '../../node_modules/pdfjs-dist/build/pdf.worker.js.map'
                        ],
                        dest: 'dist/pdf/',
                        rename: (name, extension) => `${name.replace('pdf.worker', 'pdfjs.worker')}.${extension}`
                    },
                    {
                        src: '../../node_modules/pdfjs-dist/web/pdf_viewer.css',
                        dest: 'dist/pdf/',
                        transform: (content) => content.toString()
                            .replaceAll('images/', '~@certifaction/verification-vue-component/dist/pdf/images/')
                            .replaceAll('.pdfViewer', '.viewer-container .viewer')
                    },
                    { src: '../../node_modules/pdfjs-dist/web/images', dest: 'dist/pdf/' },
                    { src: '../../node_modules/pdfjs-dist/cmaps', dest: 'dist/pdf/' }
                ]
            })
        ]
    },
    {
        input: 'src/pdf/pdf_viewer.module.js',
        output: {
            file: 'dist/pdf/pdf_viewer.js',
            format: 'es'
        },
        plugins: [
            ignore(['../build/pdf.js']),
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs()
        ]
    },
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
