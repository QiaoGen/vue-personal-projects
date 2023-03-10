<template>
    <div class="father">
        <div class="card">
            <div class="title">序列号校验</div>
            <div style="padding:10px;">
                <div>产品序列号:</div>
                <div class="result">1231231</div>
                <div>MES校验结果:</div>
                <div class="result" style="height: 160px;line-height: 20px;">
                    {{ mesValidMsg }} </div>
                <div style="display: flex;align-items: center;margin-bottom: 10px;">
                    <div>校验标志</div>
                    <div :class="barcdStatus ? 'point_green' : 'point'"></div>
                    <n-button @click="clearError" v-if="!barcdStatus" style="margin-left: 10px;"
                        type="error">清除报错</n-button>
                </div>
            </div>
            <message-window class="msg_window" :msg="barcdMsg"></message-window>
        </div>
        <div class="card" style="width: 60%;">
            <div class="title">集成码打印</div>
            <div style="display: flex;">
                <div style="padding:10px;width: 50%;">
                    <div>装箱数量:</div>
                    <div class="result">{{ readyBarcdList.length }}</div>
                    <div>称重数据:</div>
                    <div class="result">{{ weight ? weight + 'kg' : null }}</div>
                    <div>集成码:</div>
                    <div class="result">{{pkgNumber}}</div>
                    <div style="margin-bottom: 10px;">
                        <n-button type="success">打印</n-button>
                        <n-button @click="clearAll" style="margin-left: 10px;" type="error">清空缓存</n-button>
                    </div>
                    <div style="display: flex;align-items: center;margin-bottom: 10px;">
                        <div>集成码标志</div>
                        <div :class="pkgNumberStatus ? 'point_green' : 'point'"></div>
                        <div style="margin-left: 20px;">打印标志</div>
                        <div :class="printStatus ? 'point_green' : 'point'"></div>
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
            <message-window class="msg_window" :msg="pkgNumberMsg"></message-window>
        </div>
    </div>
</template>

<script setup>
import MessageWindow from '@/components/home/MessageWindow.vue'
import { reactive, ref, onBeforeUnmount } from 'vue'
import { ipcRenderer } from 'electron'
import hik from '@/lib/hik'

//待验证序列号
const barcd = ref(null)
const pkgNumber = ref(null)//集成码
const mesValidMsg = ref(null)//mes校验结果
//序列号验证状态
const barcdStatus = ref(true)
const pkgNumberStatus = ref(true)
const printStatus = ref(true)
//存储序列号数据交互信息
const barcdMsg = reactive([{ type: 'plc', msg: 'read plc', info: 'info' }, { type: 'mes', msg: 'valid barcd', info: 'info' }, { type: 'plc', msg: 'plc read failed ', info: 'error' }])
const pkgNumberMsg = reactive([])

const readyValidBarcd = ref([])//多选
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

//获取已验证序列号
const catchValidedBarcd = setInterval(() => {
    getReadyBarcdList()
    //获取称重数据
    //判断是否满箱（100）=> 获取集成码
    if (readyBarcdList.value.length == 100 && weight.value != null) {
        generatePkgNumber()
    }
}, 10000);

//生成集成码
const generatePkgNumber = function () {
    let param = []
    for (let i = 0; i < readyBarcdList.value.length - 1; i++) {
        param.push({ Barcd: readyBarcdList.value[i] })
    }
    param.push({ Barcd: readyBarcdList.value[readyBarcdList.value.length - 1], PkgInfo: { Weigth: weight.value } })
    hik.getPkgNumber(param).then(res => {
        if (res.ErrCode === 700022) {
            window.$message.warning('mes打印服务失效')
        }
        pkgNumber.value = res.Data.PkgNumber
        //Barcd绑定PkgNumber，PkgStatus=1, 插入pkg_number_list
        let param = []
        param.push(pkgNumber.value)
        readyBarcdList.value.forEach(e => {
            param.push(e)
        })
        param.push(pkgNumber.value)
        ipcRenderer.send('updateBarcdPkgStatus',JSON.stringify(param))

    }).catch(err => {
        console.error(err)
        window.$message.error('生成集成码失败')
    })
}
//数据库异常返回
ipcRenderer.on('updateBarcdPkgStatus-reply', function (event, arg) {
    window.$message.error(arg)
})


//获取产品序列号
const catchBarcd = setInterval(() => {
    if (!barcdStatus.value) {
        return
    }

}, 1000);

//清除报错
const clearError = function () {
    barcd.value = null
    mesValidMsg.value = null
    barcdStatus.value = true
}

//验证操作
const validBarcd = function () {
    hik.validBarcd(unValidBarcd.value[i]).then(res => {
        let param = JSON.stringify([barcd.value])
        ipcRenderer.send('mysql-msg', 'updateBarcdValidStatus', param)
        mesValidMsg.value = 'MES校验成功'
        barcdStatus.value = true
        transMsg(barcdMsg, res, 'mes', 'info')
    }).catch(err => {
        mesValidMsg.value = 'MES校验失败：' + err
        barcdStatus.value = false
        transMsg(barcdMsg, err, 'mes', 'error')
    })
}
//数据库异常返回
ipcRenderer.on('updateBarcdValidStatus-reply', function (event, arg) {
    window.$message.error(arg)
})

//删除待验证工单
const deleteValidBarcd = function () {
    ipcRenderer.send('mysql-msg', 'deleteBarcd', JSON.stringify(readyValidBarcd.value))
}
ipcRenderer.on('deleteBarcd-reply', function (event, arg) {
    if (arg.success) {
        flushData()
    } else {
        window.$message.error('序列号删除失败')
    }
})
const flushData = function () {
    readyValidBarcd.value = []
    getReadyBarcdList()
}

//清空缓存
const clearAll = function(){
    ipcRenderer.send('deleteAllBarcd')
}
ipcRenderer.on('deleteAllBarcd-reply', function (event, arg) {
    if(arg.success){
        weight.value = null
        pkgNumber.value = null
        pkgNumberStatus = null
    }
    window.$message.error(arg)
})

//ms长度超过50条自动清除
const transMsg = function (msgs, msg, type, info) {
    let item = {
        msg,
        type,
        info
    }
    if (msgs.value.lenght == 50) {
        msg.value.slice(0, 1)
    }
    msgs.value.push(item)
}

onBeforeUnmount(() => {
    ipcRenderer.removeAllListeners('queryReadyBarcdList-reply', 'deleteBarcd-reply', 'updateBarcdPkgStatus-reply')
    clearInterval(catchBarcd)
    clearInterval(catchValidedBarcd)
})

</script>

<style socped>
.father {
    width: 100%;
    height: 100%;
    display: flex;
}

.card {
    width: 40%;
    padding: 5px;
    text-align: left;
    /* height: 100%; */
    display: flex;
    flex-direction: column;
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
    0% {
        transform: scale(.97);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(.97);
    }
}

.point_green {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    box-shadow: #18a0577d 0px 0px 8px 4px;
    margin-left: 10px;
    background-color: #18a058;
}

.barch_f {
    width: 50%;
    margin-bottom: 20px;
}

.barch_list {
    border: 1px solid rgb(233, 233, 233);
    height: 265px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: auto;
}

.barch_item {
    width: 100%;
    cursor: pointer;
    background-color: rgba(46, 54, 56, 0.05);
    height: 34px;
    line-height: 34px;
    transition: all 0.2s linear;
    font-size: 14px;
    border-bottom: 1px solid rgb(233, 233, 233);
}

.barch_item:hover {
    background-color: rgba(46, 54, 56, 0.09);
}

.item_t {
    width: 100%;
    display: flex;
    text-indent: 10px;
}

.msg_window {
    margin: 0 10px;
    flex: 1;
}</style>
