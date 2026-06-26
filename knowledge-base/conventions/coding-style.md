---
title: 编码与命名规范
category: conventions
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [规范, 命名, 编码风格]
---

# 编码与命名规范

> 本项目沿用的团队约定。新代码请保持一致；变更约定需评审后更新本文件。

---

## 1. 目录与文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面组件 | 大驼峰 PascalCase | `AgentManagement.vue` |
| 布局组件 | 大驼峰 | `Layout.vue` |
| API 模块 | 小驼峰 camelCase | `quickQuestion.js`、`agent.js` |
| 普通 JS | 小驼峰 | `request.js`、`router.js` |
| 知识库文档 | 连字符 kebab-case | `call-chains.md` |

约定：**一个业务模块 = 一个页面（PascalCase）+ 一个 API 文件（camelCase）**，名字保持对应。

---

## 2. API 层约定

- 每个业务领域单独一个文件，集中导出该领域的接口函数。
- 函数命名用「动词 + 资源」：`getAgents`、`createAgent`、`updateAgent`、`deleteAgent`。
- 所有请求复用 `api/request.js` 的实例，**不要单独 new axios**。
- 每个导出函数写 JSDoc，标明参数与返回结构（现有文件均已遵循）。
- 分页接口参数统一 `{ page, size, ...筛选项 }`，返回统一 `{ list, total, page, size }`。

---

## 3. 请求与错误处理

- 业务层直接消费拆包后的 `data`，不再剥 `code/message`。
- 业务错误与 HTTP 错误由 `request.js` 拦截器统一弹提示；页面 `catch` 只做 UI 复位。
- 接口契约以 `{ code, message, data }`、`code === 0` 成功 为准。

---

## 4. 路由约定

- 新页面在 `router.js` 的 `children` 注册，`meta.title` 同时作为侧边栏菜单名。
- 路由组件一律懒加载 `() => import(...)`。

---

## 5. 环境与配置

- 环境差异走 `.env.*` + `import.meta.env`，**不要在代码里硬编码后端地址**。
- Mock 开关：`VITE_USE_MOCK`；接口前缀：`VITE_API_BASE_URL`。

---

## 6. 通用代码风格

- 中文注释解释「为什么」，英文标识符命名「是什么」。
- 单文件聚焦单一职责，过大时拆分。
- 不可变优先：构造新对象而非原地修改共享状态。
- 在系统边界（用户输入、接口响应）做校验，不信任外部数据。

---

## 关联文档

- 调用链：`../system/call-chains.md`
- 路由表：`../system/url-routes.md`
