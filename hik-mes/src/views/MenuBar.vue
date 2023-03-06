<template>
    <n-layout has-sider class="menu">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
      <div style="height: 100%;display: flex; flex-direction: column; justify-content: flex-start;">
        <div class="user">
          <div class="head_img"></div>
          <div>管理员</div>
        </div>
        <n-menu
              accordion
              v-model:value="activeKey"
              :root-indent="36"
              :indent="12"
              :options="menuOptions"
              @update:value="selectMenu"
              :collapsed="collapsed"
              :collapsed-width="64"
              :collapsed-icon-size="22"
          />
          <div class="exit">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon size="20" color="red" @click="exit">
                    <md-exit/>
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
import { ref,h ,toRaw } from "vue";
import route from '@/router'
import { NIcon } from 'naive-ui'
import { Color20Filled,Accessibility20Filled,AlignRight20Filled,Settings20Filled ,Library20Filled, BookInformation20Filled} from "@vicons/fluent"
import { MdHelpCircle,MdExit } from '@vicons/ionicons4'
 
const collapsed = ref(false)
const theme = ref('white')

const selectMenu = function(key, item){
  if(item.key === '/theme'){
    theme.value = theme.value == 'white'? 'dark':'white'
    store.commit('updateTheme', theme.value)
  }else{
    route.replace(item.key)
  }
  // this.activeKey = item.key
}
function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

var iconMap = new Map([
  ['/MainWindow',AlignRight20Filled],
  ['/SysManager',Settings20Filled],
  // ['/controlAndDebug', PuzzleCube20Filled],
  ['/DataReport', Library20Filled],
  ['/UserManage',Accessibility20Filled],
  ['/theme',Color20Filled],
  ['/Help',MdHelpCircle],
  ['/log',BookInformation20Filled],
])
let aa = toRaw(store.state.mainMenus)
let menus = aa.map(item => {
  item.icon = renderIcon(iconMap.get(item.key))
  if(item.children){
    item.children.map(innerItem => {
      innerItem.icon = renderIcon(iconMap.get(innerItem.key))
      return innerItem
    })
  }
  return item
})

const menuOptions = ref(menus)
const activeKey =  ref(route.currentRoute._value.fullPath)

const exit = function(){
  route.replace('/login')
}

</script>
<style scoped>
.user{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 20px;
}
.head_img{
  margin-bottom: 5px;
  width: 60px;
  height: 22px;
  background-image: url('@/assets/Hikvision\ Logo-R.svg');
  background-size: cover;
}
.exit{
  margin-top: auto;
  margin-bottom: 10px;
  margin-left: 22px;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  justify-content: center;
}
.exit>i{
  cursor: pointer;
}
</style>