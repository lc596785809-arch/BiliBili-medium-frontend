import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/HomeView.vue'),
    },
    {
      path: '/video/:videoId',
      name: 'videoDetail',
      component: () => import('@/views/video/VideoDetailView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
