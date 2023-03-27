<template>
    <!-- <n-scrollbar> -->
    <div class="fater msgWindow" ref="msgWindow" id="msgWindow">
        <div v-for="item in params" :key="item">
            <div :style="item.type == 'plc' ? 'color:green' : ''" v-if="item.info === 'info'">{{ item.type + '-->' +
                item.msg }}
            </div>
            <div style="color:red" v-if="item.info === 'error'">{{ item.type + '-->' + item.msg }}</div>
        </div>
    </div>
    <!-- </n-scrollbar> -->
</template>

<script setup>
import { ref, getCurrentInstance, onUpdated } from "vue";

const { proxy: tthis } = getCurrentInstance()
const params = ref([])

const sendMessage = function (param) {
    if (params.value.length >= 50) {
        params.value.shift()
    }
    params.value.push(param)
}

defineExpose({
    sendMessage
})
onUpdated(() => {
    tthis.$nextTick(() => {
        let divs = document.getElementsByClassName('msgWindow')
        divs[0].scrollTop = divs[0].scrollHeight
        divs[1].scrollTop = divs[1].scrollHeight
        // console.log(tthis.$refs.msgWindow.style)
    })
})
//PLC黄色，mes绿色，错误红色
// const msg = reactive([])

</script>

<style scoped>
.fater {
    background-color: black;
    color: white;
    min-height: 100px;
    border: 1px solid gray;
    text-indent: 5px;
    overflow-y: auto;
    flex: 1;
    flex-direction: column-reverse;
}

.fater::-webkit-scrollbar {
    width: 10px;
}

.fater::-webkit-scrollbar-thumb {
    background: rgba(204, 204, 204, 0.459);
    border-radius: 5px;
}

.fater::-webkit-scrollbar-thumb:hover {
    background: rgb(83, 83, 83);
}
</style>