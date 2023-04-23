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
    initializeDB()
}

const disconnect = function () { }


//索引创建语句必须跟在table后， 不可以换行
const initializeDB = function () {
    log.info('initializeDB')
    pool.execute(
        'show tables like "sys_config"',
        function (err, results, fields) {
            if (err) {
                log.error(err)
                reject(err)
            }
            log.info(JSON.stringify(results))
            if (results.length == 1) {
                log.info('db already')
            } else {
                log.info('create table')
                pool.query(
                    'create table if not exists barcd_list'
                    + ' ('
                    + ' Id int auto_increment,'
                    + '     Barcd varchar(30) null,'
                    + '     Deleted int default 0 null,'
                    + '     ValidStatus int default 0 null comment "0:未验证 1:已验证",'
                    + '     PkgNumber varchar(30) null comment "集成码",'
                    + '     PkgStatus int default 0 null comment "0:未集成 1:已集成",'
                    + '     CreateTime timestamp default CURRENT_TIMESTAMP null,'
                    + '     Aufnr varchar(30) null comment "订单号",'
                    + '     constraint barch_list_Id_uindex'
                    + '         unique (Id)'
                    + ' )'
                    + ' comment "序列号表";create index index_barcd_time on barcd_list (CreateTime);create index index_grep_deleted_valid on barcd_list (`Deleted`, `ValidStatus`);alter table barcd_list add primary key (Id);'
                    + 'create table if not exists pkg_number_list'
                    + ' ('
                    + '     Id int auto_increment,'
                    + '     PkgNumber varchar(20) null,'
                    + '     Deleted int default 0 not null,'
                    + '     PrintStatus int default 0 null comment "0:未打印 1:已打印",'
                    + '     CreateTime timestamp default CURRENT_TIMESTAMP null,'
                    + '     Aufnr varchar(30) null comment "订单号",'
                    + '     constraint pkg_number_list_Id_uindex'
                    + '         unique (Id)'
                    + ' )'
                    + ' comment "集成码表";alter table pkg_number_list add primary key (Id);'
                    + 'create table if not exists sys_config'
                    + ' ('
                    + '     WorkStation varchar(20) null,'
                    + '     MachineId varchar(20) null,'
                    + '     PrintIP varchar(20) null,'
                    + '     PrintPort int null,'
                    + '     PLCIP varchar(20) null'
                    + ' );'
                    + 'create table if not exists user'
                    + ' ('
                    + '     id int auto_increment'
                    + '         primary key,'
                    + '     username varchar(20) null,'
                    + '     password varchar(60) null,'
                    + '     role int null,'
                    + '     name varchar(10) null,'
                    + '     constraint user_username_uindex'
                    + '         unique (username)'
                    + ' );INSERT INTO user (id, username, password, role, name) VALUES (1, "root", "root", 0, "管理员");'
                    + 'INSERT INTO user (id, username, password, role, name) VALUES (2, "operate", "root1", 1, "操作员");'
                    + 'INSERT INTO sys_config (WorkStation, MachineId, PrintIP, PrintPort, PLCIP) VALUES ("T30085", "hzdz-123456", "127.0.0.1", 8003, "192.168.2.1");'
                    + 'create table alarm'
                    + ' ('
                    + '     id int auto_increment,'
                    + '     Content text null,'
                    + '     CreateTime timestamp default now() null,'
                    + '     Updated int default 0 null comment "上报状态：0: 未上报1: 已上报",'
                    + '     constraint alarm_pk'
                    + '         primary key (id)'
                    + ' )'
                    + ' comment "异常告警";create index index_alarm_time on alarm(CreateTime);'
                    + ' create table send_box '
                    + ' ( '
                    + '     Id int auto_increment '
                    + '         primary key, '
                    + '     Num int null, '
                    + '     Aufnr varchar(30) null, '
                    + '     CreateTime timestamp default CURRENT_TIMESTAMP null, '
                    + '     constraint send_box_Aufnr_uindex '
                    + '         unique (Aufnr) '
                    + ' ) '
                    + ' comment "投盒机数量映射"; ',
                    function (err, results, fields) {
                        if (err) {
                            log.error(err)
                        }
                    }
                )
            }
        }
    )
}

const insertBarcd = function (param) {
    // log.info('insert Barcd: ' + param)
    return new Promise((resolve, reject) => {
        pool.execute(
            'insert into `barcd_list`(`Barcd`,`ValidStatus`, `Aufnr`) values(?,1,?)',
            // 'insert into `barcd_list`(`Barcd`,`ValidStatus`) set ?',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(JSON.stringify(results))
            }
        )
    })
}

const insertAlarm = function (param) {
    // log.info('insert Alarm: ' + param)
    return new Promise((resolve, reject) => {
        pool.execute(
            'insert into `alarm`(`Content`) values(?)',
            // 'insert into `barcd_list`(`Barcd`,`ValidStatus`) set ?',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(JSON.stringify(results))
            }
        )
    })
}
const insertPkgNumber = function (param) {
    return new Promise((resolve, reject) => {
        pool.execute(
            'insert into `pkg_number_list`(`PkgNumber`,`Aufnr`) values(?,?)',
            param,
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(JSON.stringify(results))
            }
        )
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
            // 'SELECT * FROM `barcd_list` where `Deleted` = 0 and `PkgStatus` = 0 and `ValidStatus` = 1 order by `CreateTime` limit 100',
            'SELECT * FROM `barcd_list` where `Deleted` = 0 and `PkgStatus` = 0 and `ValidStatus` = 1 order by `CreateTime`',
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

const querySendBox = function (param) {
    log.info('select * from `send_box` order by `CreateTime` desc limit ? offset ?' + param)
    return new Promise((resolve, reject) => {
        pool.query(
            'select * from `send_box` order by `CreateTime` desc limit ? offset ?',
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

const querySendBoxByAufnr = function (param) {
    return new Promise((resolve, reject) => {
        pool.query(
            'select * from `send_box` where Aufnr = ?',
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

const queryAllUser = function () {
    return new Promise((resolve, reject) => {
        pool.query(
            'select * from `user`',
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

const queryByUser = function (param) {
    return new Promise((resolve, reject) => {
        pool.query(
            'select * from `user` where `username` = ? and `password` = ?',
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

const countSendBox = function (param) {
    return new Promise((resolve, reject) => {
        pool.query(
            'select count(1) as `total` from `send_box` ',
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
const insertAndUpdateSendBox = function (param) {
    return new Promise((resolve, reject) => {
        pool.query(
            'insert into send_box(Aufnr, Num) values (?,?) ON DUPLICATE KEY UPDATE Aufnr = values(Aufnr), Num = values(Num)',
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

const queryPkgNumberLimit = function () {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM `pkg_number_list` where `Deleted` = 0 order by `CreateTime` desc limit 10',
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
    log.info('updateBarcdPkgStatus param:' + param)
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `barcd_list` set `PkgStatus` = 1 , `PkgNumber` = ? where `Barcd` in (' + questionSign + ') and `Deleted` = 0',
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

const updatePkgNumberPrintStatus = function (param) {
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `pkg_number_list` set `PrintStatus` = 1 where `PkgNumber` = ? and `Aufnr` = ?  and `Deleted` = 0',
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

const updateUser = function (param) {
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

// const updateBarcdValidStatus = function (param) {
//     let questionSign = '?'
//     for (let i = 1; i < param.length; i++) {
//         questionSign += ',?'
//     }
//     return new Promise((resolve, reject) => {
//         pool.execute(
//             'update `barcd_list` set `ValidStatus` = 1 where `Barcd` in (' + questionSign + ')',
//             param,
//             function (err, results, fields) {
//                 if (err) {
//                     reject(err)
//                 }
//                 resolve(results)
//             }
//         )
//     })
// }

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
        pool.execute('update `sys_config` set `PrintPort` = ?,`PrintIP` = ?, `WorkStation` = ?, `MachineId` = ?, `PLCIP` = ? where 1=1',
            [param.port, param.ip, param.WorkStation, param.MachineId, param.PLCIP],
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
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `barcd_list` set `Deleted` = 1',
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}

const deleteAllPkgNumber = function () {
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `pkg_number_list` set `Deleted` = 1',
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
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
    if (param[4] != null && param[5] != null) {
        part += ' order by `CreateTime` desc limit ? offset ? '
    }
    let params = []
    param.forEach(element => {
        if (element != null) {
            params.push(element.toString())
        }
    });
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

const countBarcdList = function (param) {
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
        if (element != null) {
            params.push(element.toString())
        }
    });
    return new Promise((resolve, reject) => {
        pool.execute(
            'select count(1) as `total` from `barcd_list` where `Deleted` = 0 ' + part,
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

const queryTest = function () {
    return new Promise((resolve, reject) => {
        pool.execute(
            'select * from test where Id = 1',
            function (err, results, fields) {
                if (err) {
                    reject(err)
                }
                resolve(results)
            }
        )
    })
}


const updateTest = function (param) {
    return new Promise((resolve, reject) => {
        pool.execute(
            'update `test` set `status` = ?',
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



export default {
    connect,
    insertBarcd,
    insertAlarm,
    insertPkgNumber,
    querySysConfig,
    queryBarcdList,
    queryPkgNumberList,
    queryPkgNumberLimit,
    queryReadyBarcdList,
    querySendBox,
    querySendBoxByAufnr,
    queryAllUser,
    queryByUser,
    countSendBox,
    insertAndUpdateSendBox,
    updateSysConfig,
    updatePkgNumberList,
    // updateBarcdValidStatus,
    updateBarcdDeleteStatus,
    updatePkgNumberDeleteStatus,
    updateBarcdPkgStatus,
    updatePkgNumberPrintStatus,
    updateUser,
    deleteAllBarcd,
    deleteAllPkgNumber,
    searchBarcdList,
    countBarcdList,
    queryTest,
    updateTest
}