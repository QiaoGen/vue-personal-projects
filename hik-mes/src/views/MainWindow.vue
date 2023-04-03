<template>
    <div class="father">
        <div class="card">
            <div class="title">序列号校验</div>
            <div style="padding:10px;">
                <div>产品序列号:</div>
                <div class="result">{{ barcd }}</div>
                <div>MES校验结果:</div>
                <div class="result" style="height: 160px;line-height: 20px;">
                    {{ mesValidMsg }} </div>
                <div style="display: flex;align-items: center;margin-bottom: 10px;">
                    <div>校验标志</div>
                    <div :class="barcdStatus ? 'point_green' : 'point'"></div>
                    <!-- <n-button @click="clearError" v-if="!barcdStatus" style="margin-left: 10px;" type="error">复位</n-button> -->
                </div>
            </div>
            <message-window ref="barcdMsgWindow" class="msg_window"></message-window>
            <!-- {{ msg }} -->

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
                            <!-- <n-button @click="generatePkgNumber" secondary
                                :disabled="readyValidBarcd.length == 0 || readyValidBarcd.length != 100" type="success"
                                style="margin-right: 5px;margin-left: auto;">生成集成码</n-button> -->
                            <n-checkbox
                                :checked="readyValidBarcd.length == readyBarcdList.length && readyBarcdList.length != 0"
                                label="全选" @update:checked="selectAllReadyValidBarcd" style="margin-left: 11px;" />
                            <n-button @click="deleteValidBarcd" secondary :disabled="readyValidBarcd.length == 0"
                                type="error" style="margin-right: 5px;">删除</n-button>
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
            <message-window ref="weightMsgWindow" class="msg_window"></message-window>
            <!-- <n-switch v-model:value="flag"></n-switch> -->
        </div>
    </div>
</template>

<script setup>
import MessageWindow from '@/components/home/MessageWindow.vue'
import { ref, onDeactivated, onBeforeUnmount, getCurrentInstance, computed } from 'vue'
import { ipcRenderer } from 'electron'
import store from '@/store'
import hik from '@/lib/hik'
import constant from '@/lib/constant'
import utils from '@/utils/utils'
import soapClient from '@/lib/soapClient'
// soapClient.sendPkgNumber([{ "Barcd": "Q01801180" },
// { "Barcd": "Q01801181" },
// { "Barcd": "Q01801182" },
// { "Barcd": "Q01801183" },
// { "Barcd": "Q01801184" },
// { "Barcd": "Q01801185" },
// { "Barcd": "Q01801186" },
// { "Barcd": "Q01801187" },
// { "Barcd": "Q01801188" },
// {
//     "Barcd": "Q01801189",
//     "PkgInfo": {
//         "Weigth": 28.1
//     }
// }
// ]).then(res => {
//     console.log(res)
// }).catch(err => {
//     console.error(err)
// })

const { proxy: tthis } = getCurrentInstance()

const workFlag = computed(() => {
    return store.state.workFlag
})
console.log(workFlag.value)

//待验证序列号
const barcd = ref(null)
const pkgNumber = ref(null)//集成码
const mesValidMsg = ref(null)//mes校验结果
//序列号验证状态
const barcdStatus = ref(true)
const pkgNumberStatus = ref(false)
const printStatus = ref(false)

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
    if (!workFlag.value) {
        return
    }
    getReadyBarcdList()
}, 2000);

//获取集成码数据
const getWeight = function () {
    //获取称重数据
    //判断是否满箱（100）=> 获取集成码

    addPkgNumberMsg('plc', '读取称重标识位', 'info')
    ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.weightSign).then(weightSignResult => {
        // ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.weightSign, Buffer.from([1])).then(weightResult => {
        // })
        // ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.weight, getUint8Array(4, function (view) { view.setUint32(0, 2345); })).then(weightResult => {
        // })
        if (!weightSignResult.success) {
            addPkgNumberMsg('plc', weightSignResult.value, 'error')
            return
        }
        if (weightSignResult.value[0] == 0) {
            //标识位为无
            return
        }
        ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.weight).then(weightResult => {
            // console.log(weightResult)
            if (weightResult.success) {
                let weightTemp = utils.getView(weightResult.value).getUint32()
                weight.value = weightTemp / 1000
                //是否满100箱数据
                if (readyBarcdList.value.length >= 100 && weight.value != null) {
                    generatePkgNumber()
                }
                addPkgNumberMsg('plc', '读取称重数据' + weightTemp + 'g', 'info')
                //称重标志位归位
            }
        })
    })
}

const resetWeightSign = function () {
    ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.weightSign, Buffer.from([0])).then(weightResult => {
        addPkgNumberMsg('plc', '称重标志位归位', 'info')
    })
}
const resetWeightSignError = function () {
    ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.pkgNumberError, Buffer.from([1])).then(weightResult => {
        addPkgNumberMsg('mes', 'mes称重错误标志位写入', 'error')
    })
}

//将数值写入到视图中，获得其字节数组，大端字节序
function getUint8Array(len, setNum) {
    var buffer = new ArrayBuffer(len);  //指定字节长度
    setNum(new DataView(buffer));  //根据不同的类型调用不同的函数来写入数值
    return new Uint8Array(buffer); //创建一个字节数组，从缓存中拿取数据
}

const flag = ref(true)
//生成集成码 截取前100条数据
const generatePkgNumber = function () {
    let param = []
    for (let i = 0; i < readyBarcdList.value.length - 1; i++) {
        param.push({ Barcd: readyBarcdList.value[i] })
    }
    param.push({ Barcd: readyBarcdList.value[readyBarcdList.value.length - 1], PkgInfo: { Weigth: weight.value } })
    // hik.getPkgNumber(param).then(res => {
    soapClient.sendPkgNumber(param).then(res => {
        if (res.ErrCode === '700022') {
            resetWeightSignError()
            resetWeightSign()
            window.$message.warning('mes打印服务失效')
            return
        } else if (res.ErrCode === '-1') {//重量校验异常
            resetWeightSignError()
            resetWeightSign()
            window.$message.warning(res.ErrMsg)
            return
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
        addPkgNumberMsg('mes', '获取集成码' + pkgNumber.value, 'info')
        resetWeightSign()



        // if (flag.value) {
        //     resetWeightSign()
        // } else {
        //     resetWeightSignError()
        //     resetWeightSign()
        // }

    }).catch(err => {
        resetWeightSignError()
        resetWeightSign()
        console.error(err)
        window.$message.error('生成集成码失败')
    })
}

// console.log(Buffer.from([1]))


/**
 * 1.获取产品序列号标识位
 * 2.获取产品序列号
 * 3.验证是否错误 -> 写入错误标识位
 * 4.入库
 * 3.验证
 * 4.修改验证状态
 * 
 * 
 */
const catchBarcd = setInterval(() => {
    if (!workFlag.value) {
        return
    }
    catchBarcdFromPLC()
    getWeight()
}, 1000)

const catchBarcdFromPLC = function () {
    if (!barcdStatus.value) {
        return
    }
    addBarcdMsg('plc', '读取Barcd标识位', 'info')
    ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.barcdSign).then((result) => {
        // console.log(result)
        if (!result.success) {
            // console.error('msg:',barcdMsg.value)
            addBarcdMsg('plc', result.value, 'error')
            console.error(result.value)
            return
        }
        if (result.value[0] == 1) {
            addBarcdMsg('plc', '读取Barcd序列号', 'info')
            ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.barcd).then(res => {
                // console.log(res)
                let barcdTemp = utils.transBarcd(res.value)
                if (barcdTemp.length == 0 || barcdTemp == null) {
                    addBarcdMsg('plc', '序列号为空', 'error')
                    plcBarcdSignError()
                    resetBarcdSign()
                } else {
                    barcd.value = barcdTemp
                    addBarcdToDB(barcdTemp)
                }
            })
        }
        // addBarcdToDB('dddfdfdfd')
    })
}

const addBarcdToDB = function (barcdTemp) {
    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.searchBarcdList, JSON.stringify([barcdTemp, null, null, null])).then(res => {
        // console.log(res)
        if (res.success) {
            if (res.value.length != 0) {
                let repeatFlag = false
                res.value.forEach(el => {
                    repeatFlag = el.Deleted != 0 || el.PkgStatus == 0
                })
                //重复
                if (repeatFlag) {
                    addBarcdMsg('plc', '序列号' + barcdTemp + '重复', 'error')
                    plcBarcdSignError()
                    resetBarcdSign()
                }
            } else {
                validBarcd(barcdTemp)
            }
        }
    })

    // ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.insertBarcd, barcdTemp).then(addRes => {
    //     console.log(addRes)
    //     if (addRes.success) {
    //         barcd.value = barcdTemp
    //         //mes校验序列号
    //         validBarcd(barcdTemp)
    //     } else {
    //         if (addRes.msg.toString().indexOf('Duplicate entry') != -1) {
    //             addBarcdMsg('plc', '序列号' + barcdTemp + '重复', 'error')
    //             plcBarcdSignError()
    //             resetBarcdSign()
    //         }
    //     }
    // })
}
//验证操作
const validBarcd = function (barcd) {
    hik.validBarcd(barcd).then(res => {

        // ipcRenderer.send('mysql-msg', 'updateBarcdValidStatus', param)
        mesValidMsg.value = 'MES校验成功'
        ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.insertBarcd, JSON.stringify([barcd])).then(addRes => {
            console.log(addRes)
        })
        resetBarcdSign()
        addBarcdMsg('mes', res, 'info')
    }).catch(err => {
        mesValidMsg.value = 'MES校验失败：' + err
        plcBarcdSignError()
        resetBarcdSign()
        addBarcdMsg('mes', res, 'error')
    })
}

//标志位复位 下次读取Barcd
const resetBarcdSign = function () {
    ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.barcdSign, Buffer.from([0])).then((result) => {
        if (result.success) {
            addBarcdMsg('plc', '标志位复位成功', 'info')
        } else {
            addBarcdMsg('plc', '标志位复位失败', 'error')
        }
    })
}

const msg = ref('1')
const plcBarcdSignError = function () {
    ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.barcdSignError, Buffer.from([1])).then(barcdSignErrRes => {
        // console.log(barcdSignErrRes)
        msg.value = '写入错误标识位成功'
        if (barcdSignErrRes.success) {
            addBarcdMsg('plc', '写入错误标识位成功', 'info')
        } else {
            addBarcdMsg('plc', '写入错误标识位失败', 'error')
        }
    })
}

function addBarcdMsg(type, msg, info) {
    let param = {
        type,
        msg,
        info
    }
    tthis.$refs.barcdMsgWindow.sendMessage(param)
    // if (info == 'error') {
    //     barcdStatus.value = false
    // }
}
function addPkgNumberMsg(type, msg, info) {
    let param = {
        type,
        msg,
        info
    }
    tthis.$refs.weightMsgWindow.sendMessage(param)
    if (info == 'error') {
        pkgNumberStatus.value = false
        printStatus.value = false
    }
}



//清除报错
const clearError = function () {
    barcd.value = null
    mesValidMsg.value = null
    barcdStatus.value = true
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
    /* flex: 1; */
    /* overflow-y: scroll; */
}
</style>
