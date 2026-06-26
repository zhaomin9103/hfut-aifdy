# 心理风险预警功能优化

**日期**: 2026-06-25  
**版本**: v1.1.0  
**文件**: `src/views/PsychologicalWarnings.vue`

## 📋 变更概述

本次更新对心理风险预警模块进行了两项重要优化：
1. **简化详情弹窗**：移除概览 tab 中的触发方式和轮次信息
2. **新增高危关键词配置**：支持管理用于快路触发判断的高危关键词

---

## ✨ 功能详情

### 1. 详情弹窗优化

**变更内容**：
- ✅ 移除"触发方式"字段（快路/慢路触发）
- ✅ 移除"轮次信息"字段
- ✅ 保留"触发关键词"字段（如果有的话）
- ✅ "研判时间"字段占据完整一行（`:span="2"`）

**文件位置**：第 247-270 行

**优化前**：
```vue
<el-descriptions :column="2" border>
  <el-descriptions-item label="预警ID">...</el-descriptions-item>
  <el-descriptions-item label="会话ID">...</el-descriptions-item>
  <el-descriptions-item label="研判时间">...</el-descriptions-item>
  <el-descriptions-item label="触发方式">
    <el-tag :type="...">快路触发/慢路触发</el-tag>
  </el-descriptions-item>
  <el-descriptions-item label="轮次信息" v-if="...">
    第 X 轮
  </el-descriptions-item>
  <el-descriptions-item label="触发关键词" v-if="...">
    ...
  </el-descriptions-item>
</el-descriptions>
```

**优化后**：
```vue
<el-descriptions :column="2" border>
  <el-descriptions-item label="预警ID">...</el-descriptions-item>
  <el-descriptions-item label="会话ID">...</el-descriptions-item>
  <el-descriptions-item label="研判时间" :span="2">...</el-descriptions-item>
  <el-descriptions-item label="触发关键词" :span="2" v-if="...">
    ...
  </el-descriptions-item>
</el-descriptions>
```

---

### 2. 高危关键词配置功能

**功能描述**：
在页面顶部"风险等级统计"旁新增"高危关键词配置" tab，用于管理快路触发时的高危关键词。

**主要特性**：
- ✅ Tab 切换：风险等级统计 ↔ 高危关键词配置
- ✅ 关键词列表展示（表格形式）
- ✅ 添加/编辑/删除关键词
- ✅ 启用/禁用关键词开关
- ✅ 关键词属性：
  - 关键词内容
  - 触发级别（P0/P1/P2/P3）
  - 所属类别（情绪类、自伤自杀类等）
  - 说明
  - 启用状态

**UI 布局**：

```
┌─────────────────────────────────────────────────┐
│ 【风险等级统计】【高危关键词配置】              │  ← Tab切换
├─────────────────────────────────────────────────┤
│  [添加关键词] [刷新]                            │  ← 工具栏
│  ┌───────────────────────────────────────────┐  │
│  │ 关键词 | 触发级别 | 所属类别 | 说明 | ...  │  │
│  ├───────────────────────────────────────────┤  │
│  │  自杀  │   P0    │ 自伤自杀类│ ...│[编辑]│  │
│  │  想死  │   P0    │ 自伤自杀类│ ...│[删除]│  │
│  │  抑郁  │   P1    │  情绪类  │ ...│ 开关 │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**关键词编辑弹窗**：
- 关键词（必填，最多50字符）
- 触发级别（必填，下拉选择）
- 所属类别（必填，下拉选择）
- 说明（可选，最多200字符）
- 启用状态（开关）

---

## 🔧 技术实现

### 新增响应式状态

```javascript
// 顶部切换tab
const topSectionTab = ref('stats')

// 高危关键词配置
const keywordsLoading = ref(false)
const keywordsData = ref([])
const keywordDialogVisible = ref(false)
const keywordDialogMode = ref('add') // 'add' | 'edit'
const keywordFormRef = ref(null)
const keywordSubmitting = ref(false)
const keywordForm = reactive({
  id: null,
  keyword: '',
  level: 'P1',
  category: '',
  description: '',
  enabled: true
})
```

### 新增函数

| 函数名 | 功能描述 |
|--------|---------|
| `loadKeywords()` | 加载关键词列表 |
| `showAddKeywordDialog()` | 显示添加关键词弹窗 |
| `editKeyword(row)` | 编辑关键词 |
| `submitKeywordForm()` | 提交关键词表单（添加/编辑） |
| `toggleKeywordStatus(row)` | 切换关键词启用状态 |
| `deleteKeyword(row)` | 删除关键词 |

### Watch 监听

```javascript
// 监听顶部 tab 切换，首次切换到关键词配置时自动加载数据
watch(topSectionTab, (newTab) => {
  if (newTab === 'keywords' && keywordsData.value.length === 0) {
    loadKeywords()
  }
})
```

### Mock 数据示例

```javascript
keywordsData.value = [
  {
    id: 1,
    keyword: '自杀',
    level: 'P0',
    category: '自伤自杀类',
    description: '直接表达自杀意图',
    enabled: true,
    createdAt: '2024-01-15 10:30:00',
    switching: false
  },
  // ...
]
```

---

## 📝 待接入后端 API

当前使用 Mock 数据，需要对接以下 API：

```javascript
// 1. 获取关键词列表
GET /api/warnings/keywords
Response: { list: Keyword[] }

// 2. 添加关键词
POST /api/warnings/keywords
Body: { keyword, level, category, description, enabled }

// 3. 更新关键词
PUT /api/warnings/keywords/:id
Body: { keyword, level, category, description, enabled }

// 4. 更新关键词状态
PATCH /api/warnings/keywords/:id/status
Body: { enabled: boolean }

// 5. 删除关键词
DELETE /api/warnings/keywords/:id
```

**TODO 位置**：
- 第 686 行：`loadKeywords()` 函数
- 第 735 行：`submitKeywordForm()` 函数
- 第 751 行：`toggleKeywordStatus()` 函数
- 第 767 行：`deleteKeyword()` 函数

---

## 🎨 样式更新

新增样式类：

```css
.top-section-tabs          /* 顶部 tabs 容器 */
.keywords-config           /* 关键词配置区域 */
.keywords-toolbar          /* 关键词工具栏 */
```

---

## 🧪 测试建议

### 1. 详情弹窗测试
- [ ] 打开任意预警详情
- [ ] 确认"触发方式"和"轮次信息"不再显示
- [ ] 确认"研判时间"占据完整一行
- [ ] 确认"触发关键词"（如果有）正常显示

### 2. 关键词配置测试
- [ ] 切换到"高危关键词配置" tab
- [ ] 验证关键词列表正常加载
- [ ] 测试添加新关键词（包含表单验证）
- [ ] 测试编辑现有关键词
- [ ] 测试启用/禁用关键词开关
- [ ] 测试删除关键词（含确认弹窗）
- [ ] 验证所有必填字段的表单验证
- [ ] 验证字符数限制（关键词50字符，说明200字符）

### 3. 响应式测试
- [ ] 在不同屏幕尺寸下验证 tab 切换正常
- [ ] 验证关键词表格在小屏幕下的显示

---

## 🚀 部署说明

**影响范围**：
- 仅前端代码变更
- 不影响现有功能
- 关键词配置功能使用 Mock 数据，待后端 API 就绪后替换

**兼容性**：
- ✅ 向后兼容
- ✅ 无数据库迁移需求
- ⏳ 需要后端新增关键词管理 API

---

## 📊 数据结构

### Keyword 类型定义

```typescript
interface Keyword {
  id: number
  keyword: string          // 关键词内容，最多50字符
  level: 'P0' | 'P1' | 'P2' | 'P3'  // 触发级别
  category: string         // 所属类别
  description: string      // 说明，最多200字符
  enabled: boolean         // 是否启用
  createdAt: string        // 创建时间
  switching?: boolean      // 开关切换中（前端内部状态）
}
```

### 风险类别枚举

```javascript
const RISK_CATEGORIES = [
  '情绪类',
  '自伤自杀类',
  '人际关系类',
  '学业类',
  '家庭类',
  '创伤类',
  '成瘾类',
  '精神类',
  '发展类',
  '其他'
]
```

---

## ⚠️ 注意事项

1. **快路触发逻辑**：高危关键词配置用于快路触发的实时判断，后端需要在会话过程中实时检查用户输入是否包含启用的高危关键词。

2. **关键词匹配策略**：建议后端支持多种匹配模式：
   - 精确匹配
   - 包含匹配
   - 正则表达式匹配（高级用户）

3. **并发控制**：关键词启用/禁用操作添加了 `switching` 状态，防止重复点击。

4. **权限控制**：关键词配置属于敏感操作，建议后端添加权限校验，仅管理员可操作。

---

## 📖 相关文档

- [心理风险预警模块文档](../knowledge-base/modules/psychological-warnings.md)
- [API 接口规范](../api-specs/warnings.md)

---

## 👥 协作人员

- **前端开发**：已完成
- **后端开发**：待开发 API
- **测试**：待测试
- **产品验收**：待验收
