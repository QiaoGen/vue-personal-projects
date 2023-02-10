const { defineConfig } = require('@vue/cli-service')
// 头部引入
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

configureWebpack: (config) => {
	const plugins = []
	plugins.push(new NodePolyfillPlugin())
}

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: { fallback: { fs: false ,path: false} },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: [
        'node-snap7'
      ]
    }
  },
})
