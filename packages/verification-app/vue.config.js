module.exports = {
    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'en',
            localeDir: 'locales',
            enableInSFC: false
        }
    },
    chainWebpack: config => {
        config.module
            .rule('js')
            .exclude.add(/\.worker\.js$/)

        config.module
            .rule('worker')
            .test(/\.worker\.js$/)
            .use('worker-loader')
            .loader('worker-loader')
            .options({ filename: 'js/[name].[hash:8].js' })
            .end()

        config.module
            .rule('wasm')
            .test(/\.wasm$/)
            .type('javascript/auto')
            .use('file-loader')
            .loader('file-loader')
            .tap(() => ({
                name: 'wasm/[name].[hash:8].[ext]',
                esModule: false
            }))
    }
}
