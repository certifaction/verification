const path = require('path')

module.exports = {
  outputDir: path.resolve(__dirname, 'dist'),
  runtimeCompiler: true,
  productionSourceMap: false,
  parallel: false,
  pages: {
    main: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
    },
  },
  chainWebpack: config => {
    config.module
      .rule('workers')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .options({inline: true, name: 'worker.[hash].js'})
      .end();
    config.module.rule('wasms')
      .test(/\.wasm$/)
      .use('wasm-loader')
      .loader('wasm-loader')
      .end()
  },
  configureWebpack: {
    optimization: {
      splitChunks: false
    }
  },
  css: {
    loaderOptions: {
      sass: {
        // @/ is an alias to src/
        // so this assumes you have a file named `src/variables.scss`
        data: `@import "@/assets/styles/variables.scss";`,
      },
    },
  },
  pluginOptions: {
    moment: {
      locales: ['en', 'de']
    }
  },
}
