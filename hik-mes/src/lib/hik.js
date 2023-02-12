import require from "@/lib/require";
import net from 'net'

const SCAN_BARCD_SUBMIT = 'SCAN_BARCD_SUBMIT' //获取集成码
const SCAN_BARCD_CHECK = 'SCAN_BARCD_CHECK' //序列号验证
//序列号验证
const validBarcd = function(Barcd){
    require.post({
        Id: "1234568",
        ServerName: "SCAN_BARCD_CHECK",
        WorkStation: "T30085",
        MachineId: "hzdz-123456",
        Data: {
            Barcd,
            Aufnr:"YES"
        }
    }).then(res => {
        
    }).catch(err => {
        
    })
}

// 获取集成码 接口不支持尾箱、非满箱
const getPkgNumber = function(param){
    require.post(param).then(res => {
        
    }).catch(err => {
        
    })
}

// 打印标签
const printLabel = function(){
    
}

var client
// 连接打印机服务
const connectPrintServer = function(){
    client = net.Socket()
    client.connect(9998, '192.168.1.1',function(){
        
    })
}

/* 监听end事件 */ 
client.on("end", function () {
    console.log("data end");
})