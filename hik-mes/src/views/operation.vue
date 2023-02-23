<template>
  <div style="height: auto;padding: 10px;">
    <div class="father" >
      <div class="card" >
        <div class="card_head" >
          <div class="item_title">未验证工单({{barcdList.length}})</div>
          <n-button @click="validBarcd" :disabled="unValidBarcd.length == 0" type="success" style="margin-right: 5px;margin-left: auto;">验证</n-button>
          <n-button :disabled="unValidBarcd.length == 0" type="error" style="margin-right: 5px;margin-left: 5px;">删除</n-button>
          <n-checkbox :checked="unValidBarcd.length == barcdList.length && barcdList.length != 0" label="全选" @update:checked="selectAllUnValidBarcd" style="margin-right: 0px;margin-left: 5px;"/>
        </div>
        <div class="barch_f">
          <n-checkbox-group v-model:value="unValidBarcd" @update:value="selectUnValidBarcd">
            <div class="item_t" v-for="(item,index) in barcdList" :key="index">
              <div class="barch_item">
                <n-checkbox :value="item.Barcd" :label="item.Barcd"/>
              </div>
            </div>
          </n-checkbox-group>
        </div>
      </div>

      <div class="card" >
        <div class="card_head" >
          <div class="item_title">已验证工单({{readyBarcdList.length}})</div>
          <div style="margin-right: 0px;margin-left: auto;">
            <n-button :disabled="readyValidBarcd.length == 0 || readyValidBarcd.length != 100" type="success" style="margin-right: 5px;margin-left: auto;">生成集成码</n-button>
            <n-button :disabled="readyValidBarcd.length == 0" type="error" style="margin-right: 5px;">删除</n-button>
            <n-checkbox :checked="readyValidBarcd.length == readyBarcdList.length && readyBarcdList.length != 0" label="全选" @update:checked="selectAllReadyValidBarcd" style="margin-right: 0px;margin-left: auto;"/>
          </div>
        </div>
        <div class="barch_f">
          <n-checkbox-group v-model:value="readyValidBarcd" @update:value="selectReadyValidBarcd">
            <div class="item_t"  v-for="(item,index) in readyBarcdList" :key="index">
              <div class="barch_item">
                <n-checkbox :value="item.Barcd" :label="item.Barcd"/>
              </div>
            </div>
          </n-checkbox-group>
        </div>
      </div>

      <div class="card" >
        <div class="card_head" >
          <div class="item_title">待打印集成码({{readyBarcdList.length}})</div>
          <div style="margin-right: 0px;margin-left: auto;">
            <n-button :disabled="readyValidBarcd.length == 0 || readyValidBarcd.length != 100" type="success" style="margin-right: 5px;margin-left: auto;">打印</n-button>
            <n-button :disabled="readyValidBarcd.length == 0" type="error" style="margin-right: 5px;">作废</n-button>
            <n-checkbox :checked="readyValidBarcd.length == readyBarcdList.length && readyBarcdList.length != 0" label="全选" @update:checked="selectAllReadyValidBarcd" style="margin-right: 0px;margin-left: auto;"/>
          </div>
        </div>
        <div class="barch_f">
          <n-checkbox-group v-model:value="readyValidBarcd" @update:value="selectReadyValidBarcd">
            <div class="item_t"  v-for="(item,index) in readyBarcdList" :key="index">
              <div class="barch_item">
                <n-checkbox :value="item.Barcd" :label="item.Barcd"/>
              </div>
            </div>
          </n-checkbox-group>
        </div>
      </div>
      
    </div>


    

  </div>
  
</template>

<script setup>
import { ref } from '@vue/reactivity';
import { ipcRenderer } from 'electron';
import { onBeforeUnmount } from 'vue'
import hik from '@/lib/hik'

//数据库读取工单
const barcdList = ref([])
const readyBarcdList = ref([])
//选择的工单
const pkgNumberList = ref([])
const unValidBarcd = ref([])
const readyValidBarcd = ref([])

//控制卡片编辑状态
const unValidLoading = ref(false)
const validLoading = ref(false)

// 获取集成码 100
const getbarcdList = function(){
  ipcRenderer.send('mysql-msg','queryBarcdList')
}
const getReadyBarcdList = function(){
  ipcRenderer.send('mysql-msg','queryReadyBarcdList')
}
getbarcdList()
getReadyBarcdList()

ipcRenderer.on('queryBarcdList-reply', function(event,arg){
  barcdList.value = arg
})
ipcRenderer.on('queryReadyBarcdList-reply', function(event,arg){
  readyBarcdList.value = arg
})

//未验证工单操作
const selectUnValidBarcd = function(e){
  unValidBarcd.value = e
}
//未验证工单全选
const selectAllUnValidBarcd = function(e){
  let li = []
  if(e === true){
    barcdList.value.forEach(i => {
      li.push(i.Barcd)
    })
  }
  unValidBarcd.value = li
}
//待验证工单操作
const selectReadyValidBarcd = function(e){
  readyValidBarcd.value = e
}

//待验证工单全选
const selectAllReadyValidBarcd = function(e){
  let li = []
  if(e === true){
    readyBarcdList.value.forEach(i => {
      li.push(i.Barcd)
    })
  }
  readyValidBarcd.value = li
}

//验证操作
const validBarcd = function(){
  let PrimiseList = []
  for(let i = 0; i <= unValidBarcd.value.length - 1;i++){
    PrimiseList.push(hik.validBarcd(unValidBarcd.value[i]))
  }
  Promise.all(PrimiseList).then(res => {
    let param = JSON.stringify(unValidBarcd.value)
    console.log('param:',param)
    //存入数据库
    ipcRenderer.send('mysql-msg','updateBarcdValidStatus',param)
    flushData()
  }).catch(err => {
    let er = '工单验证失败' + err.value
    //unValidBarcd中失败工单之前的工单成功 插入数据库，修改验证状态
    let faildIndex = unValidBarcd.value.findIndex((item) => item === err.value)
    if(faildIndex != 0){
      let param = JSON.stringify(unValidBarcd.value.slice(0, faildIndex))
      ipcRenderer.send('mysql-msg','updateBarcdValidStatus',param)
    }
    flushData()
    window.$message.error(er)
  })
}
//数据库异常返回
ipcRenderer.on('updateBarcdValidStatus-reply',function(event,arg){
  window.$message.error(arg)
})

const flushData = function(){
  unValidBarcd.value = []
  getbarcdList()
  getReadyBarcdList()
}


// 移除监听器
onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners('querybarcdList-reply','queryReadyBarcdList-reply','updateBarcdValidStatus-reply')
  console.log('onMounted')
})

</script>

<style scoped>
.father{
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: flex-start;
  /* align-items: center; */
  /* flex-direction: column; */
}
.barch_item{
  cursor: pointer;
  background-color: rgba(46, 54, 56, 0.05);
  height: 34px;
  line-height: 34px;
  transition: all 0.2s linear;
  font-size: 14px;
  border-bottom: 1px solid rgb(233, 233, 233);
}
.barch_item:hover{
  background-color: rgba(46, 54, 56, 0.09);
  /* height: 80px;
  line-height: 80px;
  font-size: 18px; */
}
.barch_f{
  width: 400px;
  max-height: 600px;
  overflow: scroll;
  overflow-x: hidden;
  /* border: 1px solid lightgray; */
  flex: auto;
  /* padding-right: 13px; */
  /* background-color: lightgreen; */
}
.item_t{
  display: flex;
  flex-direction: column;
}
.item_title{
  margin-left: 5px;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}
.card_head{
  display: flex;
  flex-direction: row; 
  align-items: center;
  height: 40px;
  overflow: hidden;
  border-bottom: 1px solid lightgray;
}
.card{
  display: flex;
  width: 400px;
  flex-direction: column;
  overflow: hidden;
  box-shadow: lightgray 0px 5px 5px 5px ; 
  border-radius: 5px;
  margin-right:40px;
}
</style>