const { defineConfig } = require('@vue/cli-service')
// 头部引入
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

configureWebpack: (config) => {
  const plugins = []
  plugins.push(new NodePolyfillPlugin())
}

module.exports = defineConfig({
  publicPath: './', //静态资源相对引入路径
  transpileDependencies: true,
  configureWebpack: {
    resolve: { fallback: { fs: false, path: false } },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: [
        'node-snap7'
      ],
      builderOptions: {
        productName: '海康烟感包装线',
        appId: 'com.drogon.ga',
        asar: false,//是否加密
        mac: {
          icon: 'public/icon.png'
        },
        win: {
          icon: 'public/icon.png'
        }
      }
    }
  },
})
