<template>
  <div class="log_f">
    <div class="log_list">
      <div class="list_title">日志列表</div>
      <div class="log_item" style="cursor: pointer;" @click="selectFile(item)" v-for="(item, index) in fileList">{{ item
      }}
      </div>
    </div>
    <!-- <div>{{content}}</div> -->
    <textarea
      style="width: 100%;height:100%;border: none;padding: 10px;resize:none;border: none;resize: none;width: 100%;overflow: auto;word-break: break-all;"
      readonly>{{ content }}</textarea>
  </div>
</template>

<script setup>
import { ipcRenderer } from 'electron'
import { onBeforeUnmount, ref } from 'vue'

const fileList = ref([])
const content = ref(null)

const getFileList = function () {
  ipcRenderer.send('logFile-msg', 'getLogFileList')
}

ipcRenderer.on('getLogFileList-reply', function (event, arg) {
  fileList.value = arg
  if (fileList.value.length > 0) {
    readFile(fileList.value[fileList.value.length - 1])
  }
})

//读取文件内容
const readFile = function (fileName) {
  ipcRenderer.send('logFile-msg', 'readFile', fileName)
}
ipcRenderer.on('readFile-reply', function (event, arg) {
  console.log(arg)
  content.value = arg
})

const selectFile = function (fileName) {
  readFile(fileName)
}

getFileList()

// 移除监听器
onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners(['getLogFileList-reply', 'readFile-reply'])
  console.log('onMounted')
})

</script>

<style scoped>
.log_f {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.log_list {
  padding: 10px;
  width: 150px;
  border-right: 1px solid rgb(239, 239, 245);
}

.list_title {
  font-weight: bold;
  border-bottom: 1px solid rgb(239, 239, 245);
}

.log_item {
  cursor: pointer;
}

.log_item:hover {
  background-color: rgba(230, 230, 230, 0.713);
}
</style>