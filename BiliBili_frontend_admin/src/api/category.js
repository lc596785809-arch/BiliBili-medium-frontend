import request from './request'

export function loadCategoryTree() {
  return request.get('/api/v1/admin/category/loadCategory')
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
