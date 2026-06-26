---
title: Vue 编码规范
category: conventions
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [编码规范, Vue, Composition API, 代码风格]
---

# Vue 编码规范

> 基于现有代码推断的编码风格与最佳实践。

---

## 1. 组件定义规范

### 1.1 使用 `<script setup>` 语法

**强制**：所有组件使用 Composition API + `<script setup>`，不使用 Options API。

```vue
<!-- ✅ 正确 -->
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

onMounted(() => {
  console.log('mounted')
})
</script>

<!-- ❌ 错误：不使用 Options API -->
<script>
export default {
  data() {
    return { count: 0 }
  },
  mounted() {
    console.log('mounted')
  }
}
</script>
```

### 1.2 导入顺序

**约定顺序**（参考 `AgentManagement.vue:142-146`）：

1. Vue 核心 API（ref、reactive、computed、onMounted 等）
2. Element Plus 组件/工具
3. Element Plus 图标
4. 本地 API 模块

```js
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Link } from '@element-plus/icons-vue'
import { getAgents, createAgent } from '../api/agent'
```

---

## 2. 响应式状态管理

### 2.1 `ref` vs `reactive`

| 类型 | 使用场景 | 示例 |
|------|----------|------|
| `ref()` | 基本类型、独立值、需要整体替换的数组/对象 | `const loading = ref(false)`<br>`const tableData = ref([])` |
| `reactive()` | 不会整体替换的对象（如分页信息、表单） | `const pageInfo = reactive({ page: 1, size: 10, total: 0 })`<br>`const form = reactive({ name: '', category: '' })` |

**为什么表格数据用 `ref`？**
- 每次加载会整体替换：`tableData.value = res.list`
- 如果用 `reactive`，需要 `Object.assign(tableData, res.list)` 才能保持响应性

**为什么分页信息用 `reactive`？**
- 只会修改部分属性：`pageInfo.total = res.total`
- 双向绑定时更方便：`v-model:current-page="pageInfo.page"`

### 2.2 状态初始化模式

**表单状态**：使用工厂函数 + `reactive`（参考 `AgentManagement.vue:161-167`）

```js
// 定义初始值工厂函数
const initForm = () => ({
  name: '',
  category: '',
  link: '',
  sortOrder: 0
})

// 创建响应式表单
const form = reactive(initForm())

// 重置表单
function resetForm() {
  Object.assign(form, initForm())
}
```

**好处**：
- 避免重复定义初始值
- 重置表单时保持响应性

---

## 3. 异步请求规范

### 3.1 标准模式

```js
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await getXxx({ ...params })
    tableData.value = res.list
    pageInfo.total = res.total
  } catch (e) {
    // 错误已由 request.js 拦截器统一提示
    // 这里不需要重复弹错，只需复位 UI
  } finally {
    loading.value = false
  }
}
```

**关键点**：
1. ✅ `try-catch-finally` 结构完整
2. ✅ `loading` 在 `finally` 复位（保证无论成功失败都会关闭）
3. ✅ `catch` 不重复弹错（拦截器已处理）
4. ❌ 不使用 `.then().catch().finally()` 链式写法（可读性差）

### 3.2 提交操作模式

```js
async function handleSubmit() {
  // 1. 表单校验
  await formRef.value.validate()
  
  // 2. 调用接口
  if (isEdit.value) {
    await updateXxx(editingId.value, form)
  } else {
    await createXxx(form)
  }
  
  // 3. 成功提示
  ElMessage.success('操作成功')
  
  // 4. 关闭弹窗
  dialogVisible.value = false
  
  // 5. 刷新列表
  loadData()
}
```

**注意**：
- 不包 `try-catch`（让错误向上冒泡，Element Plus 会处理校验失败）
- 成功后才关闭弹窗（失败时弹窗保持打开，用户可修改重试）

---

## 4. 模板规范

### 4.1 指令顺序

**推荐顺序**：

```vue
<el-input
  v-model="form.name"
  placeholder="请输入名称"
  clearable
  :disabled="loading"
  @input="handleInput"
  @clear="handleClear"
/>
```

1. `v-model`（双向绑定）
2. `placeholder`、`label` 等描述性属性
3. 布尔属性（`clearable`、`disabled`）
4. 动态绑定（`:prop`）
5. 事件监听（`@event`）

### 4.2 v-bind 简写

**强制**：使用 `:` 简写，不用 `v-bind:`

```vue
<!-- ✅ 正确 -->
<el-button :loading="loading" :disabled="disabled" />

<!-- ❌ 错误 -->
<el-button v-bind:loading="loading" v-bind:disabled="disabled" />
```

### 4.3 v-on 简写

**强制**：使用 `@` 简写，不用 `v-on:`

```vue
<!-- ✅ 正确 -->
<el-button @click="handleClick" />

<!-- ❌ 错误 -->
<el-button v-on:click="handleClick" />
```

### 4.4 条件渲染

- 频繁切换：用 `v-show`
- 初始不渲染：用 `v-if`
- 互斥条件：用 `v-if` + `v-else-if` + `v-else`

---

## 5. 命名规范

### 5.1 组件文件名

**PascalCase**（大驼峰）：`AgentManagement.vue`、`Layout.vue`

### 5.2 变量/函数名

**camelCase**（小驼峰）：

| 类型 | 命名 | 示例 |
|------|------|------|
| 状态变量 | 名词 | `loading`、`tableData`、`pageInfo` |
| 布尔变量 | is/has 前缀 | `isEdit`、`hasMore`、`dialogVisible` |
| 函数 | 动词开头 | `loadData`、`handleSubmit`、`resetForm` |
| 事件处理 | handle 前缀 | `handleClick`、`handleSubmit`、`handleDelete` |

### 5.3 常量

**UPPER_SNAKE_CASE**（大写蛇形）：

```js
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_PAGE_SIZE = 10
```

---

## 6. 表单校验

### 6.1 规则定义

```js
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  age: [
    { type: 'number', min: 1, max: 120, message: '年龄范围 1-120', trigger: 'change' }
  ]
}
```

**trigger 选择**：
- `blur`：失焦校验（输入框）
- `change`：值变化校验（选择器、开关）

### 6.2 校验时机

```js
// 提交时校验
async function handleSubmit() {
  await formRef.value.validate()
  // 通过后执行提交...
}

// 重置表单（清除校验状态）
function resetForm() {
  formRef.value.resetFields()
  Object.assign(form, initForm())
}
```

---

## 7. 事件处理

### 7.1 内联处理简单逻辑

```vue
<!-- ✅ 简单赋值/切换 -->
<el-button @click="dialogVisible = true">打开</el-button>
<el-button @click="count++">+1</el-button>

<!-- ✅ 带参数 -->
<el-button @click="handleDelete(row.id)">删除</el-button>
```

### 7.2 复杂逻辑提取为函数

```vue
<!-- ✅ 复杂逻辑 -->
<el-button @click="handleSubmit">提交</el-button>

<script setup>
async function handleSubmit() {
  // 多步骤逻辑...
}
</script>
```

---

## 8. 样式规范

### 8.1 作用域样式

**强制**：组件级样式使用 `<style scoped>`

```vue
<style scoped>
.page-container {
  padding: 20px;
}
</style>
```

### 8.2 优先使用工具类

**优先级**：工具类 > 自定义类

```vue
<!-- ✅ 复用工具类 -->
<div class="card-compact">
  <div class="card-toolbar">...</div>
</div>

<!-- ⚠️  仅在无适用工具类时自定义 -->
<div class="custom-header">...</div>

<style scoped>
.custom-header {
  /* 自定义样式 */
}
</style>
```

### 8.3 CSS 变量优先

**强制**：使用 `styles/index.css` 定义的 CSS 变量，不硬编码颜色

```css
/* ✅ 正确 */
.title {
  color: var(--ink-900);
  background: var(--brand);
}

/* ❌ 错误 */
.title {
  color: #0E1116;
  background: #3748FF;
}
```

---

## 9. 注释规范

### 9.1 函数注释（JSDoc）

**API 模块必须**，组件函数推荐：

```js
/**
 * 分页查询智能体列表
 * @param {Object} params - { page, size, category?, name? }
 * @returns {Promise<{list: Array, total: number, page: number, size: number}>}
 */
export function getAgents(params) {
  return request.get('/agents', { params })
}
```

### 9.2 代码块注释

复杂逻辑加注释说明意图：

```js
// 请求拦截器：统一注入 token（按需启用）
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## 10. 性能优化

### 10.1 懒加载路由

**强制**：路由组件必须懒加载

```js
// ✅ 正确
{
  path: '/agents',
  component: () => import('./views/AgentManagement.vue')
}

// ❌ 错误
import AgentManagement from './views/AgentManagement.vue'
{
  path: '/agents',
  component: AgentManagement
}
```

### 10.2 计算属性缓存

只读计算用 `computed`，不用 `method`：

```js
// ✅ 正确：有缓存
const currentTitle = computed(() => route.meta.title || '')

// ❌ 错误：每次都重新计算
function getCurrentTitle() {
  return route.meta.title || ''
}
```

### 10.3 v-for 必须有 key

```vue
<!-- ✅ 正确 -->
<el-option
  v-for="c in categoryOptions"
  :key="c"
  :label="c"
  :value="c"
/>

<!-- ❌ 错误 -->
<el-option
  v-for="c in categoryOptions"
  :label="c"
  :value="c"
/>
```

---

## 11. 待优化项

根据现有代码发现的可改进点：

- [ ] 搜索框加防抖（避免频繁请求）
- [ ] 提取公共组合式函数（`usePagination`、`useDialog`、`useTable`）
- [ ] 侧边栏菜单从路由表自动生成（避免双重维护）
- [ ] 表单重置使用 `formRef.value.resetFields()`（更彻底）
- [ ] 添加全局错误边界（`errorCaptured`）

---

## 12. 关联文档

- 目录组织约定：`目录组织约定.md`
- Views 组件模式：`../modules/views.md`
- API 层规范：`../modules/api.md`
