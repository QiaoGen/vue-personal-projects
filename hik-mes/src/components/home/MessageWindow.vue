<template>
    <div class="fater">
        <div v-for="item in params.msg" :key="item">
            <div :style="item.type == 'plc'? 'color:green':''" v-if="item.info === 'info'">{{item.type +'-->'+item.msg}}</div>
            <div style="color:red" v-if="item.info === 'error'">{{item.type +'-->'+item.msg}}</div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from "vue";

const params = defineProps({
    msg:{
        type: Array,
        default: ['232232','232323d']
    }
})

//PLC黄色，mes绿色，错误红色
// const msg = reactive([])

</script>

<style scoped>
.fater{
    background-color: black;
    color: white;
    min-height: 100px;
    border: 1px solid gray;
    text-indent: 5px;
}

</style>