import { createRouter, createWebHistory } from 'vue-router'
import Layout from './layout/Layout.vue'
import { isLoggedIn } from './utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/agents',
    children: [
      {
        path: '/agents',
        name: 'Agents',
        component: () => import('./views/AgentManagement.vue'),
        meta: { title: '智能体管理' }
      },
      {
        path: '/categories',
        name: 'Categories',
        component: () => import('./views/CategoryManagement.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: '/quick-questions',
        name: 'QuickQuestions',
        component: () => import('./views/QuickQuestionConfig.vue'),
        meta: { title: '快捷问题配置' }
      },
      {
        path: '/feedback',
        name: 'Feedback',
        component: () => import('./views/FeedbackRecords.vue'),
        meta: { title: '用户反馈' }
      },
      {
        path: '/psychological-warnings',
        name: 'PsychologicalWarnings',
        component: () => import('./views/PsychologicalWarnings.vue'),
        meta: { title: '心理风险预警' }
      },
      {
        path: '/risk-interception',
        name: 'RiskInterception',
        component: () => import('./views/RiskInterceptionRecords.vue'),
        meta: { title: '风险拦截记录' }
      },
      {
        path: '/user-management',
        name: 'UserManagement',
        component: () => import('./views/UserManagement.vue'),
        meta: { title: '用户管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫：未登录访问受保护页面 → 跳转登录；已登录访问登录页 → 跳转首页
router.beforeEach((to, from, next) => {
  const loggedIn = isLoggedIn()
  if (to.meta.public) {
    if (loggedIn && to.path === '/login') {
      next('/')
    } else {
      next()
    }
    return
  }
  if (!loggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
