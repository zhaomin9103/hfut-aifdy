---
title: 功能模块清单
category: modules
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [模块, 功能, 清单]
---

# 功能模块清单

> 现有功能模块导览。每个模块 = 一个页面 + 一个 API 文件。

---

## 模块总览

| 模块 | 页面组件 | API 文件 | 路由 | 状态 |
|------|----------|----------|------|------|
| 智能体管理 | `views/AgentManagement.vue` | `api/agent.js` | `/agents` | 已实现 |
| 分类管理 | `views/CategoryManagement.vue` | `api/category.js` | `/categories` | 已实现 |
| 快捷问题配置 | `views/QuickQuestionConfig.vue` | `api/quickQuestion.js` | `/quick-questions` | 已实现 |
| 用户反馈 | `views/FeedbackRecords.vue` | `api/feedback.js` | `/feedback` | 已实现 |
| 心理风险预警 | `views/PsychologicalWarnings.vue` | `api/warning.js` | `/psychological-warnings` | 已实现 |
| 风险拦截记录 | `views/RiskInterceptionRecords.vue` | `api/riskInterception.js` | `/risk-interception` | 已实现 |

公共基础设施：`layout/Layout.vue`（外壳）、`api/request.js`（统一请求）、`styles/index.css`（全局样式）。

---

## 1. 智能体管理

- **职责**：维护智能体（名称、分类、链接、排序、状态）的增删改查。
- **接口**（`api/agent.js`）：
  - `getAgents({ page, size, category?, name? })` → 分页列表
  - `createAgent({ name, category, link, sortOrder })`
  - `updateAgent(id, { name?, category?, link?, sortOrder?, status? })`
  - `deleteAgent(id)`

## 2. 分类管理

- **职责**：维护智能体分类维度。
- **接口**：见 `api/category.js`（增删改查，结构与 agent 类似）。

## 3. 快捷问题配置

- **职责**：配置预置的常见问题，供用户一键提问。
- **接口**：见 `api/quickQuestion.js`。

## 4. 用户反馈

- **职责**：查看用户反馈、统计、处理状态流转。
- **接口**（`api/feedback.js`）：
  - `getFeedbackRecords({ page, size, userSearch?, type?, status? })` → 分页列表
  - `getFeedbackStats()` → `{ total, pendingCount, processedCount, typeStats }`
  - `updateFeedbackStatus(id, { status, handledBy?, handledRemark? })`

## 5. 心理风险预警

- **职责**：展示对话中识别的心理风险信号，支持运营介入。
- **接口**：见 `api/warning.js`。

## 6. 风险拦截记录

- **职责**：多维度展示风险拦截统计数据，包含时间趋势、分类分布、用户分析。
- **接口**（`api/riskInterception.js`）：
  - `getRiskStats({ period })` → 聚合统计数据（概览、分类分布、趋势、TOP用户、Controversial专项）
- **特色**：
  - 时间周期切换（近7天、30天、180天、累计）
  - ECharts 多图表可视化（饼图、柱状图、折线图）
  - 响应式布局，支持移动端
  - 详见 `risk-interception.md`

---

## 维护提示

- 新增模块时，请同时更新本清单、`system/url-routes.md` 与 `log.md`。
- 各接口的字段细节以根目录 `API接口契约.md` 和 `api/*.js` 注释为准。
