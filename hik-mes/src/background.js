'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import log from '@/utils/log.js'
import logReader from '@/utils/logReader'
import s7client from'@/lib/s7Client'
import tcpp from 'tcp-ping'

import mysql from '@/lib/mysql'

mysql.connect()




// log.initialize({ preload: true });
const isDevelopment = process.env.NODE_ENV !== 'production'

const connectPLC = function(){
  s7client.ConnectTo('192.168.2.1').then(res => {
    PLCInfo.plcConnetStatus = res
  }).catch(err => {
    PLCInfo.plcConnetStatus = err
  })
  s7client.MBRead().then(res => {
    log.info(res)
  }).catch(err => {
    log.error(err)
  })
}
connectPLC()

// 传递render页面 plc数据
var PLCInfo = {
  plcConnetStatus: s7client.plcConnetStatus,
}
ipcMain.on('plc-msg',function(event, ...arg){
  log.info('plc-msg:'+arg)
  switch(arg[0]){
    case 'getPLCInfo':
      event.sender.send('getPLCInfo-reply', PLCInfo)
    break; 
    case 'reconnectPLC':
      // s7client.ConnectTo('192.168.2.1')
      connectPLC()
      event.sender.send('getPLCInfo-reply', PLCInfo)
    break;
  }
})

//获取数据库数据
ipcMain.on('mysql-msg',function(event, ...arg){
    log.info('mysql-msg:'+arg)
    switch(arg[0]){
      case 'querySysConfig':
        mysql.querySysConfig().then(res => {
          event.sender.send('querySysConfig-reply', res)
        }).catch(err => {
          log.error(err)
        })
      break;
      case 'updateSysConfig':
        mysql.updateSysConfig(arg[1]).then(res => {
          event.sender.send('updateSysConfig-reply', res)
        }).catch(err => {
          log.error(err)
        })
      break;
      case 'queryBarcdList':
        mysql.queryBarcdList().then(res => {
          event.sender.send('queryBarcdList-reply', res)
        }).catch(err => {
          log.error(err)
        })
      break;
      case 'queryReadyBarcdList':
        mysql.queryReadyBarcdList().then(res => {
          event.sender.send('queryReadyBarcdList-reply', res)
        }).catch(err => {
          log.error(err)
        })
      break;
      case 'updateBarcdValidStatus':
        //传入参数不能以,[]分割,会被转义成array,只能拿到第一个入参参数
        mysql.updateBarcdValidStatus(JSON.parse(arg[1])).then(res => {
          // event.sender.send('updateBarcdValidStatus-reply', res)
        }).catch(err => {
          event.sender.send('updateBarcdValidStatus-reply','数据库异常')
          log.error('数据库异常'+err)
        })
      break;
    }
})

//日志数据
ipcMain.on('logFile-msg', function(event,...arg){
  log.info('logFile-msg:'+arg)
  switch(arg[0]){
    case 'getLogFileList':
      logReader.getLogFileList(app.getPath('userData')+'/electron_log/app/').then(res => {
        event.sender.send('getLogFileList-reply', res)
      }).catch(err => {
        event.sender.send('getLogFileList-reply', err)
      })
    break;
    case 'readFile':
      logReader.readFile(app.getPath('userData')+'/electron_log/app/'+arg[1]).then(res => {
        event.sender.send('readFile-reply', res)
      }).catch(err => {
        event.sender.send('readFile-reply', err)
      })
    break;
  }
})

// 系统告警数据
ipcMain.on('sysInfo-msg', function(event, ...arg){

})

// 渲染进程获取ip 端口状态
ipcMain.on('checkIPPort-msg',function(event,arg){
  checkTCPCOnnect().then(res => {
    event.sender.send('getIPPort-reply',{tcp: res} )
  })
  checkPLCCOnnect().then(res => {
    event.sender.send('getIPPort-reply',{plc: res} )
  })
})

log.info("userData: "+app.getPath('userData'))

// 获取系统数据检测地址是否能ping通
const checkTCPCOnnect = function(){
  return new Promise((resolve) => {
    mysql.querySysConfig().then(res => {
      let sysConfig = JSON.parse(res)[0]
      tcpp.probe(sysConfig.PrintIP, sysConfig.PrintPort, function(err, available) {
          resolve(available)
      });
    })
  })
}
const checkPLCCOnnect = function(){
  return new Promise((resolve) => {
    tcpp.ping({ address: '192.168.2.1',timeout:2000 ,attempts:1}, function(err, data) {
      resolve(data.results[0].err.toString().indexOf('timeout') == -1)
    })
  })
}


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
