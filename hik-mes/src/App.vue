<template>
  <n-dialog-provider>
    <n-message-provider>
      <MessageApi />
    </n-message-provider>
    <div style="height: 100%;">
      <!-- <keep-alive include="operation"> -->
      <keep-alive>
        <router-view/>
      </keep-alive>
    </div>
  </n-dialog-provider>
  
</template>

<script setup>
import MessageApi from '@/components/uitls/MessageApi.vue';
import { NMessageProvider } from "naive-ui";


</script>

<style lang="scss">
*{
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
