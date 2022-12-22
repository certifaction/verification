const { defineConfig } = require('@vue/cli-service')

process.env.VUE_APP_CACHE_BUSTER = new Date().getTime().toString()

module.exports = defineConfig({
    configureWebpack: {
        resolve: {
            fallback: {
                stream: require.resolve('stream-browserify'),
                crypto: require.resolve('crypto-browserify'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify')
            }
        }
    },
    chainWebpack: config => {
        config.module
            .rule('js')
            .exclude.add(/\.worker\.js$/)

        config.module
            .rule('worker')
            .test(/\.worker(\.min)?\.js$/)
            .use('worker-loader')
            .loader('worker-loader')
            .options({ filename: 'js/[name].[contenthash].js' })
            .end()

        config.plugin('copy')
            .tap(args => {
                args[0].patterns.push({
                    from: '@certifaction/pdfjs/dist/cmaps',
                    to: 'pdf/cmaps',
                    toType: 'dir',
                    context: '../../node_modules'
                })
                return args
            })
    },
    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'en',
            localeDir: 'locales',
            enableInSFC: false
        }
    }
})
