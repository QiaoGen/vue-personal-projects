<template>
    <div class="father">
        <div class="search">
            <div class="search_title">生产数据查询</div>
            <div class="search_bar">
                <n-form inline>
                    <n-form-item label="产品序列号:">
                        <n-input v-model:value="barcd" placeholder="请输入产品序列号"></n-input>
                    </n-form-item>
                    <n-form-item label="集成码:">
                        <n-input v-model:value="pkgNumber" placeholder="请输入集成码"></n-input>
                    </n-form-item>
                    <n-form-item label="日期:">
                        <n-date-picker v-model:value="range" type="daterange" clearable />
                    </n-form-item>
                </n-form>
                <n-button type="success" @click="search">
                    查询
                    <template #icon>
                        <n-icon><md-search></md-search></n-icon>
                    </template>
                </n-button>
            </div>
        </div>
        <div style="padding:0px 10px;">
            <n-data-table striped bordered="true" :columns="columns" :data="data" :pagination="pagination" />
            <n-pagination class="page" v-model:page="pageNo" :page-count="page.totalPage" simple
                @update:page="changePage" />
        </div>
    </div>
</template>
<script>
export default {
    name: 'DataReport'
}
</script>
<script setup>
import { MdSearch } from '@vicons/ionicons4'
import { ref, reactive, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import { ipcRenderer } from 'electron'
import constant from '@/lib/constant'

const pageNo = ref(1)
const page = ref({
    pageSize: 0,
    totalPage: 0,
    total: 0,
    offset: 0
})
const data = ref([])
const columns = reactive([
    {
        key: 'Barcd',
        title: '产品序列号'
    },
    {
        key: 'ValidStatus',
        title: '验证状态'
    },
    {
        key: 'Aufnr',
        title: '订单号'
    },
    {
        key: 'PkgNumber',
        title: '集成码'
    },
    {
        key: 'CreateTime',
        title: '创建时间'
    },
])

const barcd = ref(null)
const pkgNumber = ref(null)

const range = ref([dayjs(new Date()).startOf('d').valueOf(), dayjs(new Date()).endOf('d').valueOf()])

const search = function () {
    let param = [
        barcd.value,
        pkgNumber.value,
    ]
    if (range.value == null && model.value.barcd == null && model.value.pkgNumber == null) {
        return
    }
    if (range.value != null) {
        param.push(dayjs(range.value[0]).startOf('d').format('YYYY-MM-DD HH:mm:ss'))
        param.push(dayjs(range.value[1]).endOf('d').format('YYYY-MM-DD HH:mm:ss'))
    }
    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.countBarcdList, JSON.stringify(param)).then(res => {
        console.log(res)
        let pageTemp = {
            pageSize: 10,
            totalPage: 0,
            total: res.value[0].total,
            offset: 0
        }
        pageTemp.totalPage = parseInt((pageTemp.total + pageTemp.pageSize - 1) / pageTemp.pageSize)
        page.value = pageTemp
        param.push(page.value.pageSize)
        param.push(page.value.offset)
        ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.searchBarcdList, JSON.stringify(param)).then(arg => {
            console.log(arg)
            if (arg.success && arg.value.length != 0) {
                arg.value.forEach(el => {
                    el.ValidStatus = el.ValidStatus == 1 ? '已校验' : '未校验'
                })
                data.value = arg.value
            }
        }).catch(err => {
            console.error(err)
        })
    })
}

const changePage = function (e) {
    let offset = (e - 1) * page.value.pageSize
    page.value.offset = offset
    let param = [
        barcd.value,
        pkgNumber.value,
    ]
    if (range.value == null && model.value.barcd == null && model.value.pkgNumber == null) {
        return
    }
    if (range.value != null) {
        param.push(dayjs(range.value[0]).startOf('d').format('YYYY-MM-DD HH:mm:ss'))
        param.push(dayjs(range.value[1]).endOf('d').format('YYYY-MM-DD HH:mm:ss'))
    }
    param.push(page.value.pageSize)
    param.push(page.value.offset)
    ipcRenderer.invoke('mysql-msg-invoke', constant.mysql.searchBarcdList, JSON.stringify(param)).then(arg => {
        console.log(arg)
        if (arg.success && arg.value.length != 0) {
            arg.value.forEach(el => {
                el.ValidStatus = el.ValidStatus == 1 ? '已校验' : '未校验'
            })
            data.value = arg.value
        }
    }).catch(err => {
        console.error(err)
    })

}

</script>

<style scoped>
.father {
    display: flex;
    flex-direction: column;
    /* margin: 10px; */
}

.search {
    margin: 10px 10px 0 10px;
}

.search_bar {
    /* border: 1px solid lightgray; */
    border: 1px solid rgb(233, 233, 233);
    padding: 10px 10px 0 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
}

.search_title {
    text-align: left;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.page {
    margin-top: 10px;
}
</style>