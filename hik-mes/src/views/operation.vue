<template>
  <div style="height: auto;padding: 10px;">
    <div class="father" >
      <div class="card" >
        <div class="card_head" >
          <div class="item_title">未验证工单({{barcdList.length}})</div>
          <n-button :disabled="unValidBarcd.length == 0" type="success" style="margin-right: 5px;margin-left: auto;">验证</n-button>
          <n-button :disabled="unValidBarcd.length == 0" type="error" style="margin-right: 5px;margin-left: 5px;">删除</n-button>
          <n-checkbox  label="全选" @update:checked="selectAllUnValidBarcd" style="margin-right: 0px;margin-left: 5px;"/>
        </div>
        <div class="barch_f">
          <n-checkbox-group v-model:value="unValidBarcd" @update:value="selectUnValidBarcd">
            <div class="item_t" v-for="(item,index) in barcdList">
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
          <!-- <n-button :disabled="unValidBarcd.length == 0" type="success" style="margin-right: 5px;margin-left: auto;">验证</n-button> -->
          <div style="margin-right: 0px;margin-left: auto;">
            <n-button :disabled="unValidBarcd.length == 0" type="error" style="margin-right: 5px;">删除</n-button>
            <n-checkbox  label="全选" @update:checked="selectAllUnValidBarcd" style="margin-right: 0px;margin-left: auto;"/>
          </div>
        </div>
        <div class="barch_f">
          <n-checkbox-group v-model:value="unValidBarcd" @update:value="selectUnValidBarcd">
            <div class="item_t" v-for="(item,index) in readyBarcdList">
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

const barcdList = ref([])
const readyBarcdList = ref([])
const unValidBarcd = ref([])

// 获取集成码 100
const getbarcdList = function(){
  ipcRenderer.send('mysql-msg','queryBarcdList')
}
const getReadyBarcdList = function(){
  ipcRenderer.send('mysql-msg','queryReadyBarcdList')
}
getbarcdList()
getReadyBarcdList()

ipcRenderer.on('queryBarcdList-replay', function(event,arg){
  barcdList.value = arg
})
ipcRenderer.on('queryReadyBarcdList-replay', function(event,arg){
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

// 移除监听器
onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners('querybarcdList-replay','queryReadyBarcdList-replay')
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
  border: 1px solid lightgray;
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