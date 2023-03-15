import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/MainWindow',
    name: 'MainWindow',
    component: () => import('@/views/MainWindow.vue')
  }, {
    path: '/Alarm',
    name: 'Alarm',
    component: () => import('@/views/Alarm.vue')
  },
  {
    path: '/Help',
    name: 'Help',
    component: () => import('@/views/Help.vue')
  },
  {
    path: '/SysManager',
    name: 'SysManager',
    component: () => import('@/views/SysManager.vue'),
    meta: {
      keepAlive: true //设置页面是否需要使用缓存
    },
  },
  {
    path: '/DataReport',
    name: 'DataReport',
    component: () => import('@/views/DataReport.vue'),
    meta: {
      keepAlive: true //设置页面是否需要使用缓存
    },
  },
  {
    path: '/UserManage',
    name: 'UserManage',
    component: () => import('@/views/UserManage.vue')
  },
  {
    path: '/log',
    name: 'log',
    component: () => import('@/views/others/logWindow.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
