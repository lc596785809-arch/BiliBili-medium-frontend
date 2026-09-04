import request from './request'

// POST /api/v1/admin/category/uploadImage，multipart 字段名 file（图片，50MB 以内）
// 响应 data 直接是完整图片 URL 字符串（如 http://localhost:7072/admin/images/category/xxx.jpg）
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/v1/admin/category/uploadImage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
