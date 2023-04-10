import net from 'net'
import store from '@/store'
import { computed, watch } from 'vue'

var client = new net.Socket()

var result = {
    success: null,
    value: ""
}
// 连接打印机服务 2s超时返回异常
const connectPrintServer = function (ip, port) {
    result = {
        success: null,
        value: ""
    }
    return new Promise((reslove, reject) => {
        client.connect(port, ip, function () {
            result.success = true
            result.value = 'connect ' + ip + ':' + port + ' success'
            reslove(result)
        })
        setTimeout(() => {
            result = {
                success: false,
                value: 'connect tcp fail'
            }
            reject(result)
        }, 2000);
    })
}

var sendToPrint = async function (Aufnr, PkgNumber) {
    result = {
        success: null,
        value: ""
    }
    let param = {
        "Type": "OnlinePackagePrint",
        "Data": {
            "Aufnr": Aufnr, //订单号
            "PkgNumber": PkgNumber, //集成码
        }
    }
    return new Promise((reslove) => {
        let arr = [Buffer.from([2]), Buffer.from(JSON.stringify(param)), Buffer.from([3])]
        let paramArray = Buffer.concat(arr)
        client.write(paramArray)
        setTimeout(() => {
            reslove(result)
        }, 1500);
    })
}

/* 监听服务器传来的data数据 */
client.on("data", function (data) {
    result = {
        success: true,
        value: data
    }
})

/* 监听end事件 */
client.on("end", function () {
    store.commit('updatetcpStatus', false)
})

/* 监听异常 */
client.on("error", function (error) {
    result = {
        success: false,
        value: error
    }
})

const tcpStatus = computed(() => {
    return store.state.tcpStatus
})

//tcp链接断开会主动销毁client，防止下次创建连接失败
watch(tcpStatus, (value, old) => {
    console.log('tcp  变化----', value, old)
    if (value === false) {
        client.destroy()
    }
}, { immediate: true })

export default {
    connectPrintServer,
    sendToPrint
}