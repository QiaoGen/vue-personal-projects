<template>
    <div class="father">
        <div class="card">
            <div class="title">序列号校验</div>
            <div style="padding:10px;">
                <div>产品序列号:</div>
                <div class="result">1231231</div>
                <div>MES校验结果:</div>
                <div class="result" style="height: 160px;line-height: 20px;">
                    mes校验成功 </div>
                <div style="display: flex;align-items: center;margin-bottom: 10px;">
                    <div>校验标志</div>
                    <div :class="barchStatus ? 'point_green' : 'point'"></div>
                </div>
            </div>
            <message-window :msg="barcdMsg"></message-window>
        </div>
        <div class="card" style="width: 60%;">
            <div class="title">集成码打印</div>
            <div style="display: flex;">
                <div style="padding:10px;width: 50%;">
                    <div>装箱数量:</div>
                    <div class="result">100</div>
                    <div>称重数据:</div>
                    <div class="result">{{weight? weight+'kg':null}}</div>
                    <div>集成码:</div>
                    <div class="result">QHS234s33</div>
                    <div style="margin-bottom: 10px;">
                        <n-button type="success">打印</n-button>
                        <n-button style="margin-left: 10px;" type="error">清空缓存</n-button>
                    </div>
                    <div style="display: flex;align-items: center;margin-bottom: 10px;">
                        <div>集成码标志</div>
                        <div :class="barchStatus ? 'point_green' : 'point'"></div>
                        <div style="margin-left: 20px;">打印标志</div>
                        <div :class="barchStatus ? 'point_green' : 'point'"></div>
                    </div>
                </div>
                <div class="barch_f">
                    <div class="card_head">
                        <div style="margin-right: 0px;margin-left: auto;">
                            <n-button @click="generatePkgNumber" secondary
                                :disabled="readyValidBarcd.length == 0 || readyValidBarcd.length != 100" type="success"
                                style="margin-right: 5px;margin-left: auto;">生成集成码</n-button>
                            <n-button @click="deleteValidBarcd" secondary :disabled="readyValidBarcd.length == 0"
                                type="error" style="margin-right: 5px;">删除</n-button>
                            <n-checkbox
                                :checked="readyValidBarcd.length == readyBarcdList.length && readyBarcdList.length != 0"
                                label="全选" @update:checked="selectAllReadyValidBarcd"
                                style="margin-right: 0px;margin-left: auto;" />
                        </div>
                    </div>
                    <n-checkbox-group v-model:value="readyValidBarcd" @update:value="selectReadyValidBarcd">
                        <div class="barch_list">
                            <div class="item_t" v-for="(item, index) in readyBarcdList" :key="index">
                                <div class="barch_item">
                                    <n-checkbox :value="item.Barcd" :label="item.Barcd" />
                                </div>
                            </div>
                        </div>
                    </n-checkbox-group>
                </div>
            </div>
            <message-window :msg="pkgNumberMsg"></message-window>
        </div>
    </div>
</template>

<script setup>
import MessageWindow from '@/components/home/MessageWindow.vue'
import { reactive, ref, onBeforeUnmount } from 'vue'
import { ipcRenderer } from 'electron'

const barchStatus = ref(true)
//存储序列号数据交互信息
const barcdMsg = reactive([{ type: 'plc', msg: 'werwerwer', info: 'info' }, { type: 'mes', msg: 'fsfsdfsdf', info: 'info' }, { type: 'plc', msg: 'werwerwer', info: 'error' }])
const pkgNumberMsg = reactive([])

const readyValidBarcd = ref([])
const readyBarcdList = ref([])

//称重数据
const weight = ref(null)

//待验证工单操作
const selectReadyValidBarcd = function (e) {
    readyValidBarcd.value = e
}
const getReadyBarcdList = function () {
    ipcRenderer.send('mysql-msg', 'queryReadyBarcdList')
}
ipcRenderer.on('queryReadyBarcdList-reply', function (event, arg) {
    readyBarcdList.value = arg
})
getReadyBarcdList()

//待验证工单全选
const selectAllReadyValidBarcd = function (e) {
    let li = []
    if (e === true) {
        readyBarcdList.value.forEach(i => {
            li.push(i.Barcd)
        })
    }
    readyValidBarcd.value = li
}

onBeforeUnmount(() => {
    ipcRenderer.removeAllListeners('queryReadyBarcdList-reply')
    console.log('onMounted')
})

</script>

<style socped>
.father {
    width: 100%;
    height: 100%;
    display: flex;
}

.card {
    height: 100%;
    width: 40%;
    border: 2px solid rgb(204, 204, 204);
    padding: 5px;
    text-align: left;
    height: 100%;
    /* display: flex; */
    /* background-color: rgb(212, 219, 223); */
}

.title {
    font-weight: bold;
    font-size: 16px;
}

.result {
    min-height: 40px;
    text-indent: 5px;
    color: white;
    background-color: rgba(0, 0, 0, 0.786);
    border: 2px solid gray;
    line-height: 40px;
    box-shadow: 1px 1px 1px gray;
    margin-bottom: 10px;

}

.point {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    background-color: #d03050;
    box-shadow: #d030507d 0px 0px 8px 4px;
    margin-left: 10px;
    animation: breathe 1s linear infinite;
}
@keyframes breathe {
  0%{ transform: scale(.97); }
  50%{ transform: scale(1.1); }
  100%{ transform: scale(.97); }
}

.point_green {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    box-shadow: #18a0577d 0px 0px 8px 4px;
    margin-left: 10px;
    background-color: #18a058;
    /* animation: breathe 3s linear infinite; */
    /* background: linear-gradient(145deg, #e6e6e6, #ffffff); */
}

.barch_f {
    /* border: 1px solid red; */
    width: 50%;
    margin-bottom: 20px;
}
.barch_list{
    border: 1px solid rgb(233, 233, 233);
    height: 265px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: auto;
}
.barch_item{
  width: 100%;
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
.item_t{
    /* display: ; */
    width: 100%;
    display: flex;
    
}
</style>
