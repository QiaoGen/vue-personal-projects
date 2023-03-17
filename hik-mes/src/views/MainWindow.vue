<template>
    <div class="father">
        <div class="card">
            <div class="title">序列号校验</div>
            <div style="padding:10px;">
                <div>产品序列号:</div>
                <div class="result">{{barcd}}</div>
                <div>MES校验结果:</div>
                <div class="result" style="height: 160px;line-height: 20px;">
                    {{ mesValidMsg }} </div>
                <div style="display: flex;align-items: center;margin-bottom: 10px;">
                    <div>校验标志</div>
                    <div :class="barcdStatus ? 'point_green' : 'point'"></div>
                    <n-button @click="clearError" v-if="!barcdStatus" style="margin-left: 10px;"
                        type="error">复位</n-button>
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
                    <div class="result">{{ pkgNumber }}</div>
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
import { reactive, ref, onDeactivated, onBeforeUnmount } from 'vue'
import { ipcRenderer } from 'electron'
import hik from '@/lib/hik'
import constant from '@/lib/constant'
import utils from '@/utils/utils'


//待验证序列号
const barcd = ref(null)
const pkgNumber = ref(null)//集成码
const mesValidMsg = ref(null)//mes校验结果
//序列号验证状态
const barcdStatus = ref(true)
const pkgNumberStatus = ref(false)
const printStatus = ref(false)
//存储序列号数据交互信息
// const barcdMsg = reactive([{ type: 'plc', msg: 'read plc', info: 'info' }, { type: 'mes', msg: 'valid barcd', info: 'info' }, { type: 'plc', msg: 'plc read failed ', info: 'error' }])
const barcdMsg = ref([])
const pkgNumberMsg = ref([])

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
    addPkgNumberMsg('plc','获取称重标识位', 'info')
    ipcRenderer.invoke('plc-msg-invoke','read',constant.plcCommand.weightSign).then(weightSignResult => {
        if(!weightSignResult.success){
            addPkgNumberMsg('plc', weightSignResult.value, 'error')
        }
        if(!weightSignResult.success || weightSignResult.value[0] == 0){
            //标识位为无
            return
        }
        // ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.weight, getUint8Array(4, function (view) { view.setUint32(0, 2345); })).then(weightResult => {
        // })
        ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.weight).then(weightResult => {
            console.log(weightResult)
            if(weightResult.success){
                let weightTemp = utils.getView(weightResult.value).getUint32()
                weight.value = weightTemp/100
                addPkgNumberMsg('plc', '读取称重数据'+weightTemp+ 'g', 'info')
            }
        })
    })
}, 5000);


//将数值写入到视图中，获得其字节数组，大端字节序
function getUint8Array(len, setNum) {
    var buffer = new ArrayBuffer(len);  //指定字节长度
    setNum(new DataView(buffer));  //根据不同的类型调用不同的函数来写入数值
    return new Uint8Array(buffer); //创建一个字节数组，从缓存中拿取数据
}

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
        ipcRenderer.send('updateBarcdPkgStatus', JSON.stringify(param))
        addPkgNumberMsg('mes','获取集成码'+ pkgNumber.value,'info')
        
    }).catch(err => {
        console.error(err)
        window.$message.error('生成集成码失败')
    })
}

console.log(Buffer.from([1]))


/**
 * 1.获取产品序列号标识位
 * 2.获取产品序列号
 * 3.验证是否错误 -> 写入错误标识位
 * 4.入库
 * 3.验证
 * 4.修改验证状态
 */
const catchBarcd = setInterval(() => {
    if (!barcdStatus.value) {
        return
    }
    addBarcdMsg('plc', '读取Barcd标识位', 'info')
    ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.barcdSign).then((result) => {
        console.log(result)
        if (result.success) {
            if (result.value[0] == 0) {
                addBarcdMsg('plc', '读取Barcd序列号', 'info')
                ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.barcd).then(res => {
                    console.log(res)
                    let barcdTemp = 'Q01801190oqp'
                    // let barcd = transArrayTobarcd(arg)
                    if (barcdTemp.lenght == 0 || barcdTemp == null) {
                        addBarcdMsg('plc', '序列号为空', 'error')
                        ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.barcdSignError, Buffer.from([1])).then(barcdSignErrRes => {
                            if (barcdSignErrRes.success) {
                                addBarcdMsg('plc', '写入错误标识位成功', 'info')
                            } else {
                                addBarcdMsg('plc', '写入错误标识位失败', 'error')
                            }
                        })
                        return
                    }
                    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.insertBarcd, barcdTemp).then(addRes => {
                        console.log(addRes)
                        if (addRes.success) {
                            barcd.value = barcdTemp
                            //mes校验序列号
                            validBarcd(barcdTemp)
                        } else {
                            if (addRes.msg.toString().indexOf('Duplicate entry') != -1) {
                                addBarcdMsg('plc', '序列号' + barcdTemp + '重复', 'error')
                                ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.barcdSignError, Buffer.from([1])).then(barcdSignErrRes => {
                                    // console.log(barcdSignErrRes)
                                    if (barcdSignErrRes.success) {
                                        addBarcdMsg('plc', '写入错误标识位成功', 'info')
                                    } else {
                                        addBarcdMsg('plc', '写入错误标识位失败', 'error')
                                    }
                                })
                                return
                            }
                        }
                    })
                })
            }
        } else {
            // console.error('msg:',barcdMsg.value)
            addBarcdMsg('plc',result.value, 'error')
            console.error(result.value)
        }
    })
}, 5000)

function addBarcdMsg(type, msg, info) {
    let param = {
        type,
        msg,
        info
    }
    if (barcdMsg.value.length >= 50) {
        barcdMsg.value.slice(0, 1)
    }
    barcdMsg.value.push(param)
    if (info == 'error') {
        barcdStatus.value = false
    }
}
function addPkgNumberMsg(type, msg, info) {
    let param = {
        type,
        msg,
        info
    }
    if (pkgNumberMsg.value.length >= 50) {
        pkgNumberMsg.value.slice(0, 1)
    }
    pkgNumberMsg.value.push(param)
    if (info == 'error') {
        pkgNumberStatus.value = false
        printStatus.value = false
    }
}

function transArrayTobarcd(buffer) {

    return buffer
}



//清除报错
const clearError = function () {
    barcd.value = null
    mesValidMsg.value = null
    barcdStatus.value = true
}

//验证操作
const validBarcd = function (barcd) {
    hik.validBarcd(barcd).then(res => {
        let param = JSON.stringify([barcd])
        ipcRenderer.send('mysql-msg', 'updateBarcdValidStatus', param)
        mesValidMsg.value = 'MES校验成功'
        addBarcdMsg('mes', res, 'info')
    }).catch(err => {
        mesValidMsg.value = 'MES校验失败：' + err
        addBarcdMsg('mes', res, 'error')
    })
}

//删除待验证工单
const deleteValidBarcd = function () {
    ipcRenderer.send('mysql-msg', 'deleteBarcd', JSON.stringify(readyValidBarcd.value))
}

const flushData = function () {
    readyValidBarcd.value = []
    getReadyBarcdList()
}

//清空缓存
const clearAll = function () {
    ipcRenderer.send('deleteAllBarcd')
}

//ipcRenderer.on
ipcRenderer.on('queryReadyBarcdList-reply', function (event, arg) {
    readyBarcdList.value = arg
})
ipcRenderer.on('deleteAllBarcd-reply', function (event, arg) {
    if (arg.success) {
        weight.value = null
        pkgNumber.value = null
        pkgNumberStatus = null
    }
    window.$message.error(arg)
})
//数据库异常返回
ipcRenderer.on('updateBarcdValidStatus-reply', function (event, arg) {
    window.$message.error(arg)
})
//数据库异常返回
ipcRenderer.on('updateBarcdPkgStatus-reply', function (event, arg) {
    window.$message.error(arg)
})
ipcRenderer.on('deleteBarcd-reply', function (event, arg) {
    if (arg.success) {
        flushData()
    } else {
        window.$message.error('序列号删除失败')
    }
})





onBeforeUnmount(() => {
    // ipcRenderer.removeAllListeners('queryReadyBarcdList-reply',
    //  'deleteBarcd-reply', 
    //  'updateBarcdPkgStatus-reply',
    //  'updateBarcdValidStatus-reply',
    //  'deleteAllBarcd-reply',
    // //  constant.plcCommand.barcdSign.reply,
    // 'barcdSign_reply',
    //  constant.plcCommand.barcd.reply,
    //  constant.mysql.insertBarcd_reply
    //  )
    ipcRenderer.removeAllListeners()
    clearInterval(catchBarcd)
    clearInterval(catchValidedBarcd)
})
// onDeactivated(() => {
//     ipcRenderer.removeAllListeners('queryReadyBarcdList-reply',
//      'deleteBarcd-reply', 
//      'updateBarcdPkgStatus-reply',
//      'updateBarcdValidStatus-reply',
//      'deleteAllBarcd-reply',
//      constant.plcCommand.barcdSign.reply,
//      constant.plcCommand.barcd.reply,
//      constant.mysql.insertBarcd_reply
//      )
//     clearInterval(catchBarcd)
//     clearInterval(catchValidedBarcd)
// })

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
    overflow-y: scroll;
}
</style>
