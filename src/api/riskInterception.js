import request from './request'

/**
 * 风险拦截记录 API
 */

/**
 * 获取风险拦截统计数据（聚合接口）
 * @param {Object} params - { period: '7' | '30' | '180' | 'all' }
 * @returns {Promise<Object>} - 包含 overview、categoryDistribution、categoryTrend、topUsers、controversialData
 */
export function getRiskStats(params) {
  return request.get('/risk-interception/stats', { params })
}
