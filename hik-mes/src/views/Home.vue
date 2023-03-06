<template>
  <div class="home">
    <div class="menu">
      <menu-bar/>
    </div>
    <div class="right">
      <div class="centent">
        <n-layout style="height: 100%;">
          <router-view v-slot="{ Component }" >
          <keep-alive include="MainWindow">
            <component :is="Component" />
          </keep-alive>
        </router-view>
        </n-layout>
      </div>
      <div style="height: 30px;width: 100%;"></div>
      <div class="bottom_bar">
        <n-layout style="height: 100%;">
          <status-bar/>
        </n-layout>
      </div>
    </div>
  </div>
</template>

<script setup>
// import headGuider from '@/components/home/headGuider.vue'
import { ref ,onBeforeUnmount} from 'vue'
import { ipcRenderer } from 'electron'; 
import MenuBar from '@/views/MenuBar.vue';
import StatusBar from '@/views/StatusBar.vue'
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
  // ipcRenderer.removeAllListener('sysInfo-reply')
  clearInterval(heartbeat)
})
</script>

<style scoped>
.fix_head{
  width: 100%;
}
.home{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;;
}
.menu{
  height: 100%;
  z-index: 10;
  background-color: aliceblue;
}
.right{
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}
.centent{
  width: 100%;
  height: 100%;
  overflow: auto;
}
.bottom_bar{
  width: 100%;
  height: 30px;
  position: absolute;
  bottom: 0;
  background-color: rgb(233,233,233);
  overflow: hidden;
  border-top: 1px solid rgb(223, 223, 223);
}
</style>