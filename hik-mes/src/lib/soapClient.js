var soap = require('soap')
import store from '@/store'

var url = 'http://mes-expose.hikvision.com:12304/ws/manMachine?wsdl';
// if (process.env.NODE_ENV == 'development') {
//     url = 'http://10.1.48.182:8091/ws/manMachine?wsdl';
// } else if (process.env.NODE_ENV == 'production') {
//     url = 'http://mes-expose.hikvision.com:12304/ws/manMachine?wsdl';
// }
var args = {
    "Id": "",
    "ServerName": "SCAN_BARCD_SUBMIT",
    "WorkStation": store.state.sysConfig.WorkStation,
    "MachineId": store.state.sysConfig.MachineId,
    "Datas": null,
    "Print":
    {
        "PrintSeverName": "CQ_NVR1",
        "PrintName": ""
    }
}

var validArgs = {
    "Id": "",
    "ServerName": "SCAN_BARCD_CHECK",
    "WorkStation": store.state.sysConfig.WorkStation,
    "MachineId": store.state.sysConfig.MachineId,
    "Data": null
}

// 2688285a-50fb-46e4-8213-6da5cfa1fa66 基于时间/mac地址hash
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
}


function valid(barcd) {
    return new Promise((reslove, reject) => {
        soap.createClient(url, (err, client) => {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                let param = {
                    "Barcd": barcd,
                    "Aufnr": "YES"
                }
                validArgs.Data = param
                validArgs.Id = uuid()
                client.execute({ data: JSON.stringify(validArgs) }, function (err1, result) {
                    if (err1) {
                        reject(err1)
                    } else {
                        let resultData = JSON.parse(result.return)
                        if (resultData.ErrCode == '0') {
                            reslove(resultData)
                        } else {
                            reject(resultData)
                        }
                    }
                })
            }
        })
    })
}

// 获取集成码 接口不支持尾箱、非满箱
// Id 消息编号，可以为 guid
// WorkStation：MES 扫描站点（需可配置）
// MachineId：设备编号（需可配置）
// Barcd：序列号
// PkgInfo. Weigth 包装箱重量，单位 KG
// 注意：
// 1. 所有序列号必须通过接口一验证，才能允许调用接口二。
// 2. PkgInfo. Weigth 只能在最后一个序列号里面，且必须大于 0
// 响应json
// {
//     "Data": {
//          "PkgNumber": "@800000517"
//     },
//     "ErrCode": "0",
//     "ErrMsg": "",
//     "Id": "1234567"
// }
// ErrCode：0 成功，非 0 失败
// PkgNumber：集成码（包装号），一般以@开头
// 注意：
// ErrCode 700022 包装箱号生成成功 但打印服务不存在，打印失败
// 不能将成功的判定条件定为 ErrCode =0，判定成功逻辑为 PkgNumber 有内容且以@开头
function sendPkgNumber(param) {
    return new Promise((reslove, reject) => {
        // let result = { Data: { PkgNumber: '@11222222' } }
        // reslove(result)
        soap.createClient(url, (err, client) => {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                args.Datas = param
                args.Id = uuid()
                client.execute({ data: JSON.stringify(args) }, function (err1, result) {
                    if (err1) {
                        reject(err1)
                    } else {
                        let resultData = JSON.parse(result.return)
                        if (resultData.ErrCode == '0' || (resultData.ErrCode == '700022' && resultData.Data.PkgNumber.includes('@'))) {
                            reslove(resultData)
                        } else {
                            reject(resultData)
                        }
                    }
                })
            }
        })
    })
}

export default {
    sendPkgNumber,
    valid,
    // uploadMsg
}

