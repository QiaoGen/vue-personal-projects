import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/operation',
    component: ()=> import('@/views/Home.vue'),
    children: [
      {
       path: '/logWindow',
       name: 'logWindow',
       component: () => import('@/views/logWindow.vue')
      },
      {
        path: '/operation',
        name: 'operation',
        component: () => import('@/views/operation.vue')
       }
    ]
  }
  
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
