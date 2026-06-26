# 知识库（Knowledge Base）

> 团队大脑 · 持久累积 · 所有人共享

本目录是「**合工大 AI 辅导员 - 后台管理**」项目的**长期知识沉淀区**。它遵循 LLM 工程化的「知识/任务/代码三分离」架构：

| 层 | 目录 | 性质 | 职责 |
|----|------|------|------|
| 知识 | `knowledge-base/` | 持久累积 | 团队共享的稳定知识：架构、约定、坑点、经验 |
| 任务 | `workspace/` | 一次性 | 当下进行中的具体任务工作台，用完即弃 |
| 代码 | `src/`、`mock/` 等 | 源码 | 真正运行的代码仓库 |

核心理念：**让知识脱离个人大脑,沉淀为团队资产**。新人、AI 协作者都能通过本目录快速理解项目全貌，而不必反复追问老人或翻遍源码。

---

## 项目概览

**技术栈**：Vue 3 + Element Plus + Vite（前端）| Spring Boot 3 + MyBatis-Plus（后端）| MySQL（数据库）

**主色调**：`#3748FF`（蓝紫色）| **字体**：Outfit + JetBrains Mono

**功能模块**：智能体管理、分类管理、快捷问题配置、用户反馈、心理风险预警

---

## 目录导览

```
knowledge-base/
├── README.md                    ← 你在这里（入口说明 + 快速导航）
├── SCHEMA.md                    ← 文档格式规范（机器可校验）
├── MAINTENANCE.md               ← 维护手册（怎么更新知识库）
├── log.md                       ← 操作日志（append-only 变更记录）
│
├── system/                      ← 系统结构
│   ├── architecture.md          架构全景（数据流、拆包机制）
│   ├── 技术栈.md                 技术栈清单（前后端全栈 + 版本）
│   ├── 目录结构.md               项目目录组织与各目录职责
│   ├── URL路由.md                路由表（路由即菜单，唯一事实来源）
│   ├── call-chains.md           调用链（请求拆包与错误处理责任）
│   ├── service-dependencies.md  服务依赖（依赖包、环境变量、内部模块）
│   └── glossary.md              术语表（业务术语 + 技术术语 + 状态枚举）
│
├── modules/                     ← 功能模块
│   ├── inventory.md             模块清单（5 大业务模块总览）
│   ├── layout.md                Layout 布局组件详解（侧边栏、导航、响应式）
│   ├── api.md                   API 接口层（request.js + 各业务接口）
│   └── views.md                 Views 页面组件（通用模式 + 各页面功能）
│
├── conventions/                 ← 团队约定
│   ├── coding-style.md          编码与命名规范（旧版，已被下面两个替代）
│   ├── Vue编码规范.md            Vue 编码规范（Composition API、状态管理、异步请求）
│   └── 目录组织约定.md           目录与文件组织原则（扁平优于嵌套）
│
├── pitfalls/                    ← 坑点库
│   └── README.md                坑点索引（P0/P1/P2 分级 + 容易踩的点）
│
├── insights/                    ← 团队经验
│   └── README.md                经验模式（已沉淀 3 条：页面↔API 对应、拆包、Mock 切换）
│
└── raw/                         ← 素材归档
    └── README.md                只读原件说明（PRD、会议纪要、接口契约、设计稿）
```

---

## 怎么用

### 我是新成员 / AI 协作者，想快速上手

**5 分钟入门路径**：

1. **技术栈** → [`system/技术栈.md`](system/技术栈.md)  
   了解前后端技术选型与版本

2. **架构全景** → [`system/architecture.md`](system/architecture.md) 或 [`system/目录结构.md`](system/目录结构.md)  
   掌握整体结构与分层逻辑

3. **路由与模块** → [`system/URL路由.md`](system/URL路由.md) + [`modules/inventory.md`](modules/inventory.md)  
   知道有哪些页面、对应哪些接口

4. **规范速查** → [`conventions/Vue编码规范.md`](conventions/Vue编码规范.md) + [`conventions/目录组织约定.md`](conventions/目录组织约定.md)  
   保持代码风格一致

5. **避坑指南** → [`pitfalls/README.md`](pitfalls/README.md)  
   扫一眼常见坑点，少走弯路

---

### 我要开发一个新功能

1. **在 `workspace/` 下开一个任务目录**（见 [`workspace/README.md`](../workspace/README.md)）  
   格式：`日期_任务名`，如 `2026-06-25_新增通知模块`

2. **开发中**  
   草稿、试错、临时数据都放在任务目录里，不污染知识库

3. **任务收尾（关键）**  
   - **回写知识**：把本次得到的稳定结论沉淀到 `knowledge-base/` 对应目录
   - **更新 log.md**：在 [`log.md`](log.md) 追加变更记录
   - **清理工作台**：无用草稿删除，想留档的搬到 `raw/`

**新增模块标准流程**：参见 [`conventions/目录组织约定.md`](conventions/目录组织约定.md) 第 5 节

---

### 我发现知识库内容过时了

- 直接修正相应文档，并在 [`log.md`](log.md) 记录  
- 维护规则详见 [`MAINTENANCE.md`](MAINTENANCE.md)

---

## 三条铁律

1. **知识库只放稳定结论**，不放临时草稿（草稿放 [`workspace/`](../workspace/)）
2. **所有变更必须在 [`log.md`](log.md) 留痕**（append-only）
3. **格式必须符合 [`SCHEMA.md`](SCHEMA.md)**，否则无法被工具校验和检索

---

## 快速跳转

### 系统理解

- [技术栈清单](system/技术栈.md) —— 前后端全栈技术与版本
- [架构全景](system/architecture.md) —— 分层结构与数据流
- [目录结构](system/目录结构.md) —— 各目录职责详解
- [URL 路由表](system/URL路由.md) —— 路由即菜单
- [调用链](system/call-chains.md) —— 请求拆包与错误处理
- [术语表](system/glossary.md) —— 业务与技术术语

### 功能模块

- [模块清单](modules/inventory.md) —— 5 大业务模块总览
- [Layout 组件](modules/layout.md) —— 布局外壳详解
- [API 接口层](modules/api.md) —— 接口封装规范
- [Views 页面](modules/views.md) —— 页面组件通用模式

### 规范约定

- [Vue 编码规范](conventions/Vue编码规范.md) —— Composition API、状态管理、异步请求
- [目录组织约定](conventions/目录组织约定.md) —— 文件命名与层级原则

### 经验与坑点

- [团队经验](insights/README.md) —— 已沉淀 3 条模式
- [坑点库](pitfalls/README.md) —— P0/P1/P2 分级问题清单

---

## 维护提示

- **更新频率**：每次功能开发收尾时回写知识
- **质量节奏**：每周扫一遍 `pitfalls/` 看是否有可关闭的坑；每月对齐 `system/` 与代码一致性
- **废弃文档**：不直接删，先标记 `status: deprecated` 并说明替代文档
- **所有变更必须在 [`log.md`](log.md) 留痕**

详见 [`MAINTENANCE.md`](MAINTENANCE.md)。
