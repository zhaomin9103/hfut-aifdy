---
title: 术语表
category: system
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [术语, 词汇, glossary]
---

# 术语表

> 统一团队和 AI 协作者对项目专有名词的理解，避免歧义。

---

## 业务术语

| 术语 | 英文/标识 | 含义 |
|------|-----------|------|
| 智能体 | Agent | AI 辅导员中的一个可调用助手，含名称、分类、链接、排序、状态 |
| 分类 | Category | 智能体的归类维度，用于组织和筛选 |
| 快捷问题 | Quick Question | 预置的常见问题，供用户一键提问 |
| 用户反馈 | Feedback | 用户提交的意见/问题记录，含类型、状态、处理信息 |
| 心理风险预警 | Psychological Warning | 对话中识别出的心理风险信号，供运营介入 |

## 技术术语

| 术语 | 含义 |
|------|------|
| 拆包 | 响应拦截器把 `{code,message,data}` 中的 `data` 取出返回给业务层 |
| Mock 模式 | `VITE_USE_MOCK=true`，由前端假数据响应 `/api`，不依赖真实后端 |
| 联调模式 | `VITE_USE_MOCK=false`，`/api` 代理到真实后端 `:8080` |
| 业务错误 | `code !== 0`，区别于 HTTP 层错误（4xx/5xx） |
| 分页响应 | 形如 `{ list, total, page, size }` 的数据结构 |

## 状态枚举

| 上下文 | 取值 | 含义 |
|--------|------|------|
| 反馈状态 | `pending` / `processed` | 待处理 / 已处理 |
| 智能体状态 | `status` 字段 | 启用/停用（具体取值见 `mock/` 与后端契约） |
| 后端响应码 | `code === 0` | 成功；其它为业务错误 |

---

## 关联文档

- 接口契约原文：根目录 `API接口契约.md`
- 模块清单：`modules/inventory.md`
