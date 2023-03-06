<template>
    <n-dialog-provider>
      <n-message-provider>
        <MessageApi />
      </n-message-provider>
      <n-config-provider style="height: 100%;" :theme="theme">
      
      <div style="height: 100%;">
        <!-- <keep-alive>
          <router-view/>
        </keep-alive> -->
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
        <!-- <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component"  v-if="$route.meta.keepAlive"/>
          </keep-alive>
          <component :is="Component"  v-if="!$route.meta.keepAlive"/>
        </router-view>  -->

      </div>
    </n-config-provider>

    </n-dialog-provider>
</template>

<script setup>
import MessageApi from '@/components/uitls/MessageApi.vue';
import { NMessageProvider,darkTheme } from "naive-ui";
import { ref, computed } from 'vue';
import store from '@/store'

// const theme = ref(darkTheme)
const theme = computed(() => {
  return store.state.theme === 'white'? null: darkTheme
})

</script>

<style lang="scss">
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
}

html,
body {
  padding: 0;
  margin: 0;
  height: 100%;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
