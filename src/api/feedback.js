import request from './request'

/**
 * 反馈记录 API
 */

/**
 * 分页查询反馈记录列表
 * @param {Object} params - { page, size, userSearch?, type?, status? }
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getFeedbackRecords(params) {
  return request.get('/feedback-records', { params })
}

/**
 * 获取反馈统计数据
 * @returns {Promise<{ total: number, pendingCount: number, processedCount: number, typeStats: Array<{type, count, percent}> }>}
 */
export function getFeedbackStats() {
  return request.get('/feedback-records/stats')
}

/**
 * 更新反馈状态（处理反馈）
 * @param {number} id
 * @param {Object} data - { status: 'pending' | 'processed', handledBy?: string, handledRemark?: string }
 */
export function updateFeedbackStatus(id, data) {
  return request.put(`/feedback-records/${id}/status`, data)
}
