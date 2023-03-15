import log from '@/utils/log.js'
import constant from '@/lib/constant'
var snap7 = require('node-snap7');
var s7client = new snap7.S7Client();
var plcConnetStatus = false //plc连接状态

//总read
const read = function (param) {
    log.info('plc_param:' + JSON.stringify(param))
    return new Promise((reslove, reject) => {
        switch (param.area) {
            case constant.areas.M:
                switch (param.wordLen) {
                    case constant.wordLens.bit:
                        ReadArea(s7client.S7AreaMK, 1, param.start, param.amount, s7client.S7WLBit).then(res => {
                            reslove(res)
                        }).catch(err => {
                            reject(err)
                        })
                        break;
                    case constant.wordLens.byte:
                        MBRead(param.start, param.amount).then(res => {
                            reslove(res)
                        }).catch(err => {
                            reject(err)
                        })
                        break;
                }
                break;
            case constant.areas.DB:
                DBRead(param.dbNumber, param.start, param.size).then(res => {
                    reslove(res)
                }).catch(err => {
                    reject(err)
                })
                break;
        }
    })
}

//总write
const write = function (param, buffer) {
    return new Promise((reslove, reject) => {
        switch (param.area) {
            case constant.areas.M:
                switch (param.wordLen) {
                    case constant.wordLens.bit:
                        WriteArea(s7client.S7AreaMK, 1, param.start, param.amount, s7client.S7WLBit, buffer).then(res => {
                            reslove(res)
                        }).catch(err => {
                            reject(err)
                        })
                        break;
                    case constant.wordLens.byte:
                        MBWrite(param.start, param.amount, buffer).then(res => {
                            reslove(res)
                        }).catch(err => {
                            reject(err)
                        })
                        break;
                }
                break;
        }
    })
}

const ConnectTo = function (ip) {
    return new Promise((reslove, reject) => {
        s7client.ConnectTo(ip, 0, 1, function (err) {
            if (err) {
                log.error(' >> PLC connection failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                plcConnetStatus = false
                reject(false)
            }
            else {
                log.info(' >> PLC connect successfully')
                plcConnetStatus = true
                reslove(true)
            }
        })
    })
}

const MBRead = function (start, size) {
    return new Promise((reslove, reject) => {
        s7client.MBRead(start, size, function (err, res) {
            if (err)
                reject(' >> MBRead failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            reslove(res)
        })
    })
}

const MBWrite = function (start, size, buffer) {
    return new Promise((reslove, reject) => {
        // s7client.MBWrite(1, 1, Buffer.from([5]) ,function(err,res){
        s7client.MBWrite(start, size, buffer, function (err, res) {
            if (err)
                reject(' >> MBWrite failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            reslove(res)
        })
    })
}

const WriteArea = function (area, dbNumber, start, amount, wordLen, buffer) {
    return new Promise((reslove, reject) => {
        // s7client.WriteArea(s7client.S7AreaMK, 1, 4800, 1, s7client.S7WLBit, Buffer.from([1]), function (err, res) {
        s7client.WriteArea(area, dbNumber, start, amount, wordLen, buffer, function (err, res) {
            if (err) {
                log.error(' >> WriteArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                reject(' >> WriteArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            }
            reslove(res)
        })
    })
}

const ReadArea = function (area, dbNumber, start, amount, wordLen) {
    return new Promise((reslove, reject) => {
        // s7client.ReadArea(s7client.S7AreaMK, 1, 100, 1, s7client.S7WLBit, function (err, res) {
        s7client.ReadArea(area, dbNumber, start, amount, wordLen, function (err, res) {
            if (err) {
                log.error(' >> ReadArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                reject(' >> ReadArea failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            }
            log.info(res)
            reslove(res)
        })
    })
}

const DBRead = function (dbNumber, start, size) {
    return new Promise((reslove, reject) => {
        s7client.DBRead(dbNumber, start, size, function (err, res) {
            if (err) {
                log.error(' >> DBRead failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                reject(' >> DBRead failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            }
            reslove(res)
        })
    })
}

export default {
    plcConnetStatus,
    ConnectTo,
    read,
    write,
}

