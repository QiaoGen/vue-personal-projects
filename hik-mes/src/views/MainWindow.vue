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
                        <!-- <n-button type="success">打印</n-button> -->
                        <n-popconfirm positive-text="确认" negative-text="取消" @positive-click="clearAll">
                            <template #trigger>
                                <n-button type="error">清空缓存</n-button>
                            </template>
                            清空缓存将清除数据库以及页面所有数据，确认是否清除？
                        </n-popconfirm>

                        <n-button @click="reprint" dashed type="success" style="margin-left:5px">重新打印</n-button>
                    </div>
                    <div style="display: flex;align-items: center;margin-bottom: 10px;">
                        <div>集成码标志</div>
                        <div :class="pkgNumberStatus ? 'point_green' : 'point'"></div>
                        <div style="margin-left: 20px;">打印标志</div>
                        <div :class="tcpStatus ? 'point_green' : 'point'"></div>
                    </div>
                </div>
                <div class="barch_f">
                    <div class="card_head">
                        <div style="margin: 0 0 5px auto;">
                            <!-- <n-button @click="generatePkgNumber" secondary
                                :disabled="readyValidBarcd.length == 0 || readyValidBarcd.length != 100" type="success"
                                style="margin-right: 5px;margin-left: auto;">生成集成码</n-button> -->
                            <n-checkbox
                                :checked="readyValidBarcd.length == readyBarcdList.length && readyBarcdList.length != 0"
                                label="全选" @update:checked="selectAllReadyValidBarcd" style="margin-left: 11px;" />
                            <n-button size="small" @click="deleteValidBarcd" secondary
                                :disabled="readyValidBarcd.length == 0" type="error"
                                style="margin-left: auto;margin-right: 0;">删除</n-button>
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

        <n-modal v-model:show="showModal">
            <n-card style="width: 700px" title="标签重打" :bordered="false" size="huge" role="dialog" aria-modal="true">
                <template #header-extra>
                    <n-button type="success" size="small" :disabled="checkedRowKeysRef.length == 0"
                        @click="reprintActive">打印</n-button>
                </template>
                <n-data-table v-model:checked-row-keys="checkedRowKeysRef" :columns="columns" :data="pkgData" />
            </n-card>
        </n-modal>

        <n-modal close-on-esc="false" style="width: 550px;" :show="showModalBox">
            <n-card style="width: 600px" title="投盒机" size="huge" :bordered="false" role="dialog" aria-modal="true">
                确保生产过程正常进行，请维护投盒机「订单号」对应「标签数量」
                <template #footer>
                    <n-button type="success" size="small" @click="skipSendBox">
                        去配置
                    </n-button>
                </template>
            </n-card>
        </n-modal>
    </div>
</template>

<script setup>
import MessageWindow from '@/components/home/MessageWindow.vue'
import { ref, onDeactivated, onBeforeUnmount, getCurrentInstance, computed } from 'vue'
import { ipcRenderer } from 'electron'
import store from '@/store'
import constant from '@/lib/constant'
import utils from '@/utils/utils'
import soapClient from '@/lib/soapClient'
import hik from '@/lib/hik'
import route from '@/router'
import { Mutex } from 'async-mutex'

const showModalBox = ref(true)
const show = ref(false)
const showModal = ref(false)
const printPkgNumber = ref(null)
const pkgData = ref([])
const checkedRowKeysRef = ref([])
const columns = ref([
    {
        type: "selection",
        multiple: false,
    },
    {
        title: "包装号",
        key: "PkgNumber"
    },
    {
        title: "订单号",
        key: "Aufnr"
    },
    {
        title: "打印状态",
        key: "PrintStatus"
    }, {
        title: "创建时间",
        key: "CreateTime"
    },
])

const { proxy: tthis } = getCurrentInstance()

const workFlag = computed(() => {
    return store.state.workFlag
})
const plcStatus = computed(() => {
    return store.state.plcStatus
})
const mesStatus = computed(() => {
    return store.state.mesStatus
})
const tcpStatus = computed(() => {
    return store.state.tcpStatus
})
// console.log(workFlag.value)

//待验证序列号
const barcd = ref(null)
const pkgNumber = ref(null)//集成码
const mesValidMsg = ref(null)//mes校验结果
//序列号验证状态
const barcdStatus = ref(true)
const pkgNumberStatus = ref(false)


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
const mutexBarcd = new Mutex()
const mutexWeight = new Mutex()
const mutexPkgnumber = new Mutex()
const catchBarcd = setInterval(() => {
    if (!workFlag.value || !plcStatus.value || !mesStatus.value || !tcpStatus.value) {
        return
    }
    mutexBarcd.acquire()
        .then(function (release) {
            catchBarcdFromPLC().then(res =>
                release()
            ).catch(err => {
                release()
            })
        });
    mutexWeight.acquire()
        .then(function (release) {
            getWeight().then(res =>
                release()
            ).catch(err => {
                release()
            })
        });
}, 1000)

//获取已验证序列号
const catchValidedBarcd = setInterval(() => {
    if (!workFlag.value) {
        return
    }
    getReadyBarcdList()
    if (mesStatus.value == false || tcpStatus.value == false) {
        return
    }
    mutexPkgnumber.acquire()
        .then(function (release) {
            generatePkgNumber().then(res =>
                release()
            ).catch(err => {
                release()
            })
        });
}, 2000);

// const getWeightFlag = ref(false)
//获取集成码数据
const getWeight = function () {
    //获取称重数据
    //判断是否满箱（100）=> 获取集成码
    return new Promise((reslove, reject) => {
        addPkgNumberMsg('plc', '读取称重标识位', 'info')
        ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.weightSign).then(weightSignResult => {
            // ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.weightSign, Buffer.from([1])).then(weightResult => {
            // })
            // ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.weight, getUint8Array(4, function (view) { view.setUint32(0, 2345); })).then(weightResult => {
            // })
            if (!weightSignResult.success) {
                addPkgNumberMsg('plc', '读取称重标识位失败', 'error')
                resetWeightSignError()
                reject(false)
                return
            }
            if (weightSignResult.value[0] == 0) {
                //标识位为无
                reject(false)
                return
            }
            ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.weight).then(weightResult => {
                // console.log(weightResult)
                if (weightResult.success) {
                    let weightTemp = utils.getView(weightResult.value).getUint32()
                    weight.value = weightTemp / 1000
                    addPkgNumberMsg('plc', '读取称重数据:' + weightTemp + 'g', 'info')
                    //称重标志位归位
                    resetWeightSign()
                    reslove(true)
                    return
                }
                reject(false)
                return
            }).catch(err => {
                reject(false)
                return
            })
        }).catch(err => {
            reject(false)
            return
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

//包装运行状态界定,循环中只能进入一次
const runFlag = ref(false)
//生成集成码 截取前100条数据
const generatePkgNumber = function () {
    return new Promise((reslove, reject) => {
        // //是否满100箱数据 //数量 >= 100 判断是否有重量 
        if (runFlag.value || readyBarcdList.value.length < 100 || weight.value == null) {
            reject(false)
            return
        }
        runFlag.value = true
        pkgNumberStatus.value = true
        ipcRenderer.send('log-msg-info', 'comming---------------package')
        let param = []
        let tempList = JSON.parse(JSON.stringify(readyBarcdList.value))
        if (tempList.length > 100) {
            tempList = tempList.slice(0, 100)
        }
        for (let i = 0; i < tempList.length - 1; i++) {
            param.push({ Barcd: tempList[i].Barcd })
        }
        param.push({ Barcd: tempList[tempList.length - 1].Barcd, PkgInfo: { Weigth: weight.value } })
        ipcRenderer.send('log-msg-info', 'param pkg:' + JSON.stringify(param))
        soapClient.sendPkgNumber(param).then(res => {
            //投盒数量查询 未查询到数据继续走流程 投盒机报警
            ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.querySendBoxByAufnr, JSON.stringify([tempList[0].Aufnr])).then(res => {
                console.log('send box match num:', res.value)
                if (res.value.length == 0) {
                    ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.sendBox, Buffer.from([0, 0])).then(res => {
                        addPkgNumberMsg('mes', '未查询到投盒机匹配订单号:' + tempList[0].Aufnr, 'error')
                    })
                } else {
                    let num = res.value[0].Num
                    ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.sendBox, utils.getInt16Bytes(num)).then(res => {
                        addPkgNumberMsg('mes', '投盒机匹配订单号:' + tempList[0].Aufnr + ' 数量：' + num, 'info')
                    })
                }
            }).catch(err => {
                console.error(err)
                ipcRenderer.send('log-msg-info', 'sendBox match err' + JSON.stringify(err))
            })

            ipcRenderer.send('log-msg-info', 'pkgNumber result: ' + res.toString())
            pkgNumber.value = res.Data.PkgNumber
            //Barcd绑定PkgNumber，PkgStatus=1, 插入pkg_number_list
            let sqlparam = []
            sqlparam.push(pkgNumber.value)
            tempList.forEach(e => {
                sqlparam.push(e.Barcd)
            })
            ipcRenderer.send('mysql-msg', 'insertPkgNumber', JSON.stringify([pkgNumber.value, tempList[0].Aufnr]))
            ipcRenderer.send('mysql-msg', 'updateBarcdPkgStatus', JSON.stringify(sqlparam))
            addPkgNumberMsg('mes', '获取集成码:' + pkgNumber.value, 'info')
            addPkgNumberMsg('mes', '打印集成码准备:' + pkgNumber.value, 'info')
            ipcRenderer.send('log-msg-info', 'ready to print: ')
            readyToPrint(tempList[0].Aufnr, pkgNumber.value).then(res => {
                reslove(res)
                return
            }).catch(err => {
                reject(err)
                return
            })
        }).catch(err => {
            ipcRenderer.send('log-msg-info', 'pkgNumber err result: ' + err.ErrMsg + JSON.stringify(err))
            addPkgNumberMsg('mes', '获取集成码失败:' + err.ErrMsg, 'error')
            resetWeightSignError()
            endPkgNumberTask()
            reject(false)
            return
            // console.error(err)
            // window.$message.error(err.ErrMsg)
        })
    })
}

//打印完成 清空pkgNumber/weight 数据已经入库
// {
// "Barcd":"Q00726201",
// "Result":"OK"
// }
// todo tcpServer未能及时返回数据?
const readyToPrint = function (Aufnr, PkgNumber) {
    return new Promise((reslove, reject) => {
        ipcRenderer.send('log-msg-info', 'print: ' + Aufnr + ' ' + PkgNumber)
        hik.sendToPrint(Aufnr, PkgNumber).then(res => {
            console.log(res)
            ipcRenderer.send('log-msg-info', 'receive printer response:' + res)
            if (res.success) {
                let resp = JSON.parse(res.value.toString())
                if (resp.Result == 'OK') {
                    addPkgNumberMsg('mes', '打印成功', 'info')
                    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.updatePkgNumberPrintStatus, JSON.stringify([PkgNumber, Aufnr])).then(res => {
                    }).catch(err => {
                    })
                    endPkgNumberTask()
                    reslove(true)
                    return
                } else {
                    //需要人工干预
                    addPkgNumberMsg('mes', '打印失败:' + resp.Result + ' 序列号:' + resp.Barcd, 'error')
                    resetWeightSignError()
                    endPkgNumberTask()
                    reslove(true)
                    return
                }
            } else if (res.success == false) {
                //返回错误数据
                let errStr = 'print Aufnr: ' + Aufnr + ' PkgNumber:' + PkgNumber + ' fail'
                ipcRenderer.send('log-msg-info', errStr + JSON.stringify(res))
                addPkgNumberMsg('mes', '打印标签失败: 订单号:' + Aufnr + ' 包装号:' + PkgNumber + '失败，详细错误信息:' + JSON.stringify(res), 'error')
                resetWeightSignError()
            } else {
                // 超时返回 放行
                addPkgNumberMsg('mes', '打印成功', 'info')
                ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.updatePkgNumberPrintStatus, JSON.stringify([PkgNumber, Aufnr])).then(res => {
                }).catch(err => {
                })
            }
            endPkgNumberTask()
            reject(false)
            return
        }).catch(err => {
            let errStr = 'print Aufnr: ' + Aufnr + ' PkgNumber:' + PkgNumber + ' fail'
            ipcRenderer.send('log-msg-info', errStr + err)
            addPkgNumberMsg('mes', '打印标签异常: 订单号:' + Aufnr + ' 包装号:' + PkgNumber + '失败，详细错误信息:' + JSON.stringify(err), 'error')
            resetWeightSignError()
            endPkgNumberTask()
            reject(false)
            return
        })
    })
}

const endPkgNumberTask = function () {
    runFlag.value = false
    weight.value = null
    pkgNumberStatus.value = false
    pkgNumber.value = null
    ipcRenderer.send('log-msg-info', 'exit---------------package')
}

//重新打印
const reprint = function () {
    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.queryPkgNumberLimit).then(res => {
        if (res.value.length == 0) {
            window.$message.info('暂无集成码数据')
            return
        }
        checkedRowKeysRef.value = []
        showModal.value = true
        let resData = []
        res.value.forEach(e => {
            let data = {
                PkgNumber: e.PkgNumber,
                Aufnr: e.Aufnr,
                CreateTime: e.CreateTime,
                PrintStatus: e.PrintStatus == 0 ? '未打印' : '已打印',
                key: e.Id
            }
            resData.push(data)
        })
        pkgData.value = resData
    }).catch(err => {
        window.$message.error('获取集成码失败')
        console.error(err)
    })
}

const reprintActive = function () {
    let selectPkg = null
    for (let i = 0; i < pkgData.value.length; i++) {
        if (checkedRowKeysRef.value[0] == pkgData.value[i].key) {
            selectPkg = pkgData.value[i]
            break;
        }
    }
    // readyToPrint(selectPkg.Aufnr, selectPkg.PkgNumber)
    addPkgNumberMsg('mes', '重新打印：' + selectPkg.PkgNumber + ' ' + selectPkg.Aufnr, 'info')
    let PkgNumber = selectPkg.PkgNumber
    let Aufnr = selectPkg.Aufnr
    if (tcpStatus.value == false) {
        window.$message.error("当前打印服务已断开,检查连接之后再执行")
        return
    }
    hik.sendToPrint(Aufnr, PkgNumber).then(res => {
        console.log('reprint res:' + res)
        let msg = res.value != "" ? Buffer.from(res.value).toString() : '未返回打印结果'
        addPkgNumberMsg('mes', msg, 'info')
        ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.updatePkgNumberPrintStatus, JSON.stringify([PkgNumber, Aufnr])).then(res => {
        }).catch(err => {
        })
    })
    showModal.value = false
}


const catchBarcdFromPLC = function () {
    return new Promise((reslove, reject) => {
        addBarcdMsg('plc', '读取Barcd标识位', 'info')
        ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.barcdSign).then((result) => {
            // console.log(result)
            if (!result.success) {
                // console.error('msg:',barcdMsg.value)
                addBarcdMsg('plc', result.value, 'error')
                console.error(result.value)
                reject(false)
                return
            }
            if (result.value[0] == 1) {
                addBarcdMsg('plc', '读取Barcd序列号', 'info')
                ipcRenderer.invoke('plc-msg-invoke', 'read', constant.plcCommand.barcd).then(res => {
                    // console.log(res)
                    let barcdTemp = utils.transBarcd(res.value)
                    if (barcdTemp.length == 0 || barcdTemp == null) {
                        addBarcdMsg('plc', '序列号为空,请重新扫描', 'error')
                        plcBarcdSignError()
                        resetBarcdSign()
                        reject(false)
                        return
                    } else {
                        barcd.value = barcdTemp
                        addBarcdToDB(barcdTemp).then(res => {
                            reslove(res)
                            return
                        }).catch(err => {
                            reject(err)
                            return
                        })
                    }
                })
            } else {
                reject(false)
                return
            }
        }).catch(err => {
            reject(false)
            return
        })
    })

}

//入库前判断是否重复
const addBarcdToDB = function (barcdTemp) {
    return new Promise((reslove, reject) => {
        ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.searchBarcdList, JSON.stringify([barcdTemp, null, null, null, null, null])).then(res => {
            // console.log(res)
            if (!res.success) {
                addBarcdMsg('sql', '数据库错误', 'error')
                plcBarcdSignError()
                resetBarcdSign()
                reject(false)
                return
            }
            if (res.value.length != 0) {
                let repeatFlag = false
                res.value.forEach(el => {
                    if (el.Deleted != 0 || el.PkgStatus == 0) {
                        repeatFlag = true
                    }
                })
                //重复
                if (repeatFlag) {
                    addBarcdMsg('plc', '序列号' + barcdTemp + '重复', 'error')
                    plcBarcdSignError()
                    resetBarcdSign()
                    reject(false)
                    return
                } else {
                    validBarcd(barcdTemp).then(res => {
                        reslove(res)
                        return
                    }).catch(err => {
                        reject(err)
                        return
                    })
                }
            } else {
                validBarcd(barcdTemp).then(res => {
                    reslove(res)
                    return
                }).catch(err => {
                    reject(err)
                    return
                })
            }
        }).catch(err => {
            reject(false)
            return
        })
    })
}
//验证操作 /是否切单
const validBarcd = function (barcd) {
    return new Promise((reslove, reject) => {
        soapClient.valid(barcd).then(res => {
            // ipcRenderer.send('mysql-msg', 'updateBarcdValidStatus', param)
            mesValidMsg.value = '校验序列号:' + barcd + ":" + res.ErrMsg
            let aufnr = res.Data.Aufnr
            if (readyBarcdList.value.length > 0) {
                if (readyBarcdList.value[0].Aufnr != aufnr) {
                    plcBarcdSignError()
                    resetBarcdSign()
                    addBarcdMsg('mes', '序列号:' + barcd + ',订单号:' + aufnr + ' 与订单号:' + readyBarcdList.value[0] + ' 存在切单,请手动处理', 'error')
                    reject(false)
                    return
                }
            }
            ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.insertBarcd, JSON.stringify([barcd, aufnr])).then(addRes => {
            })
            resetBarcdSign()
            barcdStatus.value = true
            addBarcdMsg('mes', '订单号：' + aufnr + ' 序列号:' + barcd + ' ' + res.ErrMsg, 'info')
            reslove(true)
            return
        }).catch(err => {
            mesValidMsg.value = 'MES校验失败：' + err.ErrMsg + " Code:" + err.ErrCode
            plcBarcdSignError()
            resetBarcdSign()
            addBarcdMsg('mes', err.ErrMsg, 'error')
            reject(false)
            return
        })
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

const plcBarcdSignError = function () {
    ipcRenderer.invoke('plc-msg-invoke', 'write', constant.plcCommand.barcdSignError, Buffer.from([1])).then(barcdSignErrRes => {
        // console.log(barcdSignErrRes)
        if (barcdSignErrRes.success) {
            addBarcdMsg('plc', '写入错误标识位成功', 'info')
        } else {
            addBarcdMsg('plc', '写入错误标识位失败', 'error')
        }
    })
}

//去除重复打印信息
var lastBarcdMsg = null
var lastPkgdMsg = null
function addBarcdMsg(type, msg, info) {
    let param = {
        type,
        msg,
        info
    }
    if (msg != lastBarcdMsg) {
        // console.log(msg != lastBarcdMsg, msg, lastBarcdMsg)
        tthis.$refs.barcdMsgWindow.sendMessage(param)
    }
    lastBarcdMsg = msg
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
    if (msg != lastPkgdMsg) {
        tthis.$refs.weightMsgWindow.sendMessage(param)
    }
    lastPkgdMsg = msg
    if (info == 'error') {
        pkgNumberStatus.value = false
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
    show.value = false
    ipcRenderer.send('mysql-msg', 'deleteAllBarcd')
    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.deleteAllPkgNumber).then(res => {
    }).catch(err => {
    })
}

//ipcRenderer.on
ipcRenderer.on('queryReadyBarcdList-reply', function (event, arg) {
    readyBarcdList.value = arg
})
ipcRenderer.on('deleteAllBarcd-reply', function (event, arg) {
    if (arg.success) {
        weight.value = null
        pkgNumber.value = null
        pkgNumberStatus.value = null
        window.$message.info('清除成功')
    } else {
        window.$message.error('清除失败')
    }

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

//额外操作
const skipSendBox = function () {
    showModalBox.value = false
    route.replace('/SendBox')
}

onBeforeUnmount(() => {
    ipcRenderer.removeAllListeners()
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
    /* flex: 1; */
    /* overflow-y: scroll; */
}
</style>
