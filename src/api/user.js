import request from './request'

/**
 * 用户管理 API
 * 后端响应统一格式：{ code, message, data }，由 request 拦截器拆包
 */

/**
 * 分页查询用户列表
 * @param {Object} params - { page, size, keyword? } keyword 按 用户名/姓名/工号 模糊匹配
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getUsers(params) {
  return request.get('/users', { params })
}

/**
 * 新增用户
 * @param {Object} data - { name: string, employeeId?: string }
 *   用户名由后端依据姓名全拼自动生成（重复则递增数字），默认密码 hfut123456
 * @returns {Promise<{id, username, name, employeeId, password}>} 返回含明文初始密码
 */
export function createUser(data) {
  return request.post('/users', data)
}

/**
 * 重置用户密码（重置为默认密码 hfut123456）
 * @param {number} id
 * @returns {Promise<{id, password}>} 返回重置后的明文密码
 */
export function resetUserPassword(id) {
  return request.post(`/users/${id}/reset-password`)
}

/**
 * 删除用户
 * @param {number} id
 * @returns {Promise<{id}>}
 */
export function deleteUser(id) {
  return request.delete(`/users/${id}`)
}

/**
 * 登录（仅支持用户名 + 密码）
 * @param {Object} data - { username: string, password: string }
 * @returns {Promise<{token: string, user: {id, username, name, isAdmin}}>}
 */
export function login(data) {
  return request.post('/auth/login', data)
}

/**
 * 修改当前登录用户密码（需校验旧密码）
 * @param {Object} data - { oldPassword: string, newPassword: string }
 * @returns {Promise<{id}>}
 */
export function changePassword(data) {
  return request.post('/auth/change-password', data)
}
