import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * 统一 axios 实例
 * 后端响应约定格式：{ code: number, message: string, data: any }
 *   - code === 0 表示成功（其它值表示业务错误）
 *   - 分页接口的 data 形如：{ list: [], total: number, page: number, size: number }
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

// 请求拦截器：统一注入 token（按需启用）
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：统一拆包与错误处理
request.interceptors.response.use(
  response => {
    const res = response.data
    // 约定 code === 0 为成功
    if (res.code === 0) {
      return res.data
    }
    // 业务错误：弹提示并抛出，调用方 catch 可拿到 message
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || 'Error'))
  },
  error => {
    // HTTP 层错误（网络、超时、5xx 等）
    const status = error.response?.status
    let message = error.message
    if (status === 401) {
      message = '登录已过期，请重新登录'
      // 清除登录态并跳转登录页
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      message = '没有权限访问该资源'
    } else if (status >= 500) {
      message = '服务器异常，请稍后重试'
    }
    ElMessage.error(message || '网络异常')
    return Promise.reject(error)
  }
)

export default request
