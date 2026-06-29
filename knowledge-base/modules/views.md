---
title: Views 页面组件模块
category: modules
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [Views, 页面, 组件, 业务]
---

# Views 页面组件模块

> 业务页面组件层，与路由一一对应。

**目录位置**：`src/views/`

---

## 1. 职责

`views/` 目录包含所有业务页面组件，每个组件对应一个路由：

1. 展示数据（表格、卡片、统计）
2. 处理用户交互（搜索、筛选、提交表单）
3. 调用 `api/` 层接口
4. 管理页面状态（loading、分页、表单）

---

## 2. 文件清单

```
views/
├── AgentManagement.vue           # 智能体管理（/agents）
├── CategoryManagement.vue        # 分类管理（/categories）
├── QuickQuestionConfig.vue       # 快捷问题配置（/quick-questions）
├── FeedbackRecords.vue           # 用户反馈（/feedback）
└── PsychologicalWarnings.vue     # 心理风险预警（/psychological-warnings）
```

**约定**：
- 文件名用 PascalCase（大驼峰）
- 每个页面 = 一个独立 `.vue` 单文件组件
- 与 `api/` 层一一对应（如 `AgentManagement.vue` 调用 `api/agent.js`）

---

## 3. 通用页面结构模式

所有页面遵循统一的 UI 结构：

```vue
<template>
  <div class="page-container">
    <!-- 1. 卡片容器 -->
    <div class="card-compact">
      
      <!-- 2. 工具栏：筛选 + 操作按钮 -->
      <div class="card-toolbar">
        <div class="toolbar-left">
          <el-select>...</el-select>  <!-- 筛选器 -->
          <el-input>...</el-input>    <!-- 搜索框 -->
        </div>
        <el-button type="primary">添加</el-button>
      </div>

      <!-- 3. 数据表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column>...</el-table-column>
      </el-table>

      <!-- 4. 分页器 -->
      <div class="card-footer">
        <div class="footer-info">共 {{ total }} 条</div>
        <el-pagination>...</el-pagination>
      </div>
    </div>

    <!-- 5. 弹窗：新增/编辑表单 -->
    <el-dialog v-model="dialogVisible">
      <el-form>...</el-form>
    </el-dialog>
  </div>
</template>

<script setup>
// 状态管理
const loading = ref(false)
const tableData = ref([])
const pageInfo = reactive({ page: 1, size: 10, total: 0 })
const dialogVisible = ref(false)
const form = reactive({ ... })

// 数据加载
async function loadData() {
  loading.value = true
  try {
    const res = await getXxx({ ...pageInfo, ...筛选条件 })
    tableData.value = res.list
    pageInfo.total = res.total
  } catch (e) {
    // 错误已由拦截器统一提示，这里只需复位 UI
  } finally {
    loading.value = false
  }
}

// 表单提交
async function handleSubmit() {
  await formRef.value.validate()
  await createXxx(form) // 或 updateXxx(id, form)
  ElMessage.success('操作成功')
  dialogVisible.value = false
  loadData() // 刷新列表
}
</script>
```

---

## 4. 各页面详解

### 4.1 AgentManagement.vue —— 智能体管理

**路由**：`/agents`

**功能**：
- 查询列表（支持分类、名称筛选）
- 新增/编辑智能体（名称、分类、链接、排序）
- 切换启用/停用状态（`el-switch`）
- 删除智能体（带二次确认）
- 表内直接修改排序（`el-input-number`）

**关键交互**：
- 分类筛选器：从 `getCategories` 动态加载选项
- 排序数字框：`@change` 触发 `updateAgent` 保存
- 状态开关：`@change` 触发 `updateAgent` 保存

**API 调用**：
```js
import { getAgents, createAgent, updateAgent, deleteAgent } from '../api/agent'
import { getCategories } from '../api/category'
```

**表格列**：ID、名称、链接、分类、状态、排序、操作

---

### 4.2 CategoryManagement.vue —— 分类管理

**路由**：`/categories`

**功能**：
- 查询分类列表（支持名称搜索）
- 新增/编辑分类（名称）
- 删除分类
- 调整排序

**API 调用**：
```js
import { getCategories, createCategory, updateCategory, deleteCategory } 
  from '../api/category'
```

**表格列**：ID、分类名称、排序、操作

---

### 4.3 QuickQuestionConfig.vue —— 快捷问题配置

**路由**：`/quick-questions`

**功能**：
- 查询快捷问题列表（支持标题搜索）
- 新增/编辑快捷问题（标题、关联智能体）
- 删除快捷问题

**API 调用**：
```js
import { getQuickQuestions, createQuickQuestion, updateQuickQuestion, deleteQuickQuestion } 
  from '../api/quickQuestion'
```

**表格列**：ID、问题标题、关联智能体、操作

---

### 4.4 FeedbackRecords.vue —— 用户反馈

**路由**：`/feedback`

**功能**：
- 查询反馈列表（支持用户、类型、状态筛选）
- 查看反馈详情
- 处理反馈（标记已处理 + 备注）
- 查看统计数据（总数、待处理、已处理、类型分布）

**API 调用**：
```js
import { getFeedbackRecords, getFeedbackStats, updateFeedbackStatus } 
  from '../api/feedback'
```

**表格列**：ID、用户、反馈类型、反馈内容、提交时间、状态、操作人、操作

**特殊交互**：
- 统计卡片：顶部展示数据概览
- 处理弹窗：输入处理人 + 备注

---

### 4.5 PsychologicalWarnings.vue —— 心理风险预警

**路由**：`/psychological-warnings`

**功能**：
- 查询预警列表（支持风险等级、触发类型、学生、时间范围筛选）
- 查看预警详情（含关联对话、邮件日志）
- 重新发送预警邮件
- 标记已处理（单条/批量）
- 导出预警记录
- 查看统计数据（P0/P1/P2 分级统计；P3 由 AI 端内疏导,后台不留档/不发邮件）

**API 调用**：
```js
import { 
  getWarnings, 
  getWarningDetail, 
  getWarningDialogues, 
  getEmailLogs,
  resendWarningEmail, 
  markWarningHandled, 
  batchMarkHandled,
  getWarningStats,
  exportWarnings 
} from '../api/warning'
```

**表格列**：ID、学生、风险等级、触发类型、触发时间、邮件状态、处理状态、操作

**特殊交互**：
- 风险等级标签：P0（红色）、P1（橙色）、P2（黄色）
- 批量操作：支持勾选多条记录批量标记
- 详情抽屉：侧边栏滑出，展示对话记录与邮件日志
- 导出：点击触发文件下载

**复杂度**：此页面接口最多、功能最丰富。

---

## 5. 编码模式与规范

### 5.1 Composition API

所有页面使用 `<script setup>` 语法：

```vue
<script setup>
import { ref, reactive, onMounted } from 'vue'

const loading = ref(false)
const pageInfo = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => {
  loadData()
})
</script>
```

**优势**：
- 代码更简洁
- 逻辑复用方便（可提取为 composables）
- TypeScript 类型推断更好

### 5.2 状态管理

**无全局状态管理**（无 Vuex/Pinia），各页面独立管理状态：

| 状态 | 类型 | 用途 |
|------|------|------|
| `loading` | `ref(false)` | 加载态 |
| `tableData` | `ref([])` | 表格数据 |
| `pageInfo` | `reactive({ page, size, total })` | 分页信息 |
| `dialogVisible` | `ref(false)` | 弹窗显隐 |
| `form` | `reactive({ ... })` | 表单数据 |
| `isEdit` | `ref(false)` | 是新增还是编辑 |
| `editingId` | `ref(null)` | 编辑中的记录 ID |

### 5.3 表单校验

使用 Element Plus 的 `el-form` + `rules`：

```js
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

async function handleSubmit() {
  await formRef.value.validate() // 校验失败会 reject
  // 提交逻辑...
}
```

### 5.4 分页处理

```js
const pageInfo = reactive({ page: 1, size: 10, total: 0 })

async function loadData() {
  const res = await getXxx({ 
    page: pageInfo.page, 
    size: pageInfo.size,
    ...筛选条件 
  })
  tableData.value = res.list
  pageInfo.total = res.total
}

// 分页器绑定
<el-pagination
  v-model:current-page="pageInfo.page"
  v-model:page-size="pageInfo.size"
  :total="pageInfo.total"
  @size-change="loadData"
  @current-change="loadData"
/>
```

### 5.5 搜索筛选

**模式**：
1. 搜索框 `@input` 触发 `resetPage()`（回到第 1 页）
2. 搜索框 `@clear` 或筛选器 `@change` 触发 `loadData()`

```js
function resetPage() {
  pageInfo.page = 1
  loadData()
}
```

**防抖**：当前未做防抖处理，频繁输入会多次请求。待优化。

### 5.6 错误处理

```js
async function loadData() {
  loading.value = true
  try {
    const res = await getXxx(...)
    tableData.value = res.list
  } catch (e) {
    // 错误已由 request.js 拦截器统一提示
    // 这里不需要重复弹错，只需复位 UI
  } finally {
    loading.value = false
  }
}
```

**关键**：`catch` 不重复弹错，只做 UI 复位。

---

## 6. 样式约定

### 6.1 作用域样式

页面级样式用 `<style scoped>`，避免污染全局。

### 6.2 工具类复用

常用布局类在 `styles/index.css` 定义：

| 类 | 用途 |
|----|------|
| `.page-container` | 页面容器 |
| `.card-compact` | 卡片（无内边距，供表格使用） |
| `.card-toolbar` | 工具栏（搜索 + 按钮） |
| `.card-footer` | 底部分页区 |
| `.flex-between` | 两端对齐 |
| `.flex-center` | 居中对齐 |

---

## 7. 维护清单

| 场景 | 操作 |
|------|------|
| 新增页面 | 1. 在 `views/` 创建 `XxxManagement.vue`<br>2. 在 `router.js` 添加路由<br>3. 在 `Layout.vue` 添加菜单项<br>4. 在 `api/` 创建对应接口文件 |
| 修改表格列 | 修改 `<el-table-column>` |
| 修改筛选条件 | 修改 `.card-toolbar` 中的筛选器组件 |
| 修改表单字段 | 修改 `<el-dialog>` 中的 `<el-form-item>` |
| 优化搜索防抖 | 在 `@input` 处理函数中加 `debounce` |

---

## 8. 已知问题

- [ ] 搜索框无防抖，频繁输入会多次请求
- [ ] 无搜索结果空态处理
- [ ] 表格数据量大时无虚拟滚动
- [ ] 删除操作无撤销机制
- [ ] 无页面级 keep-alive（切换路由后状态丢失）

---

## 9. 关联文档

- API 层：`api.md`
- 布局组件：`layout.md`
- 路由表：`../system/URL路由.md`
- 编码规范：`../conventions/Vue编码规范.md`
