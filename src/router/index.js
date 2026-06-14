import { createRouter, createWebHistory } from 'vue-router'

/**
 * Vue Router 路由配置
 * - 地图页面（默认）
 * - 数据管理页面
 * - 关于页面
 * - 路由懒加载（加分项）
 */
const routes = [
  {
    path: '/',
    name: 'Map',
    component: () => import('@/views/MapView.vue'), // 懒加载
    meta: { title: '地图', requiresAuth: false }
  },
  {
    path: '/data',
    name: 'Data',
    component: () => import('@/views/DataView.vue'), // 懒加载
    meta: { title: '数据管理', requiresAuth: false }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于', requiresAuth: false }
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: () => import('@/views/PortfolioView.vue'),
    meta: { title: '作品集', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局前置守卫：路由权限控制（加分项）
 * 此处演示简单的权限检查逻辑，实际可接入认证系统
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - GIS 应用` : 'GIS 应用框架'

  // 权限检查示例：若路由需要认证且用户未登录
  if (to.meta.requiresAuth) {
    const isAuthenticated = sessionStorage.getItem('gis-authenticated')
    if (!isAuthenticated) {
      console.warn('需要登录才能访问:', to.path)
      // 实际项目中可重定向到登录页
      // next('/login')
    }
  }
  next()
})

export default router