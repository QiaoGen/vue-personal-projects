<template>
    <div class="father" :style="{ backgroundImage: `url(${imgUrl})` }">
        <div class="login_window">
            <div class="big_title">海康烟感包装线登陆</div>
            <n-form ref="formRef" :model="model" :rules="rules">
                <n-form-item path="username" label="用户名：">
                    <n-input v-model:value="model.username" placeholder="请输入用户名" :maxlength="16"></n-input>
                </n-form-item>
                <n-form-item path="password" label="密码:">
                    <n-input v-model:value="model.password" placeholder="请输入密码" type="password" :maxlength="16"></n-input>
                </n-form-item>
                <n-form-item>
                    <n-button @click="handleValidateButtonClick" type="success" style="width: 100%;">登录</n-button>
                </n-form-item>

            </n-form>
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from "vue";
import route from "@/router"
import { ipcRenderer } from "electron";
import constant from "@/lib/constant";
import store from '@/store'
import hik from '@/lib/hik'

//重制menu刷新状态
store.commit('updateMenu', false)
//任务初始化
store.commit('updateworkFlag', false)
//重置连接状态
store.commit('updateplcStatus', false)
store.commit('updatemesStatus', false)
store.commit('updatetcpStatus', false)

const imgUrl = require('@/assets/bg.png')

const formRef = ref(null)
const model = ref({
    username: null,
    password: null
})

const rules = reactive({
    username: {
        required: true,
        message: "请输入用户名",
        trigger: ['blur']
    },
    password: {
        required: true,
        message: "请输入密码",
        trigger: ['blur']
    }
})

const handleValidateButtonClick = function (e) {
    // if(process.env.NODE_ENV == 'development'){
    //     route.replace("/MainWindow")
    //     return
    // }
    e.preventDefault();
    formRef.value?.validate((errors) => {
        if (!errors) {
            login()
        } else {
            // route.replace("/MainWindow")
        }
    });
}

const login = function () {
    let param = [model.value.username, model.value.password]
    ipcRenderer.send('mysql-msg', constant.mysql.queryByUser, JSON.stringify(param))
}

ipcRenderer.on(constant.mysql.queryByUser_reply, function (event, arg) {
    if (arg.success && arg.msg.length == 1) {
        store.commit('updateRole', arg.msg[0].role)
        store.commit('updateName', arg.msg[0].name)
        store.commit('updateMenu', true)
        store.commit('updateworkFlag', true)
        route.replace("/MainWindow")
    } else {
        window.$message.error("用户名或密码错误");
        model.value = { username: null, password: null }
    }
})

//获取系统信息
const getSysInfo = function () {
    ipcRenderer.send('mysql-msg', 'querySysConfig')
}
ipcRenderer.once('querySysConfig-reply', function (event, arg) {
    let sysConfig = JSON.parse(arg)[0]
    let sysInfo = {
        WorkStation: sysConfig.WorkStation,
        MachineId: sysConfig.MachineId,
        ip: sysConfig.PrintIP,
        port: sysConfig.PrintPort,
        PLCIP: sysConfig.PLCIP
    }
    console.log('sysConfig:', sysConfig)
    store.commit('updateSysConfig', sysInfo)
    check(sysInfo)
})
getSysInfo()

//检查PLC tcp mes服务状态是否可用
const check = function (sysConfig) {
    console.log('do check')
    if (sysConfig.ip != null && sysConfig.ip != '' && sysConfig.port != null) {
        ipcRenderer.invoke('connect-invoke', constant.sysOperate.checkTCPAddress, sysConfig.ip, sysConfig.port).then(res => {
            //连接打印机
            if (res.success) {
                ipcRenderer.send('log-msg-info', 'connect Print Server')
                hik.connectPrintServer(sysConfig.ip, sysConfig.port)
                // ipcRenderer.invoke('connect-invoke', constant.sysOperate.connectPrintServer, sysConfig.PrintPort, sysConfig.PrintIP).then(res => {
                //     console.log('connect Tcp Server:', res)
                // })
                store.commit('updatetcpStatus', true)
                ipcRenderer.send('log-msg-info', 'updatetcpStatus:' + store.state.tcpStatus)
                // hik.sendToPrint('sss', 'ddd')
            }
        })
    }
    //10.69.156.101连接PLC之前需要检查PLC是否可以ping通，否则s7client持续write会卡死应用程序
    if (sysConfig.PLCIP != null && sysConfig.PLCIP != '') {
        ipcRenderer.invoke('connect-invoke', constant.sysOperate.checkPLCAddress, sysConfig.PLCIP).then(res => {
            if (res.success) {
                ipcRenderer.invoke('connect-invoke', constant.sysOperate.connectPLC, sysConfig.PLCIP).then(res => {
                    if (res.success) {
                        store.commit('updateplcStatus', true)
                        ipcRenderer.send('log-msg-info', 'updateplcStatus:' + store.state.plcStatus)
                    }
                })
            }
        })
    }
    //检测mes地址
    const mesIP = 'mes-expose.hikvision.com'
    const mesPort = 12304
    ipcRenderer.invoke('connect-invoke', constant.sysOperate.checkTCPAddress, mesIP, mesPort).then(res => {
        if (res.success) {
            ipcRenderer.send('log-msg-info', 'test mes address ')
            store.commit('updatemesStatus', true)
        }
    })
}

onBeforeUnmount(() => {
    ipcRenderer.removeAllListeners(constant.mysql.queryByUser_reply)
})

</script>

<style scoped>
.father {
    color: white;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    /* background-color: white; */
    transition: 1s;
    z-index: 10;
}

.login_window {
    width: 300px;
    border: 1px solid rgb(255, 255, 255);
    border-radius: 10px;
    padding: 20px 20px;
    background-color: white;
}

.big_title {
    font-size: 30px;
    color: black;
    margin-bottom: 20px;
}
</style>