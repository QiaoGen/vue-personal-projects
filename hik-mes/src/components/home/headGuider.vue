<template>
  <div class="head">
    
    <n-button @click="skipHome" class="optionl" style="margin-left:10px;">
        <template #icon>
            <n-icon>
                <Home24Regular />
            </n-icon>
        </template>
        主页
    </n-button>

    <n-badge :value="params.msgNum" processing>
        <n-button @click="skipWarning" class="optionl">
        <template #icon>
            <n-icon>
                <BookmarkMultiple24Regular />
            </n-icon>
        </template>
        设备告警信息
        
    </n-button>
    </n-badge>
    
    
    <n-button @click="skipLogWindow" class="optionl">
        <template #icon>
            <n-icon>
                <BookmarkSearch24Regular />
            </n-icon>
        </template>
        系统日志
    </n-button>

    <div class="optionl">
        <div>PLC</div>
        <div :class="plcConnectionStatus? 'point_green':'point'"></div>
    </div>
    <div class="optionl">
        <div>打印机地址({{model.ip}}:{{model.port}})</div>
        <div :class="tcpConnectionStatus? 'point_green':'point'"></div>
    </div>
    <n-button type="error" v-show="!plcConnectionStatus" @click="reConnectPLC" style="margin-right: 10px;">重连PLC</n-button>
    <!-- <n-button type="error" :v-show="plcConnectionStatus">重连打印机</n-button> -->
    <n-icon size="30" class="menu_icon" @click="activate('right')">
        <MdMenu/>
    </n-icon>
    <n-drawer v-model:show="active" :width="502" :placement="placement">
        <n-drawer-content title="参数配置">
            <n-form ref="formRef" :model="model" :rules="rules">
                <n-form-item path="ip" label="打印机 IP地址">
                    <n-input v-model:value="model.ip" placeholder="0.0.0.0-255.255.255.255"></n-input>
                </n-form-item>
                <n-form-item path="port" label="打印机 端口">
                    <n-input v-model:value="model.port" placeholder="1-65535"></n-input>
                </n-form-item>
                <n-form-item path="WorkStation" label="MES 扫描站点">
                    <n-input v-model:value="model.WorkStation" placeholder=""></n-input>
                </n-form-item>
                <n-form-item path="MachineId" label="设备编号">
                    <n-input v-model:value="model.MachineId" placeholder=""></n-input>
                </n-form-item>
                <div style="display: flex; justify-content: flex-end">
                    <n-button
                        round
                        :disabled="model.WorkStation === null || model.MachineId === null"
                        type="primary"
                        @click="handleValidateButtonClick"
                    >
                        提交
                    </n-button>
                </div>
            </n-form>
        </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { MdMenu } from '@vicons/ionicons4'
import { Home24Regular,BookmarkSearch24Regular,BookmarkMultiple24Regular } from '@vicons/fluent'
import { ref, reactive, onBeforeUnmount } from 'vue'
// import { useMessage } from 'naive-ui'
import router from '@/router'
import { ipcRenderer } from 'electron'

import { defineProps } from 'vue'
const params = defineProps({
    msgNum:{
        type: Number,
        default: 0
    }
})

const plcConnectionStatus = ref(false)
const tcpConnectionStatus = ref(false)

const formRef = ref(null)
// const model = ref({
//     WorkStation: ref(computed(() => {
//     return store.state.WorkStation
// })),
//     MachineId: ref(computed(() => {
//     return store.state.MachineId
// }))
// })
// const model = ref({
//     WorkStation: store.state.WorkStation,
//     MachineId: store.state.MachineId
// })
const model = ref({
    WorkStation: null,
    MachineId: null,
    ip: null,
    port: null
})
const rules = reactive({
    WorkStation: {
        required: true,
        message: "请输入扫描站点",
        trigger: ["blur"]
    },
    MachineId: {
        required: true,
        message: "请输入设备编号",
        trigger: ["blur"]
    },
    ip: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if(!value){
                return new Error("请输入IP地址")
            }else if(!/^(([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])$/.test(value)){
                return new Error("请输入正确格式")
            }
            return true
        }
    },
    port: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if(!value){
                return new Error("请输入端口")
            }else if(Number(value) <= 0 || Number(value) > 65536){
                return new Error("端口取值范围（1～65535）")
            }
            return true
        }
    },
})

const active = ref(false)
const placement = ref("right");
const activate = (place) => {
    active.value = true;
    placement.value = place;
}

const handleValidateButtonClick = function(e){
    e.preventDefault();
        formRef.value?.validate((errors) => {
          if (!errors) {
            window.$message.success("配置成功");
            ipcRenderer.send('mysql-msg','updateSysConfig',JSON.stringify(model.value))
          } else {
            console.log(errors);
            window.$message.error("配置失败");
          }
        });
}

ipcRenderer.once('updateSysConfig-reply',function(event, arg){
    console.log(arg)
})


const skipLogWindow = function(){
    router.replace('/logWindow')
}
const skipHome = function(){
    router.replace('/')
}
const skipWarning = function(){
    router.replace('/warning')
}

getPLCInfo()
function getPLCInfo(){
    ipcRenderer.send('plc-msg','getPLCInfo')
}
ipcRenderer.on('getPLCInfo-reply',function(event, arg){
    console.log('getPLCInfo-reply:', arg)
    plcConnectionStatus.value = arg.plcConnetStatus
    if(!plcConnectionStatus.value){
        window.$message.error("PLC连接失败！请检查PLC是否正确接入。",{
            closable: true,
            duration: 5e3
          });
    }
})

//获取系统信息
const getSysInfo = function(){
    ipcRenderer.send('mysql-msg','querySysConfig')
}
ipcRenderer.once('querySysConfig-reply',function(event, arg){
    let sysConfig = JSON.parse(arg)[0]
    console.log(sysConfig)
    model.value = {
        WorkStation: sysConfig.WorkStation,
        MachineId: sysConfig.MachineId,
        ip: sysConfig.PrintIP,
        port: sysConfig.PrintPort
    }
})
getSysInfo()


const reConnectPLC = function(){
    ipcRenderer.send('plc-msg','reconnectPLC')
    // getPLCInfo()
}


// 获取plc/tcp状态
const getIPPortStatus = setInterval(()=>{
    ipcRenderer.send('checkIPPort-msg')
},20000)
ipcRenderer.on('getIPPort-reply', function(event, arg){
    if(arg.tcp == true || arg.tcp == false){
        tcpConnectionStatus.value = arg.tcp
    }
    if(arg.plc == true || arg.plc == false){
        plcConnectionStatus.value = arg.plc
    }
})


onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners('getIPPort-reply','getPLCInfo-reply')
  clearInterval(getIPPortStatus)
})

</script>

<style scoped>
.head{
    height: 60px;
    /* background-color: rgb(247, 184, 184); */
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgb(239, 239, 245);
    background-color: white;
    z-index: 10;
}
.menu_icon{
   cursor: pointer;
   margin-left: auto;
   margin-right: 20px;
}
.point{
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: #d03050;
    box-shadow: #d030507d 0px 0px 4px 2px;
    margin-left: 7px;
}
.point_green{
    width: 8px;
    height: 8px;
    border-radius: 4px;
    box-shadow: #18a0577d 0px 0px 4px 2px;
    margin-left: 7px;
    background-color: #18a058;
}
.optionl{
    display: flex;
    align-items: center;
    /* margin-right: 15px; */
    margin-left: 15px;
}
.sys_log{
    cursor: pointer;
}
.reload_icon{
    color: #d03050;
    cursor: pointer;
    margin-right: 5px;
    transform: rotate(90deg);
}
@keyframes rotate360 {
    100% {
        transform: rotate(360deg);
    }
}

</style>