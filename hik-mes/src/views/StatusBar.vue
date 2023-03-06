<template>
    <div class="father">
        <div class="ips">
            <div v-for="(item) in ips" :key="item">IP:{{item}}</div>
        </div>
        <div class="time">
            <div>CPU:{{CPU}}%</div>
            <n-divider vertical />
            <div>内存:{{ROM}}%</div>
            <n-divider vertical />
            <div>已运行：</div>
            <div>{{day != 0? day+'天':null}}{{hours != 0? hours+'时':null}}{{minutes != 0? minutes+'分':null}}{{seconds != 0? seconds+'秒':null}}</div>
            <n-divider vertical />
            <n-time class="now" :time="time" style=""/>
        </div>
    </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import dayjs from 'dayjs'
var os = require("os");
var osu = require('os-utils')

const time = ref(null)
const day = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const ips = ref([])
const CPU = ref(null)
const ROM = ref(null)

let now = dayjs(new Date())

const getSysInfo = function(){
    let ip = []
    var values = Object.values(os.networkInterfaces())
    values.forEach(e => {
        e.forEach(i => {
            if(i.family == 'IPv4'){
                ip.push(i.address)
            }
        })
    })
    ips.value = ip
    getCpuInfo()
}
const getCpuInfo = function(){
    let mbTotal = ((os.totalmem())/1048576);
    let mbFree = ((os.freemem())/1048576);
    ROM.value = ((mbFree/mbTotal)*100).toFixed(2)
    osu.cpuUsage((v) => {
        CPU.value = (v*100).toFixed(2)
    })
    
}

getSysInfo()

const updateSysInfo = setInterval(() => {
    getCpuInfo()
},10000)

const updateTime = setInterval(()=>{
    time.value = new Date()
    let diffSeconds = dayjs().diff(now, 'seconds')
    seconds.value = dayjs().diff(now, 'seconds')%60
    day.value = Math.floor((diffSeconds) / (86400))
    hours.value = Math.floor((diffSeconds) / (3600))%24
    minutes.value = Math.floor((diffSeconds) / (60))%60
    // .format('HH:mm:ss')
},1000)


onBeforeUnmount(() => {
    clearInterval(updateTime)
    clearInterval(updateSysInfo)
})

</script>

<style scoped>
.father{
    height:100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    overflow: hidden;
    /* border-top: 1px solid rgb(223, 223, 223); */
}
.time{
    font-size: 12px;
    margin-right: 5px;
    margin-left: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
}
.now{
    margin-left: 5px;
}
.ips{
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
    font-size: 12px;
}
.ips>div{
    margin-left: 5px;
}
</style>