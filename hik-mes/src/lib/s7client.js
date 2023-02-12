import log from '@/utils/log.js'
var snap7 = require('node-snap7');
var s7client = new snap7.S7Client();

var plcConnetStatus = false //plc连接状态

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
            reslove(res)
        })
    })
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
    ConnectTo,
    MBRead
}

