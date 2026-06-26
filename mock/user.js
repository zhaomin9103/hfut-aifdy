/**
 * 用户管理 Mock 数据与接口
 * 统一响应格式：{ code: 0, message: 'ok', data: ... }
 *
 * 业务规则：
 *   - admin 为预设管理员账号，不支持重置密码 / 删除（isAdmin: true）
 *   - 新增用户：用户名 = 姓名全拼，重复则在末尾递增数字（zhangsan / zhangsan1 / zhangsan2 ...）
 *   - 默认密码：hfut123456，重置密码亦还原为该值
 */

import { pinyin } from 'pinyin-pro'

const DEFAULT_PASSWORD = 'hfut123456'

// ===== 数据源 =====
// password 字段为明文，仅用于 Mock 演示；真实后端应存储加盐哈希且永不下发
let users = [
  { id: 1, username: 'admin', name: '系统管理员', employeeId: '', isAdmin: true, password: 'admin123', createdAt: '2026-01-01 00:00:00' },
  { id: 2, username: 'wangmin', name: '王敏', employeeId: 'T2018001', isAdmin: false, password: DEFAULT_PASSWORD, createdAt: '2026-03-12 09:20:00' },
  { id: 3, username: 'liguoqiang', name: '李国强', employeeId: 'T2016045', isAdmin: false, password: DEFAULT_PASSWORD, createdAt: '2026-03-15 14:05:00' },
  { id: 4, username: 'sunli', name: '孙丽', employeeId: 'T2019132', isAdmin: false, password: DEFAULT_PASSWORD, createdAt: '2026-04-02 10:30:00' },
  { id: 5, username: 'wujun', name: '吴军', employeeId: '', isAdmin: false, password: DEFAULT_PASSWORD, createdAt: '2026-04-20 16:45:00' }
]

let idSeq = 100

// 简易 token 解析：mock-token-<userId>（仅用于演示，真实后端用 JWT）
function parseToken(authHeader) {
  if (!authHeader) return null
  const token = String(authHeader).replace(/^Bearer\s+/i, '')
  const match = token.match(/^mock-token-(\d+)$/)
  if (!match) return null
  return users.find(u => u.id === Number(match[1])) || null
}

// ===== 工具函数 =====
function success(data) {
  return { code: 0, message: 'ok', data }
}

function fail(message) {
  return { code: 1, message, data: null }
}

function paginate(list, page, size) {
  const p = Number(page) || 1
  const s = Number(size) || 10
  const start = (p - 1) * s
  return { list: list.slice(start, start + s), total: list.length, page: p, size: s }
}

function getIdFromUrl(url, fromEnd = 0) {
  const path = url.split('?')[0]
  const segments = path.split('/').filter(Boolean)
  return Number(segments[segments.length - 1 - fromEnd])
}

// 姓名 → 全拼（小写、无音调、去除非字母字符）
function toPinyin(name) {
  const py = pinyin(name, { toneType: 'none', type: 'array' }).join('')
  return py.toLowerCase().replace(/[^a-z]/g, '')
}

// 生成唯一用户名：全拼重复时递增数字
function generateUsername(name) {
  const base = toPinyin(name) || 'user'
  let candidate = base
  let counter = 0
  const existing = new Set(users.map(u => u.username))
  while (existing.has(candidate)) {
    counter += 1
    candidate = `${base}${counter}`
  }
  return candidate
}

// ===== 路由定义（固定路径在前，:id 动态路径在后） =====
export default [
  // 登录（仅用户名 + 密码）
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      const username = String(body?.username || '').trim()
      const password = String(body?.password || '')
      if (!username || !password) return fail('请输入用户名和密码')
      const user = users.find(u => u.username === username)
      if (!user || user.password !== password) {
        return fail('用户名或密码错误')
      }
      return success({
        token: `mock-token-${user.id}`,
        user: { id: user.id, username: user.username, name: user.name, isAdmin: user.isAdmin }
      })
    }
  },

  // 修改密码（校验旧密码）
  {
    url: '/api/auth/change-password',
    method: 'post',
    response: ({ body, headers }) => {
      const current = parseToken(headers?.authorization)
      if (!current) return fail('登录已过期，请重新登录')
      const oldPassword = String(body?.oldPassword || '')
      const newPassword = String(body?.newPassword || '')
      if (!oldPassword || !newPassword) return fail('请填写完整的密码信息')
      if (current.password !== oldPassword) return fail('旧密码不正确')
      if (newPassword.length < 6) return fail('新密码长度不能少于6位')
      if (newPassword === oldPassword) return fail('新密码不能与旧密码相同')
      current.password = newPassword
      return success({ id: current.id })
    }
  },

  // 分页查询列表（keyword 模糊匹配 用户名/姓名/工号）
  {
    url: '/api/users',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, size = 10, keyword } = query
      let filtered = [...users]
      if (keyword) {
        const kw = String(keyword).trim().toLowerCase()
        filtered = filtered.filter(u =>
          u.username.toLowerCase().includes(kw) ||
          u.name.toLowerCase().includes(kw) ||
          (u.employeeId && u.employeeId.toLowerCase().includes(kw))
        )
      }
      // admin 置顶，其余按创建时间倒序
      filtered.sort((a, b) => {
        if (a.isAdmin) return -1
        if (b.isAdmin) return 1
        return a.createdAt < b.createdAt ? 1 : -1
      })
      // 列表不下发密码字段
      const page2 = paginate(filtered, page, size)
      page2.list = page2.list.map(({ password, ...rest }) => rest)
      return success(page2)
    }
  },

  // 新增用户
  {
    url: '/api/users',
    method: 'post',
    response: ({ body }) => {
      const name = String(body?.name || '').trim()
      const employeeId = String(body?.employeeId || '').trim()
      if (!name) return fail('姓名不能为空')

      const username = generateUsername(name)
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      const newUser = {
        id: (idSeq += 1),
        username,
        name,
        employeeId,
        isAdmin: false,
        password: DEFAULT_PASSWORD,
        createdAt: now
      }
      users.push(newUser)
      // 返回含明文初始密码，供前端展示复制（不含已存储的 password 字段本身）
      const { password, ...rest } = newUser
      return success({ ...rest, password: DEFAULT_PASSWORD })
    }
  },

  // 重置密码
  {
    url: '/api/users/:id/reset-password',
    method: 'post',
    response: ({ url }) => {
      const id = getIdFromUrl(url, 1)
      const user = users.find(u => u.id === id)
      if (!user) return fail('用户不存在')
      if (user.isAdmin) return fail('管理员账号不支持该操作')
      user.password = DEFAULT_PASSWORD
      return success({ id, password: DEFAULT_PASSWORD })
    }
  },

  // 删除用户
  {
    url: '/api/users/:id',
    method: 'delete',
    response: ({ url }) => {
      const id = getIdFromUrl(url, 0)
      const user = users.find(u => u.id === id)
      if (!user) return fail('用户不存在')
      if (user.isAdmin) return fail('管理员账号不支持该操作')
      users = users.filter(u => u.id !== id)
      return success({ id })
    }
  }
]
