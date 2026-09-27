import request from './request'

// 全量分类树：一级分类 + children 子分类
export function loadCategoryTree() {
  return request.get('/category/loadCategory')
}
