import { createRouter, createWebHistory } from 'vue-router'
import Indexview from '@/views/index/index.vue'
import Clazzview from '@/views/clazz/index.vue'
import Deptview from '@/views/dept/index.vue'
import EmpView from '@/views/emp/index.vue'
import Logview from '@/views/log/index.vue'
import Stuview from '@/views/stu/index.vue'
import EmpReportView from '@/views/report/emp/index.vue'
import stuReportview from '@/views/report/stu/index.vue'
import LayoutView from '@/views/layout/index.vue'
import LoginView from '@/views/login/index.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '',
      component: LayoutView,
      redirect: '/index',
      children: [
        {
          path: 'index',
          name: 'index',
          component: Indexview
        },
        {
          path: 'clazz',
          name: 'clazz',
          component: Clazzview
        },
        {
          path: 'dept',
          name: 'dept',
          component: Deptview
        },
        {
          path: 'emp',
          name: 'emp',
          component: EmpView
        },
        {
          path: 'log',
          name: 'log',
          component: Logview
        },
        {
          path: 'stu',
          name: 'stu',
          component: Stuview
        },
        {
          path: 'empReport',
          name: 'empReport',
          component: EmpReportView
        },
        {
          path: 'stuReport',
          name: 'stuReport',
          component: stuReportview
        },
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
})

export default router
