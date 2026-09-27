import request from './request'

// ⚠️ 后端客户端（medium_web）目前还没有首页视频查询接口，以下两个接口是按首页需求预设的契约，
// 后端实现后按实际路径/字段调整即可。调用时开启 silent，接口不存在时首页展示空状态而不是报错弹窗。
//
// 预期单条视频字段（与管理端 VideoInfoVO 对齐）：
// { videoId, videoName, videoCover, nickName, avatar, playCount, duration, createTime }

// 推荐视频（轮播），返回视频数组
export function loadRecommendVideos() {
  return request.get('/video/loadRecommendVideo', { silent: true })
}

// 普通视频分页，返回 { records, total, pageNo, pageSize }
export function loadVideoList({ pageNo, pageSize, categoryId }) {
  return request.get('/video/loadVideo', {
    params: { pageNo, pageSize, categoryId },
    silent: true,
  })
}
