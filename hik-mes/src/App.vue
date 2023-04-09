<template>
  <n-dialog-provider>
    <n-message-provider>
      <MessageApi />
    </n-message-provider>
    <n-config-provider :locale="zhCN" :date-locale="dateZhCN" style="height: 100%;">

      <div style="height: 100%;width: 100%;display: flex;">
        <!-- <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view> -->
        <home />

      </div>
    </n-config-provider>

  </n-dialog-provider>
</template>

<script setup>
import MessageApi from '@/components/uitls/MessageApi.vue';
import { NMessageProvider, darkTheme } from "naive-ui";
import { ref, computed } from 'vue';
import store from '@/store'
import Home from '@/views/Home.vue'
// const theme = ref(darkTheme)
const theme = computed(() => {
  return store.state.theme === 'white' ? null : darkTheme
})

</script>

<style>
* {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}

html,
body {
  padding: 0;
  margin: 0;
  height: 100%;
}
</style>
