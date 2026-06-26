---
title: API 接口层模块
category: modules
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [API, 接口, axios, request]
---

# API 接口层模块

> 前端接口封装层，所有后端调用的唯一入口。

**目录位置**：`src/api/`

---

## 1. 职责

`api/` 目录负责：
1. 封装所有后端 HTTP 请求
2. 统一请求/响应拦截（鉴权、拆包、错误提示）
3. 提供类型化的接口函数（带 JSDoc 注释）
4. 隔离业务层与 axios 实现

**原则**：业务页面**不直接使用 axios**，只调用 `api/` 导出的函数。

---

## 2. 文件清单

```
api/
├── request.js          # axios 实例（核心，所有请求复用）
├── agent.js            # 智能体管理接口
├── category.js         # 分类管理接口
├── quickQuestion.js    # 快捷问题配置接口
├── feedback.js         # 用户反馈接口
└── warning.js          # 心理风险预警接口
```

**约定**：
- **一个业务领域 = 一个 API 文件**（与 `views/` 一一对应）
- 每个文件导出该领域的全部接口函数
- 所有函数复用 `request.js` 的 axios 实例

---

## 3. 核心：request.js

**文件位置**：`src/api/request.js`

### 3.1 职责

1. 创建统一的 axios 实例
2. **请求拦截器**：注入 `Authorization` 令牌
3. **响应拦截器**：
   - 业务成功（`code === 0`）：拆包返回 `data`
   - 业务失败（`code !== 0`）：自动 `ElMessage.error` + reject
   - HTTP 错误（401/403/5xx）：转中文提示 + reject

### 3.2 关键代码

```js
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

// 请求拦截器：注入 token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：拆包与错误处理
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 0) {
      return res.data  // 拆包：业务层直接拿到 data
    }
    // 业务错误
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message))
  },
  error => {
    // HTTP 错误
    const status = error.response?.status
    let message = error.message
    if (status === 401) message = '登录已过期，请重新登录'
    else if (status === 403) message = '没有权限访问该资源'
    else if (status >= 500) message = '服务器异常，请稍后重试'
    ElMessage.error(message || '网络异常')
    return Promise.reject(error)
  }
)
```

**核心机制**：
- ✅ **自动拆包**：业务层直接拿到 `data`，不需要 `res.data.data`
- ✅ **统一弹错**：业务层 `catch` 只需复位 UI，不必重复弹提示

---

## 4. 业务接口模块

### 4.1 agent.js —— 智能体管理

**位置**：`src/api/agent.js`

| 函数 | 方法 | 路径 | 参数 | 返回 |
|------|------|------|------|------|
| `getAgents` | GET | `/agents` | `{ page, size, category?, name? }` | `{ list, total, page, size }` |
| `createAgent` | POST | `/agents` | `{ name, category, link, sortOrder }` | - |
| `updateAgent` | PUT | `/agents/:id` | `{ name?, category?, link?, sortOrder?, status? }` | - |
| `deleteAgent` | DELETE | `/agents/:id` | - | - |

### 4.2 category.js —— 分类管理

**位置**：`src/api/category.js`

| 函数 | 方法 | 路径 | 参数 | 返回 |
|------|------|------|------|------|
| `getCategories` | GET | `/categories` | `{ page, size, name? }` | `{ list, total, page, size }` |
| `createCategory` | POST | `/categories` | `{ name }` | - |
| `updateCategory` | PUT | `/categories/:id` | `{ name?, sortOrder? }` | - |
| `deleteCategory` | DELETE | `/categories/:id` | - | - |

### 4.3 quickQuestion.js —— 快捷问题配置

**位置**：`src/api/quickQuestion.js`

| 函数 | 方法 | 路径 | 参数 | 返回 |
|------|------|------|------|------|
| `getQuickQuestions` | GET | `/quick-questions` | `{ page, size, title? }` | `{ list, total, page, size }` |
| `createQuickQuestion` | POST | `/quick-questions` | `{ title, agentId }` | - |
| `updateQuickQuestion` | PUT | `/quick-questions/:id` | `{ title?, agentId? }` | - |
| `deleteQuickQuestion` | DELETE | `/quick-questions/:id` | - | - |

### 4.4 feedback.js —— 用户反馈

**位置**：`src/api/feedback.js`

| 函数 | 方法 | 路径 | 参数 | 返回 |
|------|------|------|------|------|
| `getFeedbackRecords` | GET | `/feedback-records` | `{ page, size, userSearch?, type?, status? }` | `{ list, total, page, size }` |
| `getFeedbackStats` | GET | `/feedback-records/stats` | - | `{ total, pendingCount, processedCount, typeStats }` |
| `updateFeedbackStatus` | PUT | `/feedback-records/:id/status` | `{ status, handledBy?, handledRemark? }` | - |

### 4.5 warning.js —— 心理风险预警

**位置**：`src/api/warning.js`

**特点**：接口最丰富，包含详情、对话记录、邮件日志、批量操作、导出等。

| 函数 | 方法 | 路径 | 用途 |
|------|------|------|------|
| `getWarnings` | GET | `/psychological-warnings` | 分页查询预警列表 |
| `getWarningDetail` | GET | `/psychological-warnings/:id` | 获取单条预警详情 |
| `getWarningDialogues` | GET | `/psychological-warnings/:id/dialogues` | 获取关联对话记录 |
| `getEmailLogs` | GET | `/psychological-warnings/:id/email-logs` | 获取邮件发送日志 |
| `resendWarningEmail` | POST | `/psychological-warnings/:id/resend-email` | 重新发送预警邮件 |
| `markWarningHandled` | PUT | `/psychological-warnings/:id/mark-handled` | 标记已处理 |
| `getWarningStats` | GET | `/psychological-warnings/stats` | 获取统计数据 |
| `batchMarkHandled` | POST | `/psychological-warnings/batch-mark-handled` | 批量标记已处理 |
| `exportWarnings` | GET | `/psychological-warnings/export` | 导出记录（返回 Blob） |

---

## 5. 命名规范

### 5.1 函数命名

**格式**：`动词 + 资源名`

| 动词 | 含义 | 示例 |
|------|------|------|
| `get` | 查询（单条或列表） | `getAgents`、`getWarningDetail` |
| `create` | 新增 | `createAgent` |
| `update` | 更新 | `updateAgent` |
| `delete` | 删除 | `deleteAgent` |
| `mark` | 标记状态 | `markWarningHandled` |
| `resend` | 重新发送 | `resendWarningEmail` |
| `batch` | 批量操作 | `batchMarkHandled` |
| `export` | 导出 | `exportWarnings` |

### 5.2 参数命名

- 查询参数对象：`params`
- 请求体对象：`data`
- 路径参数（如 id）：直接用具体名称

---

## 6. JSDoc 注释规范

每个导出函数都有完整的 JSDoc：

```js
/**
 * 分页查询智能体列表
 * @param {Object} params - { page, size, category?, name? }
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getAgents(params) {
  return request.get('/agents', { params })
}
```

**包含信息**：
- 功能说明
- 参数结构（必填与可选）
- 返回值结构

---

## 7. 分页接口约定

**统一格式**：

**请求参数**：
```ts
{ page: number, size: number, ...筛选项 }
```

**响应结构**：
```ts
{ list: Array, total: number, page: number, size: number }
```

**来源**：`request.js:8` 的注释约定。

---

## 8. 特殊响应类型

### 8.1 文件下载（Blob）

示例：`exportWarnings`

```js
export function exportWarnings(params) {
  return request.get('/psychological-warnings/export', {
    params,
    responseType: 'blob'  // 返回二进制文件流
  })
}
```

业务层需手动处理下载：

```js
const blob = await exportWarnings(params)
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = '预警记录.xlsx'
a.click()
```

---

## 9. 错误处理模式

### 9.1 拦截器已处理的

- ✅ 业务错误（`code !== 0`）：自动 `ElMessage.error`
- ✅ HTTP 错误（401/403/5xx）：自动转中文提示并弹出

### 9.2 业务层需处理的

页面 `catch` 只需：
1. 复位 loading 状态
2. 复位表单
3. 展示空态/错误占位

**不需要重复弹错**（拦截器已弹）。

---

## 10. 维护清单

| 场景 | 操作 |
|------|------|
| 新增业务模块 | 1. 创建 `api/newModule.js`<br>2. 导出该领域的接口函数<br>3. 复用 `request` 实例 |
| 修改后端地址 | 修改 `.env.development` 或 `.env.production` 的 `VITE_API_BASE_URL` |
| 修改超时时间 | 修改 `request.js:11` 的 `timeout` |
| 修改 token 存储 | 修改 `request.js:17` 的 `localStorage.getItem('token')` |
| 自定义错误处理 | 在业务层 `catch` 中处理，或修改 `request.js:39-52` 的拦截器逻辑 |

---

## 11. 关联文档

- 调用链：`../system/call-chains.md`
- 后端契约：根目录 `API接口契约.md`
- Views 组件：`views.md`
