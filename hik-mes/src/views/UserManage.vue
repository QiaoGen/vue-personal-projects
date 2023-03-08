<template>
  <div class="father">
    <div class="content" style="padding: 10px;width: 100%;">
      <n-button @click="updateUser" type="success" style="margin-bottom: 10px;">更新用户信息</n-button>
      <n-data-table :columns="columns" :data="data" />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref,h, computed, toRaw } from "vue";
import { NInput } from 'naive-ui'
import { ipcRenderer } from "electron";
import constant from "@/lib/constant";
import store from '@/store'
import route from '@/router'

const role = computed(() => {
  return store.state.role
})
const users = ref([])//原始用户数据

const data = ref([])

const columns = ref([
  {
    title: "用户名",
    key: "name",
    render(row, index) {
      return h(NInput, {
        value: row.name,
        onUpdateValue(v) {
          data.value[index].name = v;
        }
      });
    }
  },{
    title: "登录账号",
    key: "username",
    render(row, index) {
      return h(NInput, {
        value: row.username,
        onUpdateValue(v) {
          data.value[index].username = v;
        }
      });
    }
  },{
    title: "密码",
    key: "password",
    render(row, index) {
      return h(NInput, {
        type: 'password',
        value: row.password,
        onUpdateValue(v) {
          data.value[index].password = v;
        }
      });
    }
  },
])

const getUser = function(){
  ipcRenderer.send('mysql-msg',constant.mysql.queryAllUser)
}
ipcRenderer.on(constant.mysql.queryAllUser_reply,function(event, arg){
  if(arg.success){
    users.value = JSON.parse(JSON.stringify(arg.msg))
    let temp = []
    arg.msg.forEach(el => {
      if(el.role >= role.value){
        temp.push(el)
      }
    })
    data.value = temp
  }
})

getUser()

const updateUser = function(){
  data.value.forEach(e => {
    users.value.forEach(i => {
      if(e.id == i.id){
        if(compare(e,i)){
          
          updateUserSql(e)
        }
      }
    })
  })
}

const updateUserSql = function(user){
  let param = [user.name, user.username, user.password, user.id]
  ipcRenderer.send('mysql-msg',constant.mysql.updateUser,JSON.stringify(param))
}
ipcRenderer.on(constant.mysql.updateUser_reply,function(event, arg){
  if(arg.success){
    window.$message.success('更新成功,即将跳转登陆页面重新登陆')
    setTimeout(() => {
      route.replace('/login')
    }, 1500);
  }else{
      window.$message.error('更新失败,请检查用户名是否重复')
      getUser()
  }
})

const compare = function(e, i){
  return e.name != i.name || e.password != i.password || e.username != i.username
}

onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners(constant.mysql.queryAllUser_reply, constant.mysql.updateUser_reply)
})

</script>

<style socped>
.father {
  width: 100%;
  height: 100%;
}
.content{
  display: flex;
  flex-direction: column;
}
</style>