var soap = require('soap')
import store from '@/store'

var url = '';
if (process.env.NODE_ENV == 'development') {
    url = 'http://10.1.48.182:8091/ws/manMachine?wsdl';
} else if (process.env.NODE_ENV == 'production') {
    url = 'http://mes-expose.hikvision.com:12304/ws/manMachine?wsdl';
}
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
                reject(err)
                console.error(err)
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

function sendPkgNumber(data) {
    return new Promise((reslove, reject) => {
        soap.createClient(url, (err, client) => {
            if (err) {
                reject(err)
                console.error(err)
            } else {
                args.Datas = data
                args.Id = uuid()
                client.execute({ data: JSON.stringify(args) }, function (err1, result) {
                    if (err1) {
                        reject(err1)
                    } else {
                        let resultData = JSON.parse(result.return)
                        if (resultData.ErrCode == '0' || (res.ErrCode == '700022' && resultData.Data.PkgNumber.includes('@'))) {
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

