<template>
  <n-layout has-sider class="menu">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed" show-trigger
      @collapse="collapsed = true" @expand="collapsed = false">
      <div style="height: 100%;display: flex; flex-direction: column; justify-content: flex-start;">
        <div class="user">
          <div class="head_img" :style="{backgroundImage: `url(${imgUrl})`}"></div>
          <div>{{ name }}</div>
        </div>
        <n-menu accordion v-model:value="activeKey" :root-indent="36" :indent="12" :options="menuOptions"
          @update:value="selectMenu" :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22" />
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
import { Color20Filled, Accessibility20Filled, AlignRight20Filled, Settings20Filled, Library20Filled, BookInformation20Filled, ClockAlarm20Filled } from "@vicons/fluent"
import { MdHelpCircle, MdExit } from '@vicons/ionicons4'

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
  // ['/theme', Color20Filled],
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
  // store.commit('updateMenu', false)
  route.replace('/login')
}

// watch(updateMenu.value, (old, new) => { },{})
watch(updateMenu, (value, old) => {
  console.log('变化----', value, old)
  if(value === true){
    menuOptions.value = loadMenus()
  }
}, { immediate: true })


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
</style>