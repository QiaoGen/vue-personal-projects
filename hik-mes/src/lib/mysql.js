import mysql from 'mysql2'
import log from '@/utils/log'

var pool
const connect = function () {
    // pool = mysql.createPool({
    //     host: 'localhost',
    //     port: 3306,
    //     user: 'root',
    //     password: 'root',
    //     database: 'hik',
    //     waitForConnections: true,
    //     connectionLimit: 10,
    //     maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    //     idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    //     queueLimit: 0
    // });
    pool = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hik',
        multipleStatements: true,
        dateStrings: true,
        timezone: 'utc'
    })
}

const querySysConfig = function () {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM `sys_config`',
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(JSON.stringify(results))
            }
        )
    })
}

const queryBarcdList = function () {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM `barcd_list` where `Deleted` = 0 and `PkgStatus` = 0 and `ValidStatus` = 0',
            function (err, results, fields) {
                // log.info(results)
                if (err) {
                    reject(err)
                }
                // resolve(JSON.stringify(results))
                resolve(results)
            }
        )
    })
}
//建联合索引
const queryReadyBarcdList = function () {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM `barcd_list` where `Deleted` = 0 and `PkgStatus` = 0 and `ValidStatus` = 1 order by `CreateTime` limit 100',
            function (err, results, fields) {
                // log.info(results)
                if (err) {
                    reject(err)
                }
                // resolve(JSON.stringify(results))
                resolve(results)
            }
        )
    })
}

const queryAllUser = function () {
    return new Promise((reslove, reject) => {
        pool.query(
            'select * from `user`',
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                reslove(results)
            }
        )
    })
}

const queryByUser = function(param){
    return new Promise((reslove, reject) => {
        pool.query(
            'select * from `user` where `username` = ? and `password` = ?',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                reslove(results)
            }
        )
    })
}

const queryPkgNumberList = function () {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM `pkg_number_list` where `Deleted` = 0',
            function (err, results, fields) {
                // log.info(results)
                if (err) {
                    reject(err)
                }
                // resolve(JSON.stringify(results))
                resolve(results)
            }
        )
    })
}

const updateBarcdPkgStatus = function (param) {
    let questionSign = '?'
    for (let i = 1; i < param.length - 1; i++) {
        questionSign += ',?'
    }
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `barcd_list` set `PkgStatus` = 1 , `PkgNumber` = ? where `Barcd` in (' + questionSign + ') ; insert into `pkg_number_list`(`PkgNumber`) values(?)',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

const updateUser = function(param){
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `user` set `name` = ? , `username` = ? , `password` = ? where `id` = ? ',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

const updateBarcdValidStatus = function (param) {
    let questionSign = '?'
    for (let i = 1; i < param.length; i++) {
        questionSign += ',?'
    }
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `barcd_list` set `ValidStatus` = 1 where `Barcd` in (' + questionSign + ')',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

//删除工单
const updateBarcdDeleteStatus = function (param) {
    let questionSign = '?'
    for (let i = 1; i < param.length; i++) {
        questionSign += ',?'
    }
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `barcd_list` set `Deleted` = 1 where `Barcd` in (' + questionSign + ')',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}
//删除集成码
const updatePkgNumberDeleteStatus = function (param) {
    let questionSign = '?'
    for (let i = 1; i < param.length; i++) {
        questionSign += ',?'
    }
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `pkg_number_list` set `Deleted` = 1 where `PkgNumber` in (' + questionSign + ')',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

const updatePkgNumberList = function (param) {
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `pkg_number_list` set `PrintStatus` = ? where `PkgNumber` = ?',
            [param.PrintStatus, param.PkgNumber],
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

const updateSysConfig = function (param1) {
    let param = JSON.parse(param1)
    // console.log('param:', param)
    return new Promise((resolve, reject) => {
        pool.execute('update `sys_config` set `PrintPort` = ?,`PrintIP` = ?, `WorkStation` = ?, `MachineId` = ? where 1=1',
            [param.port, param.ip, param.WorkStation, param.MachineId],
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(JSON.stringify(results))
            }
        )
        // resolve('1')
    })
}

const deleteAllBarcd = function () {
    return new Promise((reslove, reject) => {
        pool.execute(
            'update `barcd_list` set `deleted` = 1',
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                reslove(results)
            }
        )
    })
}

const searchBarcdList = function (param) {
    let part = ''
    if (param[0] != null && param[0] != '') {
        part += ' and `Barcd` = ? '
    }
    if (param[1] != null && param[1] != '') {
        part += ' and `PkgNumber` = ? '
    }
    if (param[2] != null && param[3] != null) {
        part += ' and `CreateTime` > ? and `CreateTime` < ?'
    }
    let params = []
    param.forEach(element => {
        if (element != null && element != '') {
            params.push(element)
        }
    });
    log.info('select * from `barcd_list` where `Deleted` = 0 ' + part)
    return new Promise((resolve, reject) => {
        pool.execute(
            'select * from `barcd_list` where `Deleted` = 0 ' + part,
            params,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

export default {
    connect,
    querySysConfig,
    queryBarcdList,
    queryPkgNumberList,
    queryReadyBarcdList,
    queryAllUser,
    queryByUser,
    updateSysConfig,
    updatePkgNumberList,
    updateBarcdValidStatus,
    updateBarcdDeleteStatus,
    updatePkgNumberDeleteStatus,
    updateBarcdPkgStatus,
    updateUser,
    deleteAllBarcd,
    searchBarcdList

}