<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import CategoryNav from '@/components/home/CategoryNav.vue'
import RecommendCarousel from '@/components/home/RecommendCarousel.vue'
import VideoCard from '@/components/video/VideoCard.vue'
import { loadRecommendVideos, loadVideoList } from '@/api/video'

// 首屏：轮播右侧 3×2 + 下方 2 行 × 5 = 16 张，后续每次滚动到底部再加载一页
const PAGE_SIZE = 16

const recommendVideos = ref([])
const recommendLoading = ref(true)

const videos = ref([])
const pageNo = ref(0)
const loading = ref(false)
const finished = ref(false)
const error = ref(false)

const sentinelRef = ref(null)
let observer = null

async function fetchRecommend() {
  recommendLoading.value = true
  try {
    recommendVideos.value = (await loadRecommendVideos()) || []
  } catch {
    recommendVideos.value = []
  } finally {
    recommendLoading.value = false
  }
}

async function fetchNextPage() {
  if (loading.value || finished.value) return
  loading.value = true
  error.value = false
  try {
    const next = pageNo.value + 1
    const data = await loadVideoList({ pageNo: next, pageSize: PAGE_SIZE })
    const records = data?.records || []
    videos.value.push(...records)
    pageNo.value = next
    const total = Number(data?.total) || 0
    // total 不可靠时（例如后端未启用分页插件）以"本页不足一页"作为结束条件
    finished.value = records.length < PAGE_SIZE || (total > 0 && videos.value.length >= total)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function retry() {
  error.value = false
  fetchNextPage()
}

onMounted(() => {
  fetchRecommend()
  fetchNextPage()

  // 哨兵元素进入视口（提前 300px）时加载下一页，实现首页懒加载
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !error.value) fetchNextPage()
    },
    { rootMargin: '300px 0px' },
  )
  if (sentinelRef.value) observer.observe(sentinelRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="home">
    <AppHeader />

    <main class="page-container">
      <CategoryNav />

      <section class="feed">
        <div class="feed__recommend">
          <RecommendCarousel :videos="recommendVideos" :loading="recommendLoading" />
        </div>

        <VideoCard v-for="video in videos" :key="video.videoId" :video="video" />

        <!-- 首次加载骨架屏 -->
        <template v-if="loading && !videos.length">
          <div v-for="i in 6" :key="`sk-${i}`" class="feed__skeleton">
            <div class="feed__skeleton-cover"></div>
            <div class="feed__skeleton-line"></div>
            <div class="feed__skeleton-line is-short"></div>
          </div>
        </template>
      </section>

      <div ref="sentinelRef" class="feed__status">
        <span v-if="loading && videos.length">加载中...</span>
        <span v-else-if="error && videos.length" class="feed__retry" @click="retry">
          加载失败，点击重试
        </span>
        <span v-else-if="finished && videos.length">没有更多视频了</span>
        <span v-else-if="!loading && !videos.length">暂无视频</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-width: 1100px;
  padding-bottom: 40px;
}

.feed {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px 20px;
}

/* 推荐轮播占左上 2 列 × 2 行，其余普通视频自动填充右侧和下方 */
.feed__recommend {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

@media (max-width: 1400px) {
  .feed {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.feed__skeleton-cover {
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  background: var(--graph-bg);
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.feed__skeleton-line {
  height: 16px;
  margin-top: 12px;
  border-radius: 4px;
  background: var(--graph-bg);
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.feed__skeleton-line.is-short {
  width: 50%;
}

.feed__status {
  padding: 32px 0 8px;
  text-align: center;
  color: var(--text3);
  font-size: 13px;
}

.feed__retry {
  color: var(--bili-blue);
  cursor: pointer;
}

@keyframes skeleton-pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
