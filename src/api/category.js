import request from './request'

/**
 * 分类管理 API
 */

/**
 * 分页查询分类列表
 * @param {Object} params - { page, size, name? }
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getCategories(params) {
  return request.get('/categories', { params })
}

/**
 * 创建分类
 * @param {Object} data - { name }
 */
export function createCategory(data) {
  return request.post('/categories', data)
}

/**
 * 更新分类
 * @param {number} id
 * @param {Object} data - { name?, sortOrder? }
 */
export function updateCategory(id, data) {
  return request.put(`/categories/${id}`, data)
}

/**
 * 删除分类
 * @param {number} id
 */
export function deleteCategory(id) {
  return request.delete(`/categories/${id}`)
}
