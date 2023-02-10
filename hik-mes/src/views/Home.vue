<template>
  <div>
    <head-guider/>
    <router-view/>
  </div>
</template>

<script setup>
import headGuider from '@/components/home/headGuider.vue'

// import snap7 from "node-snap7"

// const {S7Client} = require('s7client');

// var s7client = new snap7.S7Client();
// s7client.ConnectTo('192.168.2.1', 0, 1, function(err) {
//     if(err)
//         return console.log(' >> Connection failed. Code #' + err + ' - ' + s7client.ErrorText(err));

//     // Read the first byte from PLC process outputs...
//     s7client.ABRead(0, 1, function(err, res) {
//         if(err)
//             return console.log(' >> ABRead failed. Code #' + err + ' - ' + s7client.ErrorText(err));

//         // ... and write it to stdout
//         console.log(res)
//     });  
// });

</script>

<style>

</style>