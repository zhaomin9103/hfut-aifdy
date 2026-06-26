---
title: URL 路由表
category: system
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [路由, 菜单, vue-router]
---

# URL 路由表

> 前端路由即菜单。唯一事实来源：`src/router.js`。

---

## 1. 路由结构

根路径 `/` 挂载 `Layout.vue`（侧边栏 + 内容区外壳），默认重定向到 `/agents`。所有业务页面是其子路由，按需懒加载。

| 路径 | name | 页面组件 | 菜单标题 (meta.title) | API 模块 |
|------|------|----------|------------------------|----------|
| `/` | — | Layout（重定向 → `/agents`） | — | — |
| `/agents` | Agents | `views/AgentManagement.vue` | 智能体管理 | `api/agent.js` |
| `/categories` | Categories | `views/CategoryManagement.vue` | 分类管理 | `api/category.js` |
| `/quick-questions` | QuickQuestions | `views/QuickQuestionConfig.vue` | 快捷问题配置 | `api/quickQuestion.js` |
| `/feedback` | Feedback | `views/FeedbackRecords.vue` | 用户反馈 | `api/feedback.js` |
| `/psychological-warnings` | PsychologicalWarnings | `views/PsychologicalWarnings.vue` | 心理风险预警 | `api/warning.js` |

来源：`src/router.js:4-42`。

---

## 2. 约定

- **新增页面 = 新增子路由**：在 `router.js` 的 `children` 里加一项，`meta.title` 即菜单名。
- 路由组件一律 `() => import('./views/Xxx.vue')` 懒加载。
- 路由模式为 `createWebHistory`（HTML5 History），部署时需后端/网关把未知路径回退到 `index.html`。

---

## 3. 关联文档

- 模块明细：`modules/inventory.md`
- 架构：`system/architecture.md`
