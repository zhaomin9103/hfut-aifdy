import request from './request'

/**
 * 快捷问题配置 API
 */

/**
 * 分页查询快捷问题列表
 * @param {Object} params - { page, size, title? }
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getQuickQuestions(params) {
  return request.get('/quick-questions', { params })
}

/**
 * 创建快捷问题
 * @param {Object} data - { title, agentId }
 */
export function createQuickQuestion(data) {
  return request.post('/quick-questions', data)
}

/**
 * 更新快捷问题
 * @param {number} id
 * @param {Object} data - { title?, agentId? }
 */
export function updateQuickQuestion(id, data) {
  return request.put(`/quick-questions/${id}`, data)
}

/**
 * 删除快捷问题
 * @param {number} id
 */
export function deleteQuickQuestion(id) {
  return request.delete(`/quick-questions/${id}`)
}
