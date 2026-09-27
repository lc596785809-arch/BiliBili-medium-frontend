<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Medal, Message, Compass, Star, Clock, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import UserAvatar from './UserAvatar.vue'

const userStore = useUserStore()

const keyword = ref('')

const entries = [
  { key: 'vip', label: '大会员', icon: Medal },
  { key: 'message', label: '消息', icon: Message },
  { key: 'dynamic', label: '动态', icon: Compass },
  { key: 'favorite', label: '收藏', icon: Star },
  { key: 'history', label: '历史', icon: Clock },
]

function handleSearch() {
  // 搜索接口待后端提供（ES 检索），先保留交互
  ElMessage.info('搜索功能开发中')
}

// 个人相关入口需要登录，未登录先弹登录框
function handleEntry(item) {
  if (!userStore.isLogin) {
    userStore.openLogin()
    return
  }
  ElMessage.info(`${item.label}功能开发中`)
}
</script>

<template>
  <header class="app-header">
    <!-- 背景图：public/images/home-banner.png，缺失时显示渐变兜底 -->
    <div class="app-header__banner"></div>

    <div class="app-header__bar">
      <div class="app-header__left">
        <router-link to="/" class="app-header__home">
          <svg class="app-header__home-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M6.9 3.3a1 1 0 0 1 1.4 0L10.9 6h2.2l2.6-2.7a1 1 0 1 1 1.4 1.4L15.9 6H18a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h2.1L6.9 4.7a1 1 0 0 1 0-1.4zM6 8a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6zm2.5 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm7 0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1z"
            />
          </svg>
          <span>首页</span>
        </router-link>
      </div>

      <form class="app-header__search" @submit.prevent="handleSearch">
        <input v-model="keyword" class="app-header__search-input" placeholder="搜索视频" />
        <button type="submit" class="app-header__search-btn" aria-label="搜索">
          <el-icon><Search /></el-icon>
        </button>
      </form>

      <div class="app-header__right">
        <UserAvatar />
        <div
          v-for="item in entries"
          :key="item.key"
          class="app-header__entry"
          @click="handleEntry(item)"
        >
          <el-icon class="app-header__entry-icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </div>
        <button class="app-header__upload" @click="handleEntry({ label: '投稿' })">
          <el-icon><Upload /></el-icon>
          <span>投稿</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  height: 180px;
  min-width: 1100px;
}

.app-header__banner {
  position: absolute;
  inset: 0;
  background-color: #7ec8e3;
  background-image:
    url('/images/home-banner.png'), linear-gradient(120deg, #7ec8e3 0%, #b6e3c7 50%, #f7d9a8 100%);
  background-size: cover;
  background-position: center;
}

/* 顶部轻微压暗，保证白色文字在任意背景图上可读 */
.app-header__banner::after {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 100px;
  background: linear-gradient(rgba(0, 0, 0, 0.35), transparent);
}

.app-header__bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  color: #fff;
}

.app-header__left {
  flex: 1;
  display: flex;
  align-items: center;
}

.app-header__home {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.app-header__home-icon {
  width: 20px;
  height: 20px;
}

.app-header__search {
  display: flex;
  align-items: center;
  flex: 0 1 500px;
  height: 40px;
  margin: 0 24px;
  padding: 0 4px 0 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  transition: background 0.2s;
}

.app-header__search:hover,
.app-header__search:focus-within {
  background: #fff;
}

.app-header__search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text1);
}

.app-header__search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text1);
  font-size: 17px;
  cursor: pointer;
}

.app-header__search-btn:hover {
  background: var(--graph-bg);
}

.app-header__right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.app-header__entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  font-size: 13px;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.app-header__entry:hover {
  transform: translateY(-2px);
}

.app-header__entry-icon {
  margin-bottom: 2px;
  font-size: 20px;
}

.app-header__upload {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  margin-left: 12px;
  padding: 0 20px;
  border: none;
  border-radius: 8px;
  background: var(--bili-pink);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.app-header__upload:hover {
  background: var(--bili-pink-hover);
}
</style>
