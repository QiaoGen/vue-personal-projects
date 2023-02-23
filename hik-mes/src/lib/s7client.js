import log from '@/utils/log.js'
var snap7 = require('node-snap7');
var s7client = new snap7.S7Client();

var plcConnetStatus = false //plc连接状态

const getPlcConnetStatus = function(){
    
}

const ConnectTo = function(ip){
    return new Promise((reslove,reject) => {
        s7client.ConnectTo(ip, 0, 1, function(err) {
            if(err){
                log.error(' >> PLC connection failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                plcConnetStatus = false
                reject(false)
            }
            else{
                log.info(' >> PLC connect successfully')
                plcConnetStatus = true
                reslove(true)
            }
        })
    })
}

const MBRead = function(){
    // WriteArea()
    // MBWrite()
    return new Promise((reslove,reject) => {
        s7client.MBRead(0, 10, function(err,res){
            if(err)
                reject(' >> MBRead failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            // if(res.length > 0){
            //     res.forEach(e => {
            //         // console.log(e.toString(2))
            //         console.log(fullBinary(e.toString(2)))
            //     })
            // }
            ReadArea()
            reslove(res)
        })
    })
}

const MBWrite = function(){
    return new Promise((reslove,reject) => {
        s7client.MBWrite(1, 1, Buffer.from([5]) ,function(err,res){
            if(err)
                reject(' >> MBWrite failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            reslove(res)
        })
    })
}

const WriteArea = function(){
    return new Promise((reslove,reject) => {
        s7client.WriteArea(s7client.S7AreaMK,0,23,1,s7client.S7WLBit,Buffer.from([1]), function(err,res){
            if(err){
                console.error(' >> WriteArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                reject(' >> WriteArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            }
            console.log('WriteArea:', res)
            reslove(res)
        })
    })
}

const ReadArea = function(){
    return new Promise((reslove,reject) => {
        s7client.ReadArea(s7client.S7AreaMK,0,10,1,s7client.S7WLBit, function(err,res){
            if(err){
                console.error(' >> ReadArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                reject(' >> ReadArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            }
            console.log('readyArea:', res)
            reslove(res)
        })
    })
}

// 位寻址
// X（位），B（字节），W（字—2字节），D（双字—4字节）M内部存储区 DB数据块
// 不检测M区域多子节小数点
const transBitLocation = function(l){
    let location = {
        start:0,
        length:1
    }
    l = ''
    if(l.indexOf('MD') != -1){
        let num = parseInt(l.split(2, l.length))
        location.start = num*4-1
        location.length = 1
    }else if(l.indexOf('MW') != -1){
        let num = parseInt(l.split(2, l.length))
        location.start = num*2-1
        location.length = 1
    }else if(l.indexOf('MB') != -1){
        
    }else{
        location.start = num*2-1
        location.length = 1
    }
}

// 补全二进制 参数string
const fullBinary = function(param){
    let fullNum = ''
    for(let i = (8-param.length); i > 0 ; i--){
        fullNum += '0'
    }
    return fullNum+param
}

export default{
    plcConnetStatus,
    getPlcConnetStatus,
    ConnectTo,
    MBRead
}

