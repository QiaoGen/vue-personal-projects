module.exports = {
  publicPath: './', //静态资源以相对路径引入
  devServer: {
    hot: true
  },
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: [
        'serialport'
      ]
    }
  },
};