<template>
  <div>
    <div v-for="(item,index) in serialportPaths" :key="index">
      <a href="#" @click="open(item)">{{item}}</a>
      <n-divider />
    </div>
  </div>
</template>

<script setup>
import serialport from '@/hook/serialport'
import { ref } from 'vue'
const serialportPaths = ref([])
serialport.listSerialport().then(res => serialportPaths.value = res)

const open = function(path){
  serialport.openSerialport(path)
}

</script>
