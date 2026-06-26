---
title: 服务与依赖
category: system
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [依赖, 环境变量, 后端]
---

# 服务与依赖

> 项目运行所依赖的内部模块、外部服务、第三方库与环境配置。

---

## 1. 运行时依赖（dependencies）

| 包 | 版本 | 用途 |
|----|------|------|
| vue | ^3.4.0 | 核心框架 |
| vue-router | ^4.3.0 | 前端路由 |
| element-plus | ^2.9.0 | UI 组件库 |
| @element-plus/icons-vue | ^2.3.1 | 图标集（在 `main.js` 全量注册） |
| axios | ^1.18.1 | HTTP 客户端 |

## 2. 开发依赖（devDependencies）

| 包 | 版本 | 用途 |
|----|------|------|
| vite | ^5.4.0 | 构建与开发服务器 |
| @vitejs/plugin-vue | ^5.1.0 | Vue 单文件组件支持 |
| mockjs | ^1.1.0 | 生成假数据 |
| vite-plugin-mock | ^3.0.2 | 开发态拦截 `/api` 返回 Mock |

---

## 3. 外部服务依赖

| 服务 | 地址 | 触发条件 | 配置位置 |
|------|------|----------|----------|
| 真实后端 API | `http://localhost:8080`（联调默认） | `VITE_USE_MOCK=false` | `vite.config.js:27` |
| Mock 服务 | 进程内（vite-plugin-mock） | `VITE_USE_MOCK=true` | `vite.config.js:14` |

后端契约：`{ code, message, data }`，`code === 0` 为成功。详见根目录 `API接口契约.md`。

---

## 4. 环境变量

| 变量 | 开发默认 | 生产默认 | 含义 |
|------|----------|----------|------|
| `VITE_API_BASE_URL` | `/api` | `/api` | 接口前缀；生产可改为真实域名或走网关 |
| `VITE_USE_MOCK` | `true` | `false` | 是否启用前端 Mock |

来源：`.env.development`、`.env.production`。

---

## 5. 内部模块依赖关系

```
main.js
 ├─ App.vue
 ├─ router.js ──→ layout/Layout.vue ──→ views/*.vue
 └─ ElementPlus + 全部图标

views/*.vue ──→ api/*.js ──→ api/request.js ──→ axios
```

- `api/request.js` 是所有 API 模块的公共底座，**改动需谨慎**（影响全站请求）。
- `views` 与 `api` 一一对应：`AgentManagement ↔ agent.js`、`FeedbackRecords ↔ feedback.js` 等。

---

## 6. 关联文档

- 架构全景：`system/architecture.md`
- 模块清单：`modules/inventory.md`
