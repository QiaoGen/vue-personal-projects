<template>
  <div class="father">
    <div class="search">
        <div class="search_title">生产数据查询</div>
        <div class="search_bar">
            <n-form  inline>
                <n-form-item label="产品序列号:">
                    <n-input placeholder="请输入产品序列号"></n-input>
                </n-form-item>
                <n-form-item label="集成码:">
                    <n-input placeholder="请输入集成码"></n-input>
                </n-form-item>
                <n-form-item label="日期:">
                    <n-date-picker v-model:value="range" type="daterange" clearable />
                </n-form-item>
            </n-form>
            <n-button circle>
                <template #icon>
                    <n-icon><md-search></md-search></n-icon>
                </template>
            </n-button>
        </div>
    </div>
    <n-data-table
        bordered="true"
        :columns="columns"
        :data="data"
        :pagination="pagination"
    />
  </div>
</template>
<script>
    export default {
        name: 'DataReport'
    }
</script>
<script setup>
import {MdSearch} from '@vicons/ionicons4'
import { ref,reactive } from 'vue'
import dayjs from 'dayjs'

const data = ref([])
const columns = reactive([
    {
        key: 'barcd',
        title: '产品序列号'
    },
    {
        key: 'valid_status',
        title: '验证状态'
    },
    {
        key: 'pkg_number',
        title: '集成码'
    },
    {
        key: 'create_time',
        title: '创建时间'
    },
])

const range = ref([dayjs(new Date()).startOf('d').valueOf(), dayjs(new Date()).endOf('d').valueOf()])

</script>

<style scoped>
.father{
    display: flex;
    flex-direction: column;
}
.search_bar{
    /* border: 1px solid lightgray; */
    border: 1px solid rgb(233, 233, 233);
    padding: 10px 10px 0 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
}
.search_title{
    text-align: left;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

</style>