<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Hls from 'hls.js'
import { getVideoDetail, buildHlsUrl } from '@/api/video'

const props = defineProps({
  videoId: {
    type: String,
    default: '',
  },
  categoryMap: {
    type: Object, // categoryId -> categoryName
    default: () => ({}),
  },
})

const visible = defineModel('visible', { default: false })

const loading = ref(false)
const detail = ref(null)
const videoRef = ref(null)
let hls = null

function destroyPlayer() {
  if (hls) {
    hls.destroy()
    hls = null
  }
}

function setupPlayer(fileId) {
  destroyPlayer()
  const video = videoRef.value
  if (!video || !fileId) return

  const url = buildHlsUrl(fileId)

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    return
  }

  if (Hls.isSupported()) {
    hls = new Hls({
      xhrSetup: (xhr) => {
        xhr.withCredentials = true
      },
    })
    hls.loadSource(url)
    hls.attachMedia(video)
  }
}

watch(visible, async (val) => {
  if (!val) {
    destroyPlayer()
    detail.value = null
    return
  }

  loading.value = true
  try {
    detail.value = await getVideoDetail(props.videoId)
    await nextTick()
    setupPlayer(detail.value?.fileId)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  destroyPlayer()
})
</script>

<template>
  <el-dialog v-model="visible" title="视频详情" width="720px" destroy-on-close>
    <div v-loading="loading" class="video-detail">
      <video ref="videoRef" controls class="video-detail__player"></video>

      <el-descriptions v-if="detail" :column="1" border class="video-detail__info">
        <el-descriptions-item label="视频名称">{{ detail.videoName }}</el-descriptions-item>
        <el-descriptions-item label="所属分类">
          {{ categoryMap[detail.categoryId] || '未知分类' }}
        </el-descriptions-item>
        <el-descriptions-item label="简介">
          <div class="video-detail__intro">{{ detail.introduction || '暂无简介' }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-dialog>
</template>

<style scoped>
.video-detail__player {
  width: 100%;
  max-height: 405px;
  background-color: #000;
  margin-bottom: 16px;
}

.video-detail__intro {
  white-space: pre-wrap;
}
</style>
