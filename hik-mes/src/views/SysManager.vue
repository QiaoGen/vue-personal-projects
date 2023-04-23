<template>
    <div class="father">
        <n-form class="form" ref="formRef" :model="model" :rules="rules" label-placement="left">
            <n-form-item path="PLCIP" label="PLC IP地址">
                <n-input v-model:value="model.PLCIP" placeholder="0.0.0.0-255.255.255.255"></n-input>
            </n-form-item>
            <n-form-item path="ip" label="打印机 IP地址">
                <n-input v-model:value="model.ip" placeholder="0.0.0.0-255.255.255.255"></n-input>
            </n-form-item>
            <n-form-item path="port" label="打印机 端口">
                <n-input v-model:value="model.port" placeholder="1-65535"></n-input>
            </n-form-item>
            <n-form-item path="WorkStation" label="MES 扫描站点">
                <n-input v-model:value="model.WorkStation" placeholder=""></n-input>
            </n-form-item>
            <n-form-item path="MachineId" label="设备编号">
                <n-input v-model:value="model.MachineId" placeholder=""></n-input>
            </n-form-item>
            <div style="display: flex; justify-content: flex-start">
                <n-button round :disabled="model.WorkStation === null || model.MachineId === null" type="primary"
                    @click="handleValidateButtonClick">
                    提交
                </n-button>


            </div>

        </n-form>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { ipcRenderer } from 'electron'
import store from '@/store'
import constant from '@/lib/constant'
const formRef = ref(null)

const model = ref({
    WorkStation: null,
    MachineId: null,
    ip: null,
    port: null,
    PLCIP: null
})
const rules = reactive({
    WorkStation: {
        required: true,
        message: "请输入扫描站点",
        trigger: ["blur"]
    },
    MachineId: {
        required: true,
        message: "请输入设备编号",
        trigger: ["blur"]
    },
    ip: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if (!value) {
                return new Error("请输入IP地址")
            } else if (!/^(([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])$/.test(value)) {
                return new Error("请输入正确格式")
            }
            return true
        }
    },
    PLCIP: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if (!value) {
                return new Error("请输入IP地址")
            } else if (!/^(([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])$/.test(value)) {
                return new Error("请输入正确格式")
            }
            return true
        }
    },
    port: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if (!value) {
                return new Error("请输入端口")
            } else if (Number(value) <= 0 || Number(value) > 65536) {
                return new Error("端口取值范围（1～65535）")
            }
            return true
        }
    },
})

const handleValidateButtonClick = function (e) {
    e.preventDefault();
    formRef.value?.validate((errors) => {
        if (!errors) {
            window.$message.success("配置成功");
            ipcRenderer.send('mysql-msg', 'updateSysConfig', JSON.stringify(model.value))
            store.commit('updateSysConfig', model.value)
        } else {
            console.log(errors);
            window.$message.error("配置失败");
        }
    });
}

//获取系统信息
const getSysInfo = function () {
    ipcRenderer.send('mysql-msg', 'querySysConfig')
}
ipcRenderer.once('querySysConfig-reply', function (event, arg) {
    let sysConfig = JSON.parse(arg)[0]
    console.log(sysConfig)
    model.value = {
        WorkStation: sysConfig.WorkStation,
        MachineId: sysConfig.MachineId,
        ip: sysConfig.PrintIP,
        port: sysConfig.PrintPort,
        PLCIP: sysConfig.PLCIP
    }
    store.commit('updateSysConfig', model.value)
})
getSysInfo()
</script>

<style socped>
.father {
    /* margin: 20px; */
}

.form {
    margin: 10px;
    width: 100%;
}
</style>