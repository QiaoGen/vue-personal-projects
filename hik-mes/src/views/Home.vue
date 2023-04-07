<template>
  <div class="home">
    <div class="menu">
      <menu-bar />
    </div>
    <div class="right">
      <div class="centent">
        <n-layout style="height: 100%;">
          <router-view v-slot="{ Component }">
            <keep-alive include="MainWindow">
              <component :is="Component" :alarms="alarms" />
            </keep-alive>
          </router-view>
        </n-layout>
      </div>
      <div style="height: 30px;width: 100%;"></div>
      <div class="bottom_bar">
        <n-layout style="height: 100%;">
          <status-bar />
        </n-layout>
      </div>
    </div>
  </div>
</template>

<script setup>
// import headGuider from '@/components/home/headGuider.vue'
import { ref, onBeforeUnmount, computed } from 'vue'
import { ipcRenderer } from 'electron';
import MenuBar from '@/views/MenuBar.vue';
import StatusBar from '@/views/StatusBar.vue'
import constant from '@/lib/constant'
import store from '@/store'
import utils from '@/utils/utils';
import dayjs from 'dayjs'

const workFlag = computed(() => {
  return store.state.workFlag
})
const plcStatus = computed(() => {
  return store.state.plcStatus
})

// const warnCategory = {
//   "01": {
//     name: '工艺参数',
//     "0": '不合格',
//     "1": '合格'
//   },
//   "02": {
//     name: '设备状态',
//     "01": '运行',
//     "02": '停止',
//     "03": '故障'
//   },
//   "03": {
//     name: '报警信息'
//   },
//   "04": {
//     name: '产量'
//   },
//   "05": {
//     name: '心跳'
//   },
// }


// 告警信息格式定义
// {
//   value,关键值 任何数据类型
//   msg,封装的信息
//   type 告警信息类型 info warning error
// }
ipcRenderer.on('sysInfo-reply', function (event, arg) {
  console.log('sysInfo:', arg)
})

//心跳
const heartbeat = setInterval(() => {
  if (!plcStatus.value) {
    return
  }
  ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.heartbeat, Buffer.from([1])).then(res => {
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
  // getIPPortStatus()
  //发送心跳同时发送设备运行状态,检测plc/tcp连接状态 ping ip port
}, 2000);

//-------告警信息
// const conAlarms = ref(constant.alarms)
const alarms = ref([])
var lastScanIndex = []//上次扫描告警下标
const allAlarm = []
constant.alarms.forEach(e => {
  let colorContent = []
  e.content.forEach(z => {
    colorContent.push({ color: e.color, content: z, time: null })
  })
  allAlarm.push(...colorContent)
  let emptyArray = []
  if (e.amount * 8 > e.content.length) {
    for (let i = 0; i < (e.amount * 8 - e.content.length); i++) {
      emptyArray.push({ color: '', content: 'empty', time: null })
    }
  }
  allAlarm.push(...emptyArray)
})

const addAlarm = function (index, desc) {
  if (alarms.value.length >= 50) {
    alarms.value.pop()
  }
  if (!lastScanIndex.includes(index)) {
    desc.time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    alarms.value.unshift(desc)
    // console.log(desc)
    // ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.insertAlarm, JSON.stringify([desc.content])).then(res)
    ipcRenderer.send('mysql-msg', constant.mysql.insertAlarm, JSON.stringify([desc.content]))
  }
}

//获取告警信息 100ms更新频率
const catchAlarm = setInterval(() => {
  // let start = dayjs().valueOf()
  if (!plcStatus.value) {
    return
  }
  let indexArray = []
  // ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.alarm, Buffer.from([0, 1, 1, 1, 1, 2, 0, 1, 2, 45, 33, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0])).then()
  ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.alarm).then(res => {
    // console.log(res)
    if (res.success) {
      for (let i = 0; i < res.value.length; i++) {
        if (res.value[i] != 0) {
          let numStr = utils.fullBinary(res.value[i].toString(2))
          for (let n = numStr.length - 1; n >= 0; n--) {
            if (numStr[n] == '1') {
              let index = 7 - n + i * 8
              indexArray.push(index)
              addAlarm(index, allAlarm[index])
            }
          }
        }
      }
      // let end = dayjs().valueOf()
      lastScanIndex = indexArray
      // console.log('lastScanIndex:',lastScanIndex)
      // console.log('diff:', end - start)
    } else {
      // window.$message.error('获取PLC告警信息失败，请检查线路')
    }
  })
}, 1000)
// -------


// 移除监听器
onBeforeUnmount(() => {
  // ipcRenderer.removeAllListener('sysInfo-reply')
  clearInterval(heartbeat)
  clearInterval(catchAlarm)
})
</script>

<style scoped>
.fix_head {
  width: 100%;
}

.home {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  ;
}

.menu {
  height: 100%;
  z-index: 10;
  background-color: aliceblue;
}

.right {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.centent {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.bottom_bar {
  width: 100%;
  height: 30px;
  position: absolute;
  bottom: 0;
  background-color: rgb(233, 233, 233);
  overflow: hidden;
  border-top: 1px solid rgb(223, 223, 223);
}
</style>