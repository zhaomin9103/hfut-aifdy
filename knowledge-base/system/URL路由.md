---
title: URL 路由清单
category: system
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [路由, URL, 菜单]
---

# URL 路由清单

> 从 `router.js` 提取的完整路由表。**路由即菜单**，唯一事实来源。

---

## 1. 路由总览

根路径 `/` 使用 `Layout.vue` 作为外壳，默认重定向到 `/agents`。所有业务页面作为子路由懒加载。

| 路径 | 路由名称 | 组件 | 菜单标题 | 对应 API 模块 | 图标 |
|------|----------|------|----------|----------------|------|
| `/` | - | `Layout` → 重定向 `/agents` | - | - | - |
| `/agents` | `Agents` | `views/AgentManagement.vue` | 智能体管理 | `api/agent.js` | `Cpu` |
| `/categories` | `Categories` | `views/CategoryManagement.vue` | 分类管理 | `api/category.js` | `Grid` |
| `/quick-questions` | `QuickQuestions` | `views/QuickQuestionConfig.vue` | 快捷问题配置 | `api/quickQuestion.js` | `ChatDotRound` |
| `/feedback` | `Feedback` | `views/FeedbackRecords.vue` | 用户反馈 | `api/feedback.js` | `ChatLineSquare` |
| `/psychological-warnings` | `PsychologicalWarnings` | `views/PsychologicalWarnings.vue` | 心理风险预警 | `api/warning.js` | `Warning` |
| `/risk-interception` | `RiskInterception` | `views/RiskInterceptionRecords.vue` | 风险拦截记录 | `api/riskInterception.js` | `Document` |
| `/user-management` | `UserManagement` | `views/UserManagement.vue` | 用户管理 | （待实现） | `User` |

**来源**：`src/router.js:4-42`

---

## 2. 路由模式

采用 **HTML5 History 模式**（`createWebHistory()`），URL 无 `#` 符号。

**部署要求**：
- 后端/Nginx 需配置：将未匹配的路径回退到 `index.html`
- 否则刷新页面会 404

---

## 3. 路由元信息（meta）

每个子路由的 `meta.title` 用于：
1. 侧边栏菜单名（见 `layout/Layout.vue:15-34`）
2. 顶栏面包屑的当前页标题（见 `layout/Layout.vue:64`）

**约定**：修改菜单名 = 修改 `router.js` 对应路由的 `meta.title`。

---

## 4. 路由与侧边栏对应关系

侧边栏导航在 `layout/Layout.vue:14-35` 硬编码渲染：

```vue
<nav class="nav-menu">
  <div class="nav-label">运营管理</div>
  <router-link to="/agents">智能体管理</router-link>
  <router-link to="/categories">分类管理</router-link>
  <router-link to="/quick-questions">快捷问题配置</router-link>
  <router-link to="/feedback">用户反馈</router-link>
  <router-link to="/psychological-warnings">心理风险预警</router-link>
  <router-link to="/risk-interception">风险拦截记录</router-link>
  <router-link to="/user-management">用户管理</router-link>
</nav>
```

**维护提示**：
- 新增路由后，需同步在 `Layout.vue` 添加对应的 `<router-link>`
- 或改为从路由表自动生成菜单（避免双重维护）

---

## 5. 路由懒加载

所有页面组件使用动态导入：

```js
component: () => import('./views/AgentManagement.vue')
```

**好处**：
- 首屏加载快，只加载当前页面
- 按路由分包，减少初始 JS 体积

---

## 6. 路由守卫

**当前状态**：无全局路由守卫（无登录校验、权限拦截）。

**待补充功能**：
- [ ] 登录态校验（未登录跳转 `/login`）
- [ ] 权限校验（不同角色看到不同菜单）
- [ ] 页面标题设置（`document.title`）

---

## 7. 面包屑逻辑

顶栏面包屑固定为：`首页 / {{ 当前页标题 }}`

实现位置：`layout/Layout.vue:60-66`

```vue
<el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
</el-breadcrumb>
```

`currentTitle` 来自 `route.meta.title`。

---

## 8. 路由表源码

**位置**：`src/router.js`

```js
const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/agents',
    children: [
      {
        path: '/agents',
        name: 'Agents',
        component: () => import('./views/AgentManagement.vue'),
        meta: { title: '智能体管理' }
      },
      // ... 其他 4 个子路由
    ]
  }
]
```

---

## 9. 关联文档

- 目录结构：`目录结构.md`
- 模块清单：`../modules/inventory.md`
- Layout 组件详解：`../modules/layout.md`
