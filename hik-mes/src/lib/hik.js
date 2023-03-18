import require from "@/lib/require";
import net from 'net'
import store from '@/store'

const SCAN_BARCD_SUBMIT = 'SCAN_BARCD_SUBMIT' //获取集成码
const SCAN_BARCD_CHECK = 'SCAN_BARCD_CHECK' //序列号验证
//序列号验证
const validBarcd = function(Barcd){
    return new Promise((resolve,reject) => {
        // require.post({
        //     Id: "1234568",
        //     ServerName: "SCAN_BARCD_CHECK",
        //     WorkStation: store.state.sysConfig.WorkStation,
        //     MachineId: store.state.sysConfig.MachineId,
        //     Data: {
        //         Barcd,
        //         Aufnr:"YES"
        //     }
        // }).then(res => {
        //     resolve(res)
        // }).catch(err => {
        //     let error = {
        //         value: Barcd,
        //         msg: err
        //     }
        //     reject(error)
        // })
        resolve('ok')
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
const getPkgNumber = function(param){
    return new Promise((resolve,reject) =>{
        resolve('pkg success')
        // let requestBody = {
        //     Id: "1234567",
        //     ServerName: "SCAN_BARCD_SUBMIT",
        //     WorkStation: store.state.sysConfig.WorkStation,
        //     MachineId: store.state.sysConfig.MachineId,
        //     Datas: param,
        //     Print:{
        //         PrintSeverName:"CQ_NVR1",
        //         PrintName:""
        //     }
        // }
        // require.post(requestBody).then(res => {
        //     if(res.ErrCode === 700022){
        //         resolve(res)
        //     }else if(res.ErrCode != 0){
        //         reject(res)
        //     }
        //     resolve(res)
        // }).catch(err => {
        //     reject(err)
        // })
    })
}

// 打印标签
const printLabel = function(){
    
}

var client
// 连接打印机服务
const connectPrintServer = function(){
    client = net.Socket()
    client.connect(8000, '127.0.0.1',function(){
        
    })
}

/* 监听end事件 */ 
// client.on("end", function () {
//     console.log("data end");
// })

export default{
    validBarcd,
    getPkgNumber
}