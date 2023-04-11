<template>
  <n-layout has-sider class="menu">
    <!-- <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed" show-trigger
      @collapse="collapsed = true" @expand="collapsed = false"> -->
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="190" :collapsed="collapsed"
      @collapse="collapsed = true" @expand="collapsed = false">
      <div style="height: 100%;display: flex; flex-direction: column; justify-content: flex-start;">
        <div class="user">
          <div class="head_img" :style="{ backgroundImage: `url(${imgUrl})` }"></div>
          <div>{{ name }}</div>
        </div>
        <n-menu accordion v-model:value="activeKey" :root-indent="36" :indent="12" :options="menuOptions"
          @update:value="selectMenu" :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22" />
        <n-button type="error" v-if="!plcStatus" @click="reconnectPLC" class="err_btn"
          :loading="plcLoading">重连PLC</n-button>
        <n-button type="error" v-if="!tcpStatus" @click="reconnectPrintServer" class="err_btn"
          :loading="tcpLoading">重连打印机</n-button>
        <n-button type="error" v-if="!mesStatus" @click="reConnectMes" class="err_btn"
          :loading="mesLoading">重新检测Mes地址</n-button>
        <!-- <div class="tip">
          <n-button dashed type="error">设备异常{{}}</n-button>
        </div> -->
        <div class="exit">
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-icon size="20" color="red" @click="exit">
                <md-exit />
              </n-icon>
            </template>
            退出登录
          </n-tooltip>
        </div>
      </div>
    </n-layout-sider>
  </n-layout>
</template>
<script setup>
import store from '@/store'
import { ref, h, toRaw, computed, watch } from "vue";
import route from '@/router'
import { NIcon } from 'naive-ui'
import { Accessibility20Filled, AlignRight20Filled, Settings20Filled, Library20Filled, BookInformation20Filled, ClockAlarm20Filled, Box20Filled } from "@vicons/fluent"
import { MdHelpCircle, MdExit } from '@vicons/ionicons4'
import { ipcRenderer } from 'electron'
import constant from '@/lib/constant';
import hik from '@/lib/hik';

const imgUrl = require('@/assets/hik.svg')

const collapsed = ref(false)
const theme = ref('white')
const name = computed(() => {
  return store.state.name
})
const role = computed(() => {
  return store.state.role
})
const updateMenu = computed(() => {
  return store.state.updateMenu
})
const plcStatus = computed(() => {
  return store.state.plcStatus
})
const mesStatus = computed(() => {
  return store.state.mesStatus
})
const tcpStatus = computed(() => {
  return store.state.tcpStatus
})
//按钮loading
const plcLoading = ref(false)
const tcpLoading = ref(false)
const mesLoading = ref(false)


const reconnectPLC = function () {
  if (plcLoading.value) {
    return
  }
  plcLoading.value = true
  let PLCIP = store.state.sysConfig.PLCIP
  if (PLCIP != null && PLCIP != '') {
    ipcRenderer.invoke('connect-invoke', constant.sysOperate.checkPLCAddress, PLCIP).then(res => {
      if (res.success) {
        ipcRenderer.invoke('connect-invoke', constant.sysOperate.connectPLC, PLCIP).then(res => {
          if (res.success) {
            store.commit('updateplcStatus', true)
            ipcRenderer.send('log-msg-info', 'updateplcStatus:' + store.state.plcStatus)
            plcLoading.value = false
            window.$message.info('PLC连接成功')
          }
        })
      } else {
        plcLoading.value = false
        window.$message.error('PLC地址:' + PLCIP + '无法ping通', { duration: 5e3 })
      }
    })
  }
}

const reconnectPrintServer = function () {
  if (tcpLoading.value) {
    return
  }
  tcpLoading.value = true
  let ip = store.state.sysConfig.ip
  let port = store.state.sysConfig.port
  if (ip != null && ip != '' && port != null) {
    ipcRenderer.invoke('connect-invoke', constant.sysOperate.checkTCPAddress, ip, port).then(res => {
      //连接打印机
      if (res.success) {
        ipcRenderer.send('log-msg-info', 'connect Print Server')
        hik.connectPrintServer(ip, port).then(res => {
          store.commit('updatetcpStatus', true)
          ipcRenderer.send('log-msg-info', 'updatetcpStatus:' + store.state.tcpStatus)
          tcpLoading.value = false
        }).catch(err => {
          ipcRenderer.send('log-msg-info', 'connectPrintServer:' + err)
        })

      } else {
        tcpLoading.value = false
        window.$message.error('当前打印机服务地址无效', { duration: 5e3 })
      }
    })
  } else {
    window.$message.error('请在「系统管理」中正确配置打印IP/端口', { duration: 5e3 })
    tcpLoading.value = false
  }
}

const reConnectMes = function () {
  if (mesLoading.value) {
    return
  }
  mesLoading.value = true
  const mesIP = 'mes-expose.hikvision.com'
  const mesPort = 12304
  ipcRenderer.invoke('connect-invoke', constant.sysOperate.checkTCPAddress, mesIP, mesPort).then(res => {
    if (res.success) {
      ipcRenderer.send('log-msg-info', 'test mes address ')
    } else {
      window.$message.error('请检查MES服务地址:http://' + mesIP + ':' + mesPort + '是否指向正确的路由', { duration: 5e3 })
      mesLoading.value = false
    }
  })
}

const selectMenu = function (key, item) {
  if (item.key === '/theme') {
    theme.value = theme.value == 'white' ? 'dark' : 'white'
    store.commit('updateTheme', theme.value)
  } else {
    route.replace(item.key)
  }
  // this.activeKey = item.key
}
function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

var iconMap = new Map([
  ['/MainWindow', AlignRight20Filled],
  ['/Alarm', ClockAlarm20Filled],
  ['/SysManager', Settings20Filled],
  ['/DataReport', Library20Filled],
  ['/UserManage', Accessibility20Filled],
  ['/SendBox', Box20Filled],
  ['/Help', MdHelpCircle],
  ['/log', BookInformation20Filled],
])
let aa = toRaw(store.state.mainMenus)

const loadMenus = function () {
  let menus = aa.map(item => {
    item.icon = renderIcon(iconMap.get(item.key))
    if (item.children) {
      item.children.map(innerItem => {
        innerItem.icon = renderIcon(iconMap.get(innerItem.key))
        return innerItem
      })
    }
    if (item.authorization) {
      if (item.authorization.indexOf(role.value) != -1) {
        return item
      }
    } else {
      return item
    }
  })
  let newMenus = menus.filter(item => ![undefined].includes(item))
  return newMenus
}

const menuOptions = ref(loadMenus())
const activeKey = ref(route.currentRoute._value.fullPath)

const exit = function () {
  store.commit('updateMenu', false)
  store.commit('updateworkFlag', true)
  route.replace('/login')
}

// watch(updateMenu.value, (old, new) => { },{})
watch(updateMenu, (value, old) => {
  console.log('变化----', value, old)
  if (value === true) {
    menuOptions.value = loadMenus()
  }
}, { immediate: true })

watch(() => route.currentRoute._value.fullPath, (newPath, oldPath) => {
  console.log(newPath)
}, { immediate: true });


</script>
<style scoped>
.user {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 20px;
}

.head_img {
  margin-bottom: 5px;
  width: 60px;
  height: 22px;
  background-size: cover;
}

.exit {
  margin-top: auto;
  margin-bottom: 10px;
  margin-left: 22px;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  justify-content: center;
}

.exit>i {
  cursor: pointer;
}

.tip {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.err_btn {
  margin: 0 10px 5px 10px;
}

.tip>button {
  width: 90%;
}
</style>