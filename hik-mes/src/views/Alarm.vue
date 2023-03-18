<template>
  <div class="father">
    <div class="signs">
      <n-button v-for="(item,index) in conAlarms" :key="index" :color="item.color">{{item.machine}}</n-button>
    </div>
    <div class="item">
      <div v-for="(item,index) in alarms" :key="index">
        <n-button :color="item.color" dashed style="width: 100%;" >{{item.content}}</n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ipcRenderer } from 'electron'
import { ref, onBeforeUnmount } from 'vue'
import constant from '@/lib/constant'
import utils from '@/utils/utils';
import dayjs from 'dayjs'

const conAlarms = ref(constant.alarms)
const alarms = ref([])
var lastScanIndex = []//上次扫描告警下标
const allAlarm = []
constant.alarms.forEach(e => {
  let colorContent = []
  e.content.forEach(z => {
    colorContent.push({color: e.color, content: z})
  })
  allAlarm.push(...colorContent)
  let emptyArray = []
  if(e.amount * 8 > e.content.length){
    for(let i= 0; i < (e.amount*8 - e.content.length); i++){
      emptyArray.push('-')
    }
  }
  allAlarm.push(...emptyArray)
})

console.log(allAlarm)

const addAlarm = function(index, desc){
  if(alarms.value.length >= 50){
    alarms.value.pop()
  }
  if(!lastScanIndex.includes(index)){
    alarms.value.unshift(desc)
  }
}

//100ms更新频率
const catchAlarm = setInterval(() => {
  let start = dayjs().valueOf()
  let indexArray =[]
  ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.alarm).then(res => {
    // console.log(res)
    if (res.success) {
      for (let i = 0; i < res.value.length; i++) {
        if (res.value[i] != 0) {
          console.log(i, '-', res.value[i])
          let numStr = utils.fullBinary(res.value[i].toString(2))
          // console.log(numStr)
          for (let n = numStr.length - 1; n >= 0; n--) {
            if (numStr[n] == '1') {
              let index = 7-n + i*8                              
              indexArray.push(index)
              addAlarm(index, allAlarm[index])
            }
          }
        }
      }
      let end = dayjs().valueOf()
      lastScanIndex = indexArray
      // console.log('lastScanIndex:',lastScanIndex)
      // console.log('diff:', end - start)
    } else {
      // window.$message.error('获取PLC告警信息失败，请检查线路')
    }
  })
}, 1000)

onBeforeUnmount(() => {
  clearInterval(catchAlarm)
})

</script>

<style scoped>
.father{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.signs{
  padding: 10px;
  display: flex;
  width: 100%;
}
.signs>button{
  margin-right: 5px;
}
.item{
  padding:0 10px 7px 10px;
}
.item>div{
  margin-bottom: 3px;
}
</style>