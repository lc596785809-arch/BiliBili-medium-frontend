import request from './request'
import clientRequest from './clientRequest'

export function loadCategoryTree() {
  return request.get('/api/v1/admin/category/loadCategory')
}

// 仅末级分类，供视频管理页的分类筛选下拉使用
export function loadLeafCategories() {
  return clientRequest.get('/api/v1/client/category/loadLastLevelCategory')
}

export function saveCategory(data) {
  return request.post('/api/v1/admin/category/saveCategory', data)
}

export function delCategory(categoryId) {
  return request.post('/api/v1/admin/category/delCategory', null, {
    params: { categoryId },
  })
}

export function updateSort(list) {
  return request.post('/api/v1/admin/category/updateSort', list)
}
