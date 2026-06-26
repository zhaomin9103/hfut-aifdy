---
title: Layout 布局组件
category: modules
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [Layout, 布局, 侧边栏, 导航]
---

# Layout 布局组件

> 后台管理的主布局外壳，定义了全局 UI 结构。

**文件位置**：`src/layout/Layout.vue`

---

## 1. 职责

`Layout.vue` 是所有业务页面的容器，提供：
1. 左侧边栏（品牌、导航菜单、用户信息）
2. 右侧主内容区（顶栏面包屑 + 页面内容）
3. 响应式布局（移动端隐藏侧边栏）

---

## 2. 整体结构

```vue
<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="brand-section">...</div>
      <nav class="nav-menu">...</nav>
      <div class="sidebar-footer">...</div>
    </aside>

    <!-- 主容器 -->
    <div class="main-container">
      <header class="top-bar">...</header>
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
```

**布局方式**：Flexbox 横向布局（`display: flex`），侧边栏固定宽度 236px，主容器自适应。

---

## 3. 侧边栏（.sidebar）

### 3.1 品牌区（.brand-section）

**位置**：`Layout.vue:5-11`

- **品牌标记**：AI 字母图标，带渐变背景与阴影
- **品牌文字**：「AI 辅导员」+ 「合肥工业大学」

### 3.2 导航菜单（.nav-menu）

**位置**：`Layout.vue:13-35`

**结构**：
- 分组标签：「运营管理」
- 5 个导航项，与路由一一对应

| 路由 | 菜单名 | 图标 |
|------|--------|------|
| `/agents` | 智能体管理 | `Cpu` |
| `/categories` | 分类管理 | `Grid` |
| `/quick-questions` | 快捷问题配置 | `ChatDotRound` |
| `/feedback` | 用户反馈 | `ChatLineSquare` |
| `/psychological-warnings` | 心理风险预警 | `Warning` |

**交互**：
- 当前激活路由高亮（`.active` 类）
- 激活项左侧显示蓝色竖条（`:before` 伪元素）

**维护提示**：新增路由后需手动在此添加对应 `<router-link>`。

### 3.3 用户信息区（.sidebar-footer）

**位置**：`Layout.vue:37-54`

- **用户头像**：「管」字，渐变背景
- **用户名**：系统管理员
- **角色**：admin
- **下拉菜单**：修改密码、退出登录（功能待实现）

---

## 4. 主容器（.main-container）

### 4.1 顶栏（.top-bar）

**位置**：`Layout.vue:59-67`

- **高度**：64px，固定定位（`position: sticky`）
- **背景**：半透明白色 + 毛玻璃效果（`backdrop-filter: blur(10px)`）
- **内容**：面包屑导航（`首页 / {{ 当前页标题 }}`）

**面包屑逻辑**：
```js
const currentTitle = computed(() => route.meta.title || '')
```

读取当前路由的 `meta.title`。

### 4.2 页面内容区（.page-content）

**位置**：`Layout.vue:70-72`

- **容器**：`<router-view />`，渲染当前路由对应的页面组件
- **内边距**：26px 28px
- **布局**：`display: flex; flex-direction: column; gap: 22px;`（卡片式布局，间距统一）

---

## 5. 响应式设计

**断点**：768px

```css
@media (max-width: 768px) {
  .sidebar { display: none; }
  .page-content { padding: 16px; }
}
```

移动端隐藏侧边栏，主内容全屏展示。

**待优化**：移动端缺少汉堡菜单，无法访问导航。

---

## 6. 设计细节

### 6.1 CSS 变量使用

全局变量定义在 `styles/index.css`，Layout 中引用：

| 变量 | 值 | 用途 |
|------|----|----|
| `var(--surface)` | `#FFFFFF` | 侧边栏背景 |
| `var(--line)` | `#ECEEF3` | 边框 |
| `var(--brand)` | `#3748FF` | 品牌色（激活态） |
| `var(--brand-soft)` | `#EEF0FF` | 激活项背景 |
| `var(--ink-900)` | `#0E1116` | 深色文字 |
| `var(--ink-600)` | `#4A4F5B` | 普通文字 |
| `var(--ink-400)` | `#9AA0AC` | 次要文字 |

### 6.2 粘性定位

侧边栏与顶栏均使用 `position: sticky`：
- **侧边栏**：`top: 0; height: 100vh;`（始终可见）
- **顶栏**：`top: 0; z-index: 10;`（滚动时固定在顶部）

---

## 7. 依赖与导入

**图标**：
```js
import { Cpu, Grid, ChatDotRound, ChatLineSquare, Warning, ArrowDown } 
  from '@element-plus/icons-vue'
```

**Vue API**：
```js
import { computed } from 'vue'
import { useRoute } from 'vue-router'
```

---

## 8. 维护清单

| 场景 | 操作 |
|------|------|
| 新增菜单项 | 1. 在 `router.js` 添加路由<br>2. 在 `Layout.vue:13-35` 添加 `<router-link>` |
| 修改菜单文字 | 修改 `router.js` 对应路由的 `meta.title` |
| 修改品牌信息 | 修改 `Layout.vue:6-10` 的文字与图标 |
| 修改侧边栏宽度 | 修改 `.sidebar { width: 236px }` |
| 实现用户下拉菜单 | 在 `Layout.vue:48-50` 绑定事件处理函数 |

---

## 9. 已知问题

- [ ] 移动端无汉堡菜单，无法访问导航
- [ ] 用户下拉菜单「修改密码」「退出登录」未实现
- [ ] 侧边栏菜单与路由表双重维护，建议改为自动生成

---

## 10. 关联文档

- 路由表：`../system/URL路由.md`
- 全局样式：`src/styles/index.css`
- 设计规范：根目录 `风格稿.html`
