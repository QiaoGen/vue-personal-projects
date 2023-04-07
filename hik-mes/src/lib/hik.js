import net from 'net'
import store from '@/store'
import { computed, watch } from 'vue'

var client = new net.Socket()
// 连接打印机服务
const connectPrintServer = function (ip, port) {
    client.connect(port, ip, function () {
        console.log('connect ' + ip + ':' + port + ' success')
    })
}

var sendToPrint = function (Aufnr, PkgNumber) {
    let param = {
        "Type": "OnlinePackagePrint",
        "Data": {
            "Aufnr": Aufnr, //订单号
            "PkgNumber": PkgNumber, //集成码
        }
    }
    console.log(param)
    let arr = [Buffer.from([2]), Buffer.from(JSON.stringify(param)), Buffer.from([3])]
    let paramArray = Buffer.concat(arr)
    client.write(paramArray)
}

/* 监听服务器传来的data数据 */
client.on("data", function (data) {
    loggerIPC("the data of server is " + data.toString());
})

/* 监听end事件 */
client.on("end", function () {
    store.commit('updatetcpStatus', false)
    loggerIPC("disconect from Server");
})

const tcpStatus = computed(() => {
    return store.state.tcpStatus
})

watch(tcpStatus, (value, old) => {
    console.log('tcp  变化----', value, old)
    if (value === false) {
        client.destroy()
    }
}, { immediate: true })


function loggerIPC(str) {
    // ipcRenderer.send('log-msg-info', str)
    console.log('log-msg-info', str)
}

export default {
    connectPrintServer,
    sendToPrint
}