<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginDialog from '@/components/layout/LoginDialog.vue'

const userStore = useUserStore()

onMounted(() => {
  // 本地有 Token 时静默校验并刷新用户信息，Token 失效则拦截器会清空登录态
  userStore.autoLogin()
})
</script>

<template>
  <RouterView />
  <LoginDialog />
</template>
