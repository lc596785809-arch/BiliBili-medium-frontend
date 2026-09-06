import request, { ADMIN_BASE_URL } from './request'

export function loadVideoList(dto) {
  return request.post('/api/v1/admin/videoInfo/loadVideoList', dto)
}

export function getVideoDetail(videoId) {
  return request.get('/api/v1/admin/videoInfo/getVideoDetail', { params: { videoId } })
}

export function auditVideo(data) {
  return request.post('/api/v1/admin/videoInfo/auditVideo', data)
}

export function recommendVideo(videoId, recommendType) {
  return request.post('/api/v1/admin/videoInfo/recommendVideo', null, {
    params: { videoId, recommendType },
  })
}

export function setVideoPublic(videoId, isPublic) {
  return request.post('/api/v1/admin/videoInfo/setVideoPublic', null, {
    params: { videoId, isPublic },
  })
}

export function setVideoVip(videoId, isVip) {
  return request.post('/api/v1/admin/videoInfo/setVideoVip', null, {
    params: { videoId, isVip },
  })
}

export function deleteVideo(videoId) {
  return request.post('/api/v1/admin/videoInfo/deleteVideo', null, {
    params: { videoId },
  })
}

// 原生导航下载，不走 axios，规避流式文件下载异常
export function buildDownloadUrl(videoId) {
  return `${ADMIN_BASE_URL}/api/v1/admin/videoInfo/downloadVideo?videoId=${encodeURIComponent(videoId)}`
}

// 管理端 HLS 播放入口，携带 Session Cookie 即可预览任意视频
export function buildHlsUrl(fileId) {
  return `${ADMIN_BASE_URL}/api/v1/admin/videoInfo/videoResource/${encodeURIComponent(fileId)}`
}
