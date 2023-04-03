# hik-mes

## project 环境
```
node16.13.0
python3 环境
cmd管理员 npm install --global --production windows-build-tools
npm config set python "path to python" 指定npm python版本
node-snap7指定python2.7，但是node-gyp报错必须使用python3
```

## 注意事项
```
pluginOptions: {
    electronBuilder: {
        nodeIntegration: true,
        externals: [
        'node-snap7'
        ]
    }
}
预编译node-snap7
node-snap7必须加入"dependencies"

electron-log < V4.4.8
```

