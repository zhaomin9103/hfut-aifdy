---
title: 架构全景
category: system
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [架构, 技术栈, 概览]
---

# 架构全景

> 「合工大 AI 辅导员 - 后台管理」前端工程的整体技术结构。

---

## 1. 一句话定位

这是一个基于 **Vue 3 + Element Plus** 的单页后台管理应用（SPA），为「合工大 AI 辅导员」提供智能体、分类、快捷问题、用户反馈、心理风险预警等运营管理能力。当前阶段通过前端 Mock 演示，交付时切换到真实后端。

---

## 2. 技术栈

| 层 | 技术 | 版本 | 来源 |
|----|------|------|------|
| 框架 | Vue | ^3.4.0 | `package.json` |
| UI 组件库 | Element Plus | ^2.9.0 | `package.json` |
| 图标 | @element-plus/icons-vue | ^2.3.1 | `package.json` |
| 路由 | vue-router | ^4.3.0 | `package.json` |
| HTTP | axios | ^1.18.1 | `package.json` |
| 构建 | Vite | ^5.4.0 | `package.json` |
| Mock | mockjs + vite-plugin-mock | ^1.1.0 / ^3.0.2 | `package.json` |

构建/运行脚本（`package.json`）：

```bash
npm run dev      # 启动开发服务器（端口 3000，自动打开）
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

---

## 3. 分层结构

```
后台管理/
├── index.html              入口 HTML
├── vite.config.js          构建配置（含 Mock 开关与后端代理）
├── .env.development        开发环境变量（默认开 Mock）
├── .env.production         生产环境变量（关 Mock）
├── mock/                   前端假数据（Mock 模式下拦截 /api）
└── src/
    ├── main.js             应用入口：注册 Element Plus、图标、路由
    ├── App.vue             根组件
    ├── router.js           路由表（5 个业务页面 + Layout 壳）
    ├── layout/Layout.vue   布局外壳（侧边栏 + 内容区）
    ├── views/              5 个业务页面
    ├── api/                接口层（每个业务一个文件 + 统一 request）
    └── styles/index.css    全局样式
```

---

## 4. 关键设计

### 4.1 接口统一封装
所有请求走 `src/api/request.js` 的 axios 实例：
- `baseURL` 取环境变量 `VITE_API_BASE_URL`，缺省 `/api`。
- 响应拦截器统一**拆包**：约定后端返回 `{ code, message, data }`，`code === 0` 时直接返回 `data`，否则弹错并 reject。
- 因此**业务代码拿到的就是 `data` 本身**，不需要再 `res.data.data`。
- 详见 `src/api/request.js:28-53` 与 `system/call-chains.md`。

### 4.2 Mock / 真实后端切换
由环境变量 `VITE_USE_MOCK` 控制（见 `vite.config.js:8`）：
- `true`：`vite-plugin-mock` 拦截 `/api`，返回 `mock/` 下假数据。
- `false`：Vite dev server 把 `/api` 代理到 `http://localhost:8080`（联调时改 target）。

### 4.3 路由即菜单
`src/router.js` 中每个子路由的 `meta.title` 同时用作侧边栏菜单名，路由表是页面的唯一事实来源。详见 `system/url-routes.md`。

---

## 5. 数据流向（自顶向下）

```
用户操作 (views/*.vue)
   ↓ 调用
api/*.js 业务方法
   ↓ 复用
api/request.js (axios 实例 + 拦截器)
   ↓ HTTP /api/*
[Mock 拦截] 或 [代理到真实后端:8080]
   ↓ 返回 { code, message, data }
响应拦截器拆包 → 业务拿到 data
```

---

## 6. 关联文档

- 调用链细节：`system/call-chains.md`
- 依赖清单：`system/service-dependencies.md`
- 路由表：`system/url-routes.md`
- 模块清单：`modules/inventory.md`
- 术语：`system/glossary.md`
