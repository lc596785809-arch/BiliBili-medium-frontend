<script setup>
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const placeholderStats = [
  { label: '待审核视频', value: '--' },
  { label: '今日投稿', value: '--' },
  { label: '平台用户数', value: '--' },
  { label: '分类数量', value: '--' },
]
</script>

<template>
  <div class="dashboard">
    <el-card class="dashboard__welcome">
      <h2>欢迎回来，{{ adminStore.adminInfo?.nickName || adminStore.adminInfo?.account }}</h2>
      <p class="dashboard__welcome-sub">账号：{{ adminStore.adminInfo?.account }}</p>
    </el-card>

    <el-row :gutter="16" class="dashboard__stats">
      <el-col v-for="item in placeholderStats" :key="item.label" :span="6">
        <el-card>
          <div class="dashboard__stat-label">{{ item.label }}</div>
          <div class="dashboard__stat-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard__welcome {
  margin-bottom: 16px;
}

.dashboard__welcome-sub {
  color: var(--el-text-color-secondary);
  margin: 8px 0 0;
}

.dashboard__stat-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.dashboard__stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-top: 8px;
}
</style>
