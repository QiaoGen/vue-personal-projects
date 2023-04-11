<template>
    <div class="father">
        <div class="operate_bar">
            <n-form ref="formRef" :model="model" :rules="rules" inline>
                <n-form-item path="Aufnr" label="订单号:">
                    <n-input v-model:value="model.Aufnr" placeholder="请输入订单号"></n-input>
                </n-form-item>
                <n-form-item path="Num" label="投盒数量:">
                    <n-input-number :min="1" :max="10" v-model:value="model.Num" placeholder="1~10"></n-input-number>
                </n-form-item>
            </n-form>
            <n-button type="success" @click="handleValidateButtonClick">
                添加与更新
                <template #icon>
                    <n-icon>
                        <Add20Filled />
                    </n-icon>
                </template>
            </n-button>
        </div>

        <div class="content">
            <n-data-table :columns="columns" :data="data"></n-data-table>
            <n-pagination class="page" v-model:page="pageNo" :page-count="page.totalPage" simple
                @update:page="changePage" />
        </div>
    </div>
</template>

<script setup>
import { Add20Filled } from '@vicons/fluent'
import { ref, reactive } from 'vue'
import constant from '@/lib/constant';
import { ipcRenderer } from 'electron';
import utils from '@/utils/utils';

const data = ref([])
const formRef = ref(null)
const pageNo = ref(1)
const page = ref({
    pageSize: 10,
    totalPage: 0,
    total: 0,
    offset: 0
})
const model = ref({
    Aufnr: null,
    Num: 1
})
const columns = reactive([
    { key: 'Aufnr', title: '订单号' },
    { key: 'Num', title: '投放数量' },
    { key: 'CreateTime', title: '创建时间' },
])
const rules = reactive({
    Aufnr: {
        required: true,
        message: "请输入订单号",
        trigger: ["blur"]
    },
    Num: {
        required: true,
        message: "请输入1~10之间的数字",
    }
})

const handleValidateButtonClick = function (e) {
    e.preventDefault();
    formRef.value?.validate((errors) => {
        if (!errors) {
            ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.insertAndUpdateSendBox, JSON.stringify([model.value.Aufnr, model.value.Num])).then(res => {
                window.$message.success("配置成功");
                pageNo.value = 1
                changePage(1)
            }).catch(err => {
                console.error(err)
            })
        } else {
            // window.$message.error("新增失败");
        }
    });
}

const initConfigPage = function () {
    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.countSendBox).then(res => {
        let pageTemp = {
            pageSize: 15,
            totalPage: 0,
            total: res.value[0].total,
            offset: 0
        }
        pageTemp.totalPage = parseInt((pageTemp.total + pageTemp.pageSize - 1) / pageTemp.pageSize)
        page.value = pageTemp
        console.log('count:', pageTemp)
        changePage(1)
    })
}

const getSendBox = function (limit, offset) {
    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.querySendBox, JSON.stringify([limit, offset])).then(res => {
        data.value = res.value
    })
}

initConfigPage()
const changePage = function (e) {
    let offset = (e - 1) * page.value.pageSize
    page.value.offset = offset
    console.log('page:', page.value)
    getSendBox(page.value.pageSize, offset)
}




</script>

<style scoped>
.father {
    /* padding: 10px; */
    display: flex;
    flex-direction: column;
}

.operate_bar {
    border: 1px solid rgb(233, 233, 233);
    padding: 10px 10px 0 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin: 10px;
}

.page {
    margin-top: 10px;
}

.content {
    margin: 10px;
}
</style>