import request from './request'

/**
 * 心理风险预警 API
 */

/**
 * 分页查询预警记录列表
 * @param {Object} params - { page, size, riskLevel?, riskTypes?, emailStatus?, triggerType?, studentSearch?, startTime?, endTime? }
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getWarnings(params) {
  return request.get('/psychological-warnings', { params })
}

/**
 * 获取预警详情
 * @param {number} id
 * @returns {Promise<Object>}
 */
export function getWarningDetail(id) {
  return request.get(`/psychological-warnings/${id}`)
}

/**
 * 获取预警关联对话记录
 * @param {number} warningId
 * @returns {Promise<Array>}
 */
export function getWarningDialogues(warningId) {
  return request.get(`/psychological-warnings/${warningId}/dialogues`)
}

/**
 * 获取邮件发送日志
 * @param {number} warningId
 * @returns {Promise<Array>}
 */
export function getEmailLogs(warningId) {
  return request.get(`/psychological-warnings/${warningId}/email-logs`)
}

/**
 * 重新发送预警邮件
 * @param {number} id
 */
export function resendWarningEmail(id) {
  return request.post(`/psychological-warnings/${id}/resend-email`)
}

/**
 * 标记预警为已处理
 * @param {number} id
 * @param {Object} data - { handledBy: string, remark?: string }
 */
export function markWarningHandled(id, data) {
  return request.put(`/psychological-warnings/${id}/mark-handled`, data)
}

/**
 * 获取统计数据
 * 业务规则: P3 低危由 AI 端内疏导,后台不留档、不发邮件;此接口仅返回 P0/P1/P2 计数。
 * @param {Object} params - { period?: '7' | '30' | '180' | 'all' } 默认 '30'
 * @returns {Promise<Object>} - { period, p0Count, p1Count, p2Count }
 */
export function getWarningStats(params) {
  return request.get('/psychological-warnings/stats', { params })
}

/**
 * 批量标记已处理
 * @param {Array<number>} ids
 * @param {Object} data - { handledBy: string }
 */
export function batchMarkHandled(ids, data) {
  return request.post('/psychological-warnings/batch-mark-handled', { ids, ...data })
}

/**
 * 导出预警记录
 * @param {Object} params - 筛选参数
 * @returns {Promise<Blob>}
 */
export function exportWarnings(params) {
  return request.get('/psychological-warnings/export', {
    params,
    responseType: 'blob'
  })
}
