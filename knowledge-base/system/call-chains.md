---
title: 典型调用链
category: system
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [调用链, 数据流, axios]
---

# 典型调用链

> 描述从用户操作到数据返回的完整链路，帮助快速定位「数据从哪来、错误在哪冒」。

---

## 1. 通用请求链路

所有页面的数据请求都遵循同一条链路：

```
views/*.vue（页面）
  └─ 调用 api/*.js 导出的方法
       └─ request(.get/.post/.put/.delete)   ← src/api/request.js
            ├─ 请求拦截器：注入 Authorization（若 localStorage 有 token）
            ├─ 发出 HTTP 请求到 baseURL + path（默认 /api/...）
            │     ├─ Mock 模式：vite-plugin-mock 拦截，返回 mock/ 假数据
            │     └─ 真实模式：Vite 代理转发到 http://localhost:8080
            └─ 响应拦截器：
                 ├─ code === 0 → 返回 res.data（已拆包）
                 └─ code !== 0 → ElMessage.error + reject(message)
```

要点：
- **业务代码直接拿到 `data`**，无需再剥一层。参见 `src/api/request.js:29-38`。
- HTTP 层错误（401/403/5xx）在响应拦截器统一转成中文提示，见 `src/api/request.js:39-52`。

---

## 2. 示例：智能体列表加载

源码：`src/api/agent.js:12` + `src/views/AgentManagement.vue`

```
AgentManagement.vue 挂载/分页变化
  → getAgents({ page, size, category?, name? })
  → request.get('/agents', { params })
  → 返回 { list, total, page, size }
  → 页面渲染表格 + 分页器
```

约定：分页接口的 `data` 统一形如 `{ list, total, page, size }`（见 `src/api/request.js:8`）。

---

## 3. 示例：处理用户反馈（写操作）

源码：`src/api/feedback.js:29`

```
FeedbackRecords.vue 点击「处理」
  → updateFeedbackStatus(id, { status: 'processed', handledBy, handledRemark })
  → request.put(`/feedback-records/${id}/status`, data)
  → code === 0：成功（拦截器静默放行 data）
  → code !== 0：ElMessage 自动弹错，页面 catch 兜底
```

---

## 4. 错误处理责任划分

| 错误类型 | 在哪处理 | 表现 |
|----------|----------|------|
| 业务错误（code≠0） | `request.js` 响应拦截器 | 自动 `ElMessage.error(message)` |
| HTTP 错误（401/403/5xx） | `request.js` 响应拦截器 | 转中文提示后弹出 |
| 页面级兜底 | 各 `views/*.vue` 的 `catch` | loading 复位、空态展示等 |

**结论**：页面通常不需要重复弹错，`catch` 主要用于复位 UI 状态。

---

## 5. 关联文档

- 接口封装细节：`system/architecture.md` 第 4.1 节
- 模块与接口对应：`modules/inventory.md`
