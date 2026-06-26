/**
 * 登录态管理（基于 localStorage）
 * 真实后端应使用 httpOnly Cookie 或更安全的 token 存储策略
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'currentUser'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function isLoggedIn() {
  return !!getToken()
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
