const mysql = {
    searchBarcdList: 'searchBarcdList',
    searchBarcdList_reply: 'searchBarcdList-reply',
    queryAllUser: 'queryAllUser',
    queryAllUser_reply: 'queryAllUser-reply',
    updateUser: 'updateUser',
    updateUser_reply: 'updateUser-reply',
    queryByUser: 'queryByUser',
    queryByUser_reply: 'queryByUser-reply',
    insertBarcd: 'insertBarcd',
    insertBarcd_reply: 'insertBarcd_reply'
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
/**
 * !DB块字符串需要去除前后符号
 */
const plcCommand = {
    barcdSign: { area: areas.M, wordLen: wordLens.bit, start: 4800, amount: 1, desc: '序列号标识位', name: 'barcdSign' },
    barcdSignError: { area: areas.M, wordLen: wordLens.bit, start: 4801, amount: 1, desc: '序列号错误标识位', name: 'barcdSignError' },
    barcd: { area: areas.DB, dbNumber: 16, start: 0, size: 20, desc: '序列号', name: 'barcd' },//size => byte
    weightSign: { area: areas.M, wordLen: wordLens.bit, start: 4808, amount: 1, desc: '称重标识位', name: 'weightSign' },
    weight: { area: areas.M, wordLen: wordLens.byte, start: 700, amount: 4, desc: '称重数据', name: 'weight' },
    pkgNumberError: { area: areas.M, wordLen: wordLens.bit, start: 4809, amount: 1, desc: 'mes集成码错误', name: 'pkgNumberError' },
}
// const plcCommand = {
//     barcdSign: { area: areas.M, wordLen: wordLens.bit, start: 48, amount: 1, desc: '序列号标识位', reply: 'barcdSign_reply',name: 'barcdSign' },
//     barcdSignError: { area: areas.M, wordLen: wordLens.bit, start: 49, amount: 1, desc: '序列号错误标识位', reply: 'barcdSignError_reply',name: 'barcdSignError' },
//     barcd: { area: areas.DB, dbNumber: 1, start: 0, size: 5, desc: '序列号', reply: 'barcd_reply' },//size => b,},//size => byte
//     weightSign: { area: areas.M, wordLen: wordLens.bit, start: 488, amount: 1, desc: '称重标识位', reply: 'weightSign_reply',name: 'weightSign' },
//     weight: { area: areas.M, wordLen: wordLens.byte, start: 20, amount: 4, desc: '称重数据', reply: 'weight_reply',name: 'weight' },
//     pkgNumberError: { area: areas.M, wordLen: wordLens.bit, start: 489, amount: 1, desc: 'mes集成码错误', reply: '',name: 'pkgNumberError' },
// }

export default {
    mysql,
    plcCommand,
    wordLens,
    areas
}