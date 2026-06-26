import request from './request'

/**
 * 智能体管理 API
 */

/**
 * 分页查询智能体列表
 * @param {Object} params - { page, size, category?, name? }
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getAgents(params) {
  return request.get('/agents', { params })
}

/**
 * 创建智能体
 * @param {Object} data - { name, category, link, sortOrder }
 */
export function createAgent(data) {
  return request.post('/agents', data)
}

/**
 * 更新智能体
 * @param {number} id
 * @param {Object} data - { name?, category?, link?, sortOrder?, status? }
 */
export function updateAgent(id, data) {
  return request.put(`/agents/${id}`, data)
}

/**
 * 删除智能体
 * @param {number} id
 */
export function deleteAgent(id) {
  return request.delete(`/agents/${id}`)
}
