<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, VideoCamera, SwitchButton, ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { defaultAvatar, resolveAvatar } from '@/utils/format'

const userStore = useUserStore()

const avatarUrl = computed(() => resolveAvatar(userStore.userInfo?.avatar))
const isVip = computed(() => userStore.userInfo?.permission === 2)

// 关注/粉丝/动态后端暂未提供接口，先占位
const stats = [
  { label: '关注', value: '--' },
  { label: '粉丝', value: '--' },
  { label: '动态', value: '--' },
]

const menus = [
  { key: 'space', label: '个人中心', icon: User },
  { key: 'upload', label: '投稿管理', icon: VideoCamera },
]

const hovering = ref(false)
let leaveTimer = null

// 鼠标从头像移入面板之间有空隙，延迟收起避免面板闪烁
function handleEnter() {
  if (!userStore.isLogin) return
  clearTimeout(leaveTimer)
  hovering.value = true
}

function handleLeave() {
  clearTimeout(leaveTimer)
  leaveTimer = setTimeout(() => {
    hovering.value = false
  }, 200)
}

function handleAvatarClick() {
  if (!userStore.isLogin) userStore.openLogin()
}

function handleMenu(item) {
  ElMessage.info(`${item.label}功能开发中`)
}

async function handleLogout() {
  hovering.value = false
  await userStore.logout()
  ElMessage.success('已退出登录')
}

function onImgError(e) {
  e.target.src = defaultAvatar
}

onBeforeUnmount(() => clearTimeout(leaveTimer))
</script>

<template>
  <div class="user-avatar" @mouseenter="handleEnter" @mouseleave="handleLeave">
    <div
      class="user-avatar__img-wrap"
      :class="{ 'is-active': hovering, 'is-guest': !userStore.isLogin }"
      :title="userStore.isLogin ? '' : '点击登录'"
      @click="handleAvatarClick"
    >
      <img
        :src="userStore.isLogin ? avatarUrl : defaultAvatar"
        class="user-avatar__img"
        alt="头像"
        @error="onImgError"
      />
      <span v-if="!userStore.isLogin" class="user-avatar__login-tip">登录</span>
    </div>

    <transition name="panel-fade">
      <div v-if="hovering && userStore.isLogin" class="user-panel">
        <div class="user-panel__name">{{ userStore.userInfo?.nickName }}</div>
        <div class="user-panel__tags">
          <span v-if="isVip" class="tag tag--vip">大会员</span>
          <span v-else class="tag">正式会员</span>
        </div>

        <div class="user-panel__stats">
          <div v-for="item in stats" :key="item.label" class="user-panel__stat">
            <div class="user-panel__stat-value">{{ item.value }}</div>
            <div class="user-panel__stat-label">{{ item.label }}</div>
          </div>
        </div>

        <div v-if="!isVip" class="user-panel__vip">
          <div>
            <div class="user-panel__vip-title">成为大会员</div>
            <div class="user-panel__vip-desc">解锁 VIP 专属视频</div>
          </div>
          <span class="user-panel__vip-btn" @click="ElMessage.info('会员中心开发中')">会员中心</span>
        </div>

        <ul class="user-panel__menu">
          <li v-for="item in menus" :key="item.key" @click="handleMenu(item)">
            <el-icon class="user-panel__menu-icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
            <el-icon class="user-panel__menu-arrow"><ArrowRight /></el-icon>
          </li>
        </ul>

        <div class="user-panel__split"></div>

        <ul class="user-panel__menu">
          <li @click="handleLogout">
            <el-icon class="user-panel__menu-icon"><SwitchButton /></el-icon>
            <span>退出登录</span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.user-avatar {
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 8px;
}

.user-avatar__img-wrap {
  position: relative;
  z-index: 3;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #fff;
  cursor: pointer;
  transform-origin: top center;
  transition: transform 0.3s ease;
}

/* 悬停时头像放大并下移，压在面板顶部，参照 B 站交互 */
.user-avatar__img-wrap.is-active {
  transform: translate(0, 10px) scale(2);
}

.user-avatar__img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
}

.user-avatar__login-tip {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 174, 236, 0.85);
  color: #fff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s;
}

.user-avatar__img-wrap.is-guest:hover .user-avatar__login-tip {
  opacity: 1;
}

.user-panel {
  position: absolute;
  top: 58px;
  left: 50%;
  z-index: 2;
  width: 300px;
  padding: 50px 24px 12px;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  color: var(--text1);
  text-align: center;
}

.user-panel__name {
  font-size: 18px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-panel__tags {
  margin-top: 6px;
}

.tag {
  display: inline-block;
  padding: 0 6px;
  border-radius: 3px;
  font-size: 12px;
  line-height: 18px;
  color: var(--text3);
  background: var(--graph-bg);
}

.tag--vip {
  color: #fff;
  background: var(--bili-pink);
}

.user-panel__stats {
  display: flex;
  justify-content: space-around;
  margin: 16px 0 12px;
}

.user-panel__stat {
  cursor: pointer;
}

.user-panel__stat-value {
  font-size: 18px;
  font-weight: 500;
}

.user-panel__stat-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text3);
}

.user-panel__stat:hover .user-panel__stat-value,
.user-panel__stat:hover .user-panel__stat-label {
  color: var(--bili-blue);
}

.user-panel__vip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: linear-gradient(90deg, #eef4ff, #fdf0f6);
  text-align: left;
}

.user-panel__vip-title {
  font-size: 14px;
  color: var(--bili-pink);
}

.user-panel__vip-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text2);
}

.user-panel__vip-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #fff;
  color: var(--bili-pink);
  font-size: 13px;
  cursor: pointer;
}

.user-panel__menu {
  margin: 0 -12px;
  padding: 0;
  list-style: none;
}

.user-panel__menu li {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--text2);
  cursor: pointer;
  transition: background 0.2s;
}

.user-panel__menu li:hover {
  background: var(--graph-bg);
}

.user-panel__menu-icon {
  margin-right: 14px;
  font-size: 18px;
}

.user-panel__menu-arrow {
  margin-left: auto;
  color: var(--text3);
}

.user-panel__split {
  height: 1px;
  margin: 6px 0;
  background: var(--line);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}
</style>
