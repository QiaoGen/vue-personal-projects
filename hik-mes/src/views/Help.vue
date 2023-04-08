<template>
    <div class="father">
        <!-- 包括软件版本信息、当前软件运维人员联系方式、软件使用说明、问题排查指导等功能 -->
        <n-collapse class="collapse">
            <n-collapse-item title="软件使用说明" name="1">
                <div class="use_info">
                    <div v-for="(item, index) in helpContent" :key="index">
                        <img :src="item.imgUrl" alt="">
                        <div v-for="(item1, index1) in item.content" :key="index1">{{ index1 + 1 }}.{{ item1 }}</div>
                    </div>
                </div>
            </n-collapse-item>
            <n-collapse-item title="问题排查指导" name="2">
                <div>问题排查指导</div>
            </n-collapse-item>
            <n-collapse-item title="运维人员联系方式" name="3">
                <div>...</div>
            </n-collapse-item>
            <n-collapse-item title="版本信息" name="4">
                <div>海康烟感包装线v1.0</div>
            </n-collapse-item>
        </n-collapse>
    </div>
    <!-- </div> -->
</template>

<script setup>
import { ref } from "vue";


const helpContent = ref([
    {
        imgUrl: require('@/assets/Snipaste_2023-03-09_13-44-52.png'),
        content: [
            '页面主体分为三大块：菜单，状态栏，显示内容',
            '点击不同菜单，内容页面会显示相应的操作页面',
            '状态栏显示本机网卡IPv4地址，软件运行时间'
        ]
    }, {
        imgUrl: require('@/assets/mainWindow.png'),
        content: [
            '主界面提供序列号校验，集成码获取，打印主要流程',
            '序列号校验出现错误，需手动清除报错信息，才能执行下一次校验流程',
            '集成码打印支持待集成序列号删除操作，装箱数量未100时自动向mes获取集成码',
            '集成码标识/打印标识为绿灯，即可执行打印流程',
        ]
    }, {
        imgUrl: require('@/assets/systemManage.png'),
        content: [
            '系统初次使用，必须正确配置打印IP/端口、MES扫描站点、设备编号',
        ]
    }, {
        imgUrl: require('@/assets/dataReport.png'),
        content: [
            '生产数据查询支持近三个月序列号信息',
        ]
    }, {
        imgUrl: require('@/assets/userManage.png'),
        content: [
            '权限高的用户可以编辑相同权限或权限以下的用户信息，修改后保存即可生效',
        ]
    }, {
        imgUrl: require('@/assets/log.png'),
        content: [
            '管理员/测试 可查看所有日志信息，其中包含PLC收发记录，mes交互记录等重要数据',
        ]
    }
])

</script>

<style scoped>
.father {
    width: 100%;
    height: 100%;
    margin-top: 16px;
}

.collapse {
    width: 100%;
}

.use_info {
    display: flex;
    flex-direction: column;
}

.use_info>div {
    margin-bottom: 20px;
    overflow: hidden;
    border: 1px solid rgb(233, 233, 233);
    text-align: left;
}

.use_info img {
    width: 800px;
    border: 1px solid rgb(233, 233, 233);
}</style>