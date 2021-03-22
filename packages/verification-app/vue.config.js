process.env.VUE_APP_CACHE_BUSTER = new Date().getTime().toString()

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
            .exclude.add(/\.worker(\.min)?\.js$/)

        config.module
            .rule('worker')
            .test(/\.worker(\.min)?\.js$/)
            .use('file-loader')
            .loader('file-loader')
            .tap(() => ({
                name: 'js/[name].[hash:8].[ext]',
                esModule: false
            }))

        config.plugin('copy')
            .tap(args => {
                args[0].push({
                    from: '@certifaction/verification-vue-component/dist/pdf/cmaps',
                    to: 'pdf/cmaps',
                    toType: 'dir',
                    context: '../../node_modules'
                })
                return args
            })
    }
}
