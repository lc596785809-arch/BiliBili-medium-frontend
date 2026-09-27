<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resolveImage } from '@/utils/format'

defineProps({
  videos: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const activeIndex = ref(0)

function goDetail(video) {
  router.push({ name: 'videoDetail', params: { videoId: video.videoId } })
}
</script>

<template>
  <div class="recommend">
    <div v-if="loading" class="recommend__placeholder is-loading"></div>

    <div v-else-if="!videos.length" class="recommend__placeholder">
      <span>暂无推荐视频</span>
    </div>

    <el-carousel
      v-else
      height="100%"
      :interval="5000"
      indicator-position="none"
      arrow="always"
      class="recommend__carousel"
      @change="activeIndex = $event"
    >
      <el-carousel-item v-for="video in videos" :key="video.videoId">
        <div class="recommend__slide" @click="goDetail(video)">
          <img :src="resolveImage(video.videoCover)" class="recommend__img" :alt="video.videoName" />
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 底部标题栏 + 自定义指示点，仿 B 站首页大轮播 -->
    <div v-if="!loading && videos.length" class="recommend__footer">
      <div class="recommend__title" @click="goDetail(videos[activeIndex])">
        {{ videos[activeIndex]?.videoName }}
      </div>
      <div class="recommend__dots">
        <span
          v-for="(video, index) in videos"
          :key="video.videoId"
          class="recommend__dot"
          :class="{ active: index === activeIndex }"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recommend {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--graph-bg);
}

.recommend__carousel {
  position: absolute;
  inset: 0;
}

.recommend__carousel :deep(.el-carousel__container) {
  height: 100%;
}

.recommend__slide {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.recommend__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommend__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
}

.recommend__placeholder.is-loading {
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.recommend__footer {
  position: absolute;
  inset: auto 0 0;
  z-index: 2;
  padding: 48px 20px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
  pointer-events: none;
}

.recommend__title {
  width: calc(100% - 110px);
  font-size: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  pointer-events: auto;
}

.recommend__dots {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.recommend__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
}

.recommend__dot.active {
  width: 14px;
  height: 14px;
  margin-top: -3px;
  background: #fff;
}

/* 箭头挪到右下角，参照 B 站大轮播 */
.recommend__carousel :deep(.el-carousel__arrow) {
  top: auto;
  bottom: 22px;
  transform: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
}

.recommend__carousel :deep(.el-carousel__arrow:hover) {
  background: rgba(255, 255, 255, 0.3);
}

.recommend__carousel :deep(.el-carousel__arrow--left) {
  left: auto;
  right: 60px;
}

.recommend__carousel :deep(.el-carousel__arrow--right) {
  right: 20px;
}

@keyframes skeleton-pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
