<script setup>
import { computed } from 'vue'
import { formatCount, formatDuration, formatPublishTime, resolveImage } from '@/utils/format'

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
})

const detailLink = computed(() => ({ name: 'videoDetail', params: { videoId: props.video.videoId } }))
</script>

<template>
  <div class="video-card">
    <router-link :to="detailLink" class="video-card__cover">
      <img
        v-if="video.videoCover"
        :src="resolveImage(video.videoCover)"
        loading="lazy"
        class="video-card__img"
        :alt="video.videoName"
      />
      <div class="video-card__mask">
        <span class="video-card__stat">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5 4h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5zm5 3.2 5 2.9a1 1 0 0 1 0 1.7l-5 2.9a1 1 0 0 1-1.5-.9V10a1 1 0 0 1 1.5-.8z"
            />
          </svg>
          {{ formatCount(video.playCount) }}
        </span>
        <span v-if="video.duration" class="video-card__duration">
          {{ formatDuration(video.duration) }}
        </span>
      </div>
    </router-link>

    <router-link :to="detailLink" class="video-card__title" :title="video.videoName">
      {{ video.videoName }}
    </router-link>
    <div class="video-card__meta">
      <span class="video-card__up">UP</span>
      <span class="video-card__author">{{ video.nickName }}</span>
      <span v-if="video.createTime">· {{ formatPublishTime(video.createTime) }}</span>
    </div>
  </div>
</template>

<style scoped>
.video-card {
  min-width: 0;
}

.video-card__cover {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
  background: var(--graph-bg);
}

.video-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.video-card__cover:hover .video-card__img {
  transform: scale(1.04);
}

.video-card__mask {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 12px 8px 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: #fff;
  font-size: 13px;
}

.video-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.video-card__title {
  display: -webkit-box;
  margin-top: 10px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  font-size: 15px;
  line-height: 22px;
  min-height: 44px;
  color: var(--text1);
  transition: color 0.2s;
}

.video-card__title:hover {
  color: var(--bili-blue);
}

.video-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 13px;
  color: var(--text3);
  white-space: nowrap;
  overflow: hidden;
}

.video-card__up {
  padding: 0 2px;
  border: 1px solid currentColor;
  border-radius: 3px;
  font-size: 10px;
  line-height: 12px;
}

.video-card__author {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
