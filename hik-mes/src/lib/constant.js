const mysql = {
    searchBarcdList: 'searchBarcdList',
    searchBarcdList_reply: 'searchBarcdList-reply',
    queryAllUser: 'queryAllUser',
    queryAllUser_reply: 'queryAllUser-reply',
    updateUser: 'updateUser',
    updateUser_reply: 'updateUser-reply',
    queryByUser: 'queryByUser',
    queryByUser_reply: 'queryByUser-reply',
    querySysConfig: 'querySysConfig',
    insertBarcd: 'insertBarcd',
    insertAlarm: 'insertAlarm',
    deleteAllPkgNumber: 'deleteAllPkgNumber',
    updatePkgNumberPrintStatus: 'updatePkgNumberPrintStatus',
    queryPkgNumberLimit: 'queryPkgNumberLimit',
}

const sysOperate = {
    connectPLC: 'connectPLC',
    checkPLCAddress: 'checkPLCAddress',
    checkTCPAddress: 'checkTCPAddress',
    connectPrintServer: 'connectPrintServer',
    sendToPrint: 'sendToPrint'
}

//plc数据类型
const wordLens = {
    bit: 'bit',
    byte: 'byte'
}
//plc数据模块
const areas = {
    M: 'M',
    DB: 'DB'
}

//设备异常告警
const alarms = [
    {
        machine: '泡罩机', amount: 6, color: 'rgb(24,160,88)', content: [
            "泡罩机紧急停止按下",
            "泡罩机安全门打开",
            "泡罩机取泡罩伺服正极限报警",
            "泡罩机取泡罩伺服反极限报警",
            "泡罩机取泡罩伺服报警",
            "泡罩机入口产品满料报警",
            "泡罩机入口阻挡1气缸传感器不在位报警",
            "泡罩机入口阻挡2气缸传感器不在位报警",
            "泡罩机入口阻挡3气缸传感器不在位报警",
            "泡罩机入口阻挡4气缸传感器不在位报警",
            "泡罩机出口阻挡1气缸传感器不在位报警",
            "泡罩机出口阻挡2气缸传感器不在位报警",
            "泡罩机压泡罩气缸传感器不在位报警",
            "泡罩机压泡罩旋转气缸传感器不在位报警",
            "泡罩机剔除气缸传感器不在位报警",
            "泡罩机出口阻挡3气缸传感器不在位报警",
            "泡罩机出口阻挡4气缸传感器不在位报警",
            "泡罩机扫码位阻挡气缸传感器不在位报警",
            "泡罩机扫码位下降气缸传感器不在位报警",
            "泡罩机扫码位旋转气缸传感器不在位报警",
            "泡罩机扫码位夹爪气缸传感器不在位报警",
            "泡罩机上料位推料缸传感器不在位报警",
            "泡罩机上料位阻挡1缸传感器不在位报警",
            "泡罩机上料位阻挡2缸传感器不在位报警",
            "泡罩机移栽推料气缸传感器不在位报警",
            "泡罩机移栽位阻挡1气缸传感器不在位报警",
            "泡罩机移栽位阻挡2气缸传感器不在位报警",
            "泡罩机分离夹持气缸传感器不在位报警",
            "泡罩机分离托底气缸传感器不在位报警",
            "泡罩机分离上升气缸传感器不在位报警",
            "泡罩机分离夹取气缸传感器不在位报警",
            "泡罩机分离推料气缸传感器不在位报警",
            "泡罩机抓手取料气缸传感器不在位报警",
            "泡罩机扫码失败报警",
            "泡罩机压泡罩吸盘负压报警显示",
            "泡罩机抓手吸盘负压报警显示",
            "泡罩机扫码位产品数据已发送至上位机手动放行后复位启动",
            "泡罩机与装箱机通讯异常",
            "泡罩扫码结果重复或上位机反馈异常",
            "称重后MES反馈错误",
            "泡罩机剔除满料报警",
            "上位机通讯异常报警检查软件是否运行"
        ]
    },
    {
        machine: '装箱机', amount: 6, color: 'rgb(32,128,240)', content: [
            "装箱机紧急停止按下",
            "装箱机安全门打开",
            "装箱机撑箱上极限报警",
            "装箱机撑箱下极限报警",
            "装箱机平拉正极限报警",
            "装箱机平拉反极限报警",
            "装箱机升降上极报警",
            "装箱机升降下极限报警",
            "装箱机马达过载",
            "装箱机撑箱伺服错误报警",
            "装箱机平拉伺服错误报警",
            "装箱机升降伺服错误报警",
            "装箱机纸箱顶升气缸上限未检测到",
            "装箱机纸箱顶升气缸下限未检测到",
            "装箱机装箱位靠边气缸后限检测异常",
            "装箱机装箱阻挡位气缸上限检测异常",
            "装箱机隔板无料报警",
            "装箱机产品推料气缸前后限检测异常",
            "装箱机产品阻挡气缸上下限检测异常",
            "装箱机抓手升降气缸上限检测异常",
            "装箱机抓手升降气缸下限检测异常",
            "装箱机抓手夹爪1上限检测异常",
            "装箱机抓手夹爪2上限检测异常",
            "装箱机抓手夹爪1未夹到产品或漏夹",
            "装箱机抓手夹爪2未夹到产品或漏夹",
            "装箱机产品推料未到位报警",
            "装箱机隔板取料后负压异常复位后从新抓取",
            "装箱机隔板升降气缸下限检测异常",
            "装箱机隔板升降气缸上限检测异常",
            "装箱机与称重机通讯异常",
            "装箱机与开箱机通讯异常",
            "",
            "装箱机隔板缺料提示"
        ]
    }, {
        machine: '投盒机', amount: 4, color: 'rgb(240,160,32)', content: [
            "投盒机紧急停止按下",
            "投盒机安全门打开",
            "投盒机伺服反极限",
            "投盒机伺服正极限",
            "投盒机取料吸盘负压报警",
            "投盒机取料气缸上下检测开关异常",
            "投盒机换料气缸前后检测开关异常",
            "投盒机阻挡气缸上检测异常",
            "投盒机靠边气缸前检测异常",
            "投盒机料仓无料",
            "投盒机与贴标机通讯异常",
            "投盒机与封箱机通讯异常",
            "投盒机与称重机通讯异常",
            "投盒机与装箱机通讯异常",
            "投盒机伺服错误",
        ]
    }, {
        machine: '贴标机', amount: 4, color: 'rgb(208,48,80)', content: [
            "贴标机紧急停止按下",
            "贴标机安全门开",
            "贴标机升降伺服正极限报警",
            "贴标机升降伺服负极限报警",
            "贴标机伸缩伺服正极限报警",
            "贴标机伸缩伺服负极限报警",
            "贴标机平移伺服正极限报警",
            "贴标机平移伺服负极限报警",
            "贴标机升降伺服错误",
            "贴标机平移伺服错误",
            "贴标机伸缩伺服错误",
            "贴标机接标气缸前后限检测异常",
            "贴标机抓手旋转气缸前后限检测异常",
            "贴标机接标旋转气缸前后限检测异常",
            "贴标机打印结束未检测到标签报警(2)",
            "贴标机取标后负压检测报警",
            "贴标机贴标板未检测到纸箱",
            "贴标机打印机长时间无数据"

        ]
    }, {
        machine: '封箱机', amount: 2, color: 'rgb(138, 43, 226)', content: [
            "封箱机紧急停止按下报警",
            "封箱机马达过载报警",
            "封箱机无胶带报警",
            "封箱机折前盖前后限检测异常",
            "封箱机折侧盖前后限检测异常",
            "封箱机尾部阻挡1上限检测异常",
            "封箱机尾部阻挡2上限检测异常",
            "封箱机胶带缺少或检测开关异常",
            "封箱机安全门打开报警",
        ]
    }, {
        machine: '开箱机', amount: 4, color: 'rgb(67, 176, 176)', content: [
            "开箱机左折侧盖下降检测异常",
            "开箱机右折侧盖上升检测异常",
            "开箱机右折侧盖下降检测异常",
            "开箱机堵料报警",
            "开箱机吸盘报警",
            "开箱机纸箱取箱未到位报警",
            "开箱机安全门打开",
            "开箱机无胶带报警",
            "开箱机无纸箱报警",
            "开箱机取箱气缸前后检测异常",
            "开箱机未成形报警",
            "开箱机折前盖前后限检测异常",
            "开箱机折后盖前后限检测异常",
            "开箱机左折侧盖上升检测异常",
            "开箱机马达过载报警",
            "开箱机紧急停止按下"
        ]
    }
]

var alarmAmount = 0
alarms.forEach(e => {
    alarmAmount += e.amount
})

/**
 * !DB块字符串需要去除前后符号
 */
const isDevelopment = process.env.NODE_ENV !== 'production'
// const plcCommand = !isDevelopment ? {
//     barcdSign: { area: areas.M, wordLen: wordLens.bit, start: 4800, amount: 1, desc: '序列号标识位', name: 'barcdSign' },
//     barcdSignError: { area: areas.M, wordLen: wordLens.bit, start: 4801, amount: 1, desc: '序列号错误标识位', name: 'barcdSignError' },
//     heartbeat: { area: areas.M, wordLen: wordLens.bit, start: 4803, amount: 1, desc: '心跳', name: 'heartbeat' },
//     barcd: { area: areas.DB, dbNumber: 16, start: 0, size: 20, desc: '序列号', name: 'barcd' },//size => byte
//     weightSign: { area: areas.M, wordLen: wordLens.bit, start: 4808, amount: 1, desc: '称重标识位', name: 'weightSign' },
//     weight: { area: areas.M, wordLen: wordLens.byte, start: 700, amount: 4, desc: '称重数据', name: 'weight' },
//     pkgNumberError: { area: areas.M, wordLen: wordLens.bit, start: 4809, amount: 1, desc: 'mes集成码错误', name: 'pkgNumberError' },
//     alarm: { area: areas.M, wordLen: wordLens.byte, start: 1500, amount: alarmAmount, desc: '告警信息', name: 'alarm' },
// } : {
//     barcdSign: { area: areas.M, wordLen: wordLens.bit, start: 48, amount: 1, desc: '序列号标识位', reply: 'barcdSign_reply', name: 'barcdSign' },
//     barcdSignError: { area: areas.M, wordLen: wordLens.bit, start: 49, amount: 1, desc: '序列号错误标识位', reply: 'barcdSignError_reply', name: 'barcdSignError' },
//     heartbeat: { area: areas.M, wordLen: wordLens.bit, start: 20, amount: 1, desc: '心跳', name: 'heartbeat' },
//     barcd: { area: areas.DB, dbNumber: 1, start: 0, size: 5, desc: '序列号', reply: 'barcd_reply' },//size => b,},//size => byte
//     weightSign: { area: areas.M, wordLen: wordLens.bit, start: 34, amount: 1, desc: '称重标识位', reply: 'weightSign_reply', name: 'weightSign' },
//     weight: { area: areas.M, wordLen: wordLens.byte, start: 20, amount: 4, desc: '称重数据', reply: 'weight_reply', name: 'weight' },
//     pkgNumberError: { area: areas.M, wordLen: wordLens.bit, start: 489, amount: 1, desc: 'mes集成码错误', reply: '', name: 'pkgNumberError' },
//     alarm: { area: areas.M, wordLen: wordLens.byte, start: 1, amount: alarmAmount, desc: '告警信息', name: 'alarm' },
//     }

const plcCommand = {
    barcdSign: { area: areas.M, wordLen: wordLens.bit, start: 4800, amount: 1, desc: '序列号标识位', name: 'barcdSign' },
    barcdSignError: { area: areas.M, wordLen: wordLens.bit, start: 4801, amount: 1, desc: '序列号错误标识位', name: 'barcdSignError' },
    heartbeat: { area: areas.M, wordLen: wordLens.bit, start: 4803, amount: 1, desc: '心跳', name: 'heartbeat' },
    barcd: { area: areas.DB, dbNumber: 16, start: 0, size: 20, desc: '序列号', name: 'barcd' },//size => byte
    weightSign: { area: areas.M, wordLen: wordLens.bit, start: 4808, amount: 1, desc: '称重标识位', name: 'weightSign' },
    weight: { area: areas.M, wordLen: wordLens.byte, start: 700, amount: 4, desc: '称重数据', name: 'weight' },
    pkgNumberError: { area: areas.M, wordLen: wordLens.bit, start: 4809, amount: 1, desc: 'mes集成码错误', name: 'pkgNumberError' },
    alarm: { area: areas.M, wordLen: wordLens.byte, start: 1500, amount: alarmAmount, desc: '告警信息', name: 'alarm' },
}

export default {
    mysql,
    plcCommand,
    wordLens,
    areas,
    alarms,
    sysOperate
}