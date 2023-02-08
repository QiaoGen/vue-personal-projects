import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import naive from 'naive-ui'
import store from './store'

createApp(App).use(naive).use(store).use(router).mount('#app')
