# 操作日志（Change Log）

> append-only · 只增不改 · 每条一行
>
> 格式：`- YYYY-MM-DD | 操作类型 | 文件路径 | 一句话说明 | 操作人`
> 操作类型：新增 / 更新 / 废弃 / 删除 / 修正

---

- 2026-06-25 | 新增 | knowledge-base/README.md | 知识库入口说明 | Claude
- 2026-06-25 | 新增 | knowledge-base/SCHEMA.md | 文档格式规范（机器可校验） | Claude
- 2026-06-25 | 新增 | knowledge-base/MAINTENANCE.md | 维护手册 | Claude
- 2026-06-25 | 新增 | knowledge-base/system/architecture.md | 架构全景初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/system/call-chains.md | 典型调用链初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/system/service-dependencies.md | 服务与依赖清单初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/system/glossary.md | 术语表初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/system/url-routes.md | URL 路由表初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/modules/inventory.md | 功能模块清单初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/pitfalls/README.md | 坑点索引初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/conventions/coding-style.md | 编码与命名规范初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/insights/README.md | 团队经验入口初始化 | Claude
- 2026-06-25 | 新增 | knowledge-base/raw/README.md | 素材归档说明初始化 | Claude
- 2026-06-25 | 新增 | workspace/README.md | 工作台使用说明初始化 | Claude
- 2026-06-25 | 新增 | system/技术栈.md | 前后端全栈技术清单与版本 | Claude
- 2026-06-25 | 新增 | system/目录结构.md | 项目目录组织与职责详解 | Claude
- 2026-06-25 | 新增 | system/URL路由.md | 路由表与菜单对应关系 | Claude
- 2026-06-25 | 新增 | modules/layout.md | Layout 布局组件详解（侧边栏、导航、响应式） | Claude
- 2026-06-25 | 新增 | modules/api.md | API 接口层模块（request + 各业务接口） | Claude
- 2026-06-25 | 新增 | modules/views.md | Views 页面组件（通用模式 + 各页面功能） | Claude
- 2026-06-25 | 新增 | conventions/Vue编码规范.md | Vue Composition API 编码规范 | Claude
- 2026-06-25 | 新增 | conventions/目录组织约定.md | 目录与文件组织原则 | Claude
- 2026-06-25 | 更新 | knowledge-base/README.md | 更新入口文档，整合新增内容与快速跳转 | Claude
- 2026-06-25 | 新增 | src/views/RiskInterceptionRecords.vue | 风险拦截记录数据看板页面 | Claude
- 2026-06-25 | 新增 | src/api/riskInterception.js | 风险拦截 API 模块 | Claude
- 2026-06-25 | 新增 | mock/riskInterception.js | 风险拦截 Mock 数据 | Claude
- 2026-06-25 | 修改 | src/main.js | 注册 ECharts 组件 | Claude
- 2026-06-25 | 修改 | src/router.js | 新增风险拦截记录和用户管理路由 | Claude
- 2026-06-25 | 修改 | src/layout/Layout.vue | 新增菜单项（风险拦截记录、用户管理） | Claude
- 2026-06-25 | 新增 | knowledge-base/modules/risk-interception.md | 风险拦截模块文档 | Claude
- 2026-06-25 | 更新 | knowledge-base/modules/inventory.md | 添加风险拦截记录模块 | Claude
- 2026-06-25 | 更新 | knowledge-base/system/URL路由.md | 添加风险拦截记录和用户管理路由 | Claude
- 2026-06-29 | 修改 | src/views/PsychologicalWarnings.vue | 移除 P3 等级筛选/卡片/映射,统计网格改 3 列,补充业务说明 | Claude
- 2026-06-29 | 修改 | mock/warning.js | 删除 3 条 P3 假数据,统计字段移除 p3Count | Claude
- 2026-06-29 | 修改 | src/api/warning.js | 更新 getWarningStats JSDoc 与业务规则注释 | Claude
- 2026-06-29 | 更新 | knowledge-base/raw/API接口契约.md | 心理风险预警章节统一为 P0/P1/P2,说明 P3 不入库不发邮件 | Claude
- 2026-06-29 | 更新 | knowledge-base/modules/views.md | 心理风险预警视图描述同步 P3 退出后台 | Claude
- 2026-06-29 | 修改 | src/views/PsychologicalWarnings.vue | 兜底过滤历史 P3 数据,文案改写"P0-P2",tooltip 可键盘聚焦,导出文件名改 csv 加 P0-P2 后缀 | Claude
- 2026-06-29 | 修改 | mock/warning.js | STATS_BY_PERIOD 与列表 P0/P1/P2 实际条数对齐,补充 id 缺号注释 | Claude
- 2026-06-29 | 更新 | docs/QUICK_REFERENCE.md | 顶部加 2026-06-29 P3 退出后台说明,关键词属性段同步当前实现 | Claude

