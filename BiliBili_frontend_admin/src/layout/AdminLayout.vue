<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/admin'
import { logout } from '@/api/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const activeMenu = computed(() => route.path)
const displayName = computed(
  () => adminStore.adminInfo?.nickName || adminStore.adminInfo?.account || '',
)

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确认退出登录吗？', '提示', { type: 'warning' })
  } catch {
    return
  }

  try {
    await logout()
  } finally {
    adminStore.clearAdminInfo()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="200px" class="admin-layout__aside">
      <div class="admin-layout__logo">BiliBili 管理后台</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#c9c9c9"
        active-text-color="#ffffff"
        class="admin-layout__menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Menu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/video">
          <el-icon><VideoCamera /></el-icon>
          <span>视频管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-layout__header">
        <span class="admin-layout__admin-info">{{ displayName }}</span>
        <el-button type="danger" link @click="handleLogout">退出登录</el-button>
      </el-header>

      <el-main class="admin-layout__main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-layout__aside {
  background-color: #001529;
  color: #fff;
}

.admin-layout__logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
}

.admin-layout__menu {
  border-right: none;
  background-color: transparent;
}

.admin-layout__header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.admin-layout__admin-info {
  color: var(--el-text-color-regular);
}

.admin-layout__main {
  background-color: var(--el-fill-color-lighter);
}
</style>
