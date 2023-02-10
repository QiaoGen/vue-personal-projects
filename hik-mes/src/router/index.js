import { createRouter, createWebHistory } from 'vue-router'

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
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
