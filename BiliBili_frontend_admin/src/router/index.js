import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const WHITE_LIST = ['/login']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layout/AdminLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'category',
          name: 'category',
          component: () => import('@/views/category/CategoryView.vue'),
        },
        {
          path: 'video',
          name: 'video',
          component: () => import('@/views/video/VideoView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const adminStore = useAdminStore()

  if (WHITE_LIST.includes(to.path)) {
    if (to.path === '/login' && adminStore.isLogin) {
      return '/dashboard'
    }
    return true
  }

  if (!adminStore.isLogin) {
    return '/login'
  }

  return true
})

export default router
