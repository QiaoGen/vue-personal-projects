<template>
  <div style="height: 100%;display: flex;flex-direction: column;">
    <head-guider class="fix_head" :msgNum="msgNum"/>
    <!-- <div style="height:40px;"></div> -->
    <router-view style="flex: auto;"/>
  </div>
</template>

<script setup>
import headGuider from '@/components/home/headGuider.vue'
import { ref ,onBeforeUnmount} from 'vue'
import { ipcRenderer } from 'electron'; 
const msgNum = ref(0)

// 设备告警信息/PLC数据
const readPLC = function(){
  ipcRenderer.send('plc-msg','readPLC')
}

const warnCategory = {
  "01":{
    name: '工艺参数',
    "0": '不合格',
    "1": '合格'
  },
  "02":{
    name: '设备状态',
    "01": '运行',
    "02": '停止',
    "03": '故障'
  },
  "03":{
    name: '报警信息'
  },
  "04":{
    name: '产量'
  },
  "05":{
    name: '心跳'
  },
}

// const getIPPortStatus = function(){
//     ipcRenderer.send('checkIPPort-msg')
// }
// ipcRenderer.on('getIPPort-reply', function(event, arg){
//     console.log(arg)
// })
// getIPPortStatus()

// 告警信息格式定义
// {
//   value,关键值 任何数据类型
//   msg,封装的信息
//   type 告警信息类型 info warning error
// }
ipcRenderer.on('sysInfo-reply',function(event, arg){
  console.log('sysInfo:',arg)
})

const heartbeat = setInterval(() => {
  console.log('heartbeat')
  // getIPPortStatus()
  //发送心跳同时发送设备运行状态,检测plc/tcp连接状态 ping ip port
}, 10000);

// 移除监听器
onBeforeUnmount(() => {
  ipcRenderer.removeAllListener('sysInfo-reply')
  clearInterval(heartbeat)
})
</script>

<style scoped>
.fix_head{
  width: 100%;
  /* height: 300px; */
  /* position: fixed;
  top: 0; */
}
</style>