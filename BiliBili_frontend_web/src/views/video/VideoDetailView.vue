<script setup>
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="video-detail">
    <AppHeader />
    <main class="page-container">
      <!-- 视频详情与播放页待开发（需后端提供客户端视频详情接口） -->
      <el-empty :description="`视频详情页开发中（videoId：${route.params.videoId}）`">
        <router-link to="/">
          <el-button type="primary">返回首页</el-button>
        </router-link>
      </el-empty>
    </main>
  </div>
</template>

<style scoped>
.video-detail {
  min-width: 1100px;
}
</style>
