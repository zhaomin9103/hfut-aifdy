# 风险拦截记录数据看板 实施计划

> **给代理工作者：** 必需的子技能：使用 codecraft:sp-subagent（推荐）或 codecraft:plans 逐任务实施此计划。步骤使用复选框（`- [ ]`）语法进行跟踪。

**目标：** 为后台管理系统新增风险拦截记录数据看板页面，展示拦截概览、违规分类分布、高频用户TOP 10、Controversial专项数据，支持时间周期切换。

**架构：** 基于 Vue 3 + Element Plus + ECharts 实现数据可视化看板。使用 Mock 数据演示，接口层预留真实 API 对接能力。组件分为4大模块：拦截概览（统计卡片+饼图）、违规分类（柱状图+折线图）、用户维度（TOP 10表格）、Controversial专项（饼图+折线图）。

**技术栈：** Vue 3 Composition API、Element Plus、ECharts 5、vue-echarts、mockjs、Vite

---

## 文件结构

### 新增文件

1. **`src/api/riskInterception.js`** - 风险拦截 API 模块
   - 职责：封装风险拦截统计接口，提供 `getRiskStats()` 方法

2. **`src/views/RiskInterceptionRecords.vue`** - 风险拦截记录页面组件
   - 职责：主页面，包含时间周期选择、4大数据模块、图表配置
   - 包含：状态管理、数据加载、图表配置计算、响应式布局

3. **`mock/riskInterception.js`** - Mock 数据文件
   - 职责：提供风险拦截统计数据的 Mock 实现
   - 包含：辅助函数生成趋势数据、分类数据

### 修改文件

4. **`src/main.js`** - 应用入口
   - 修改：注册 ECharts 组件（PieChart、BarChart、LineChart）
   - 修改：全局注册 vue-echarts 组件

5. **`src/router.js`** - 路由配置
   - 修改：新增 /risk-interception 和 /user-management 路由

6. **`src/layout/Layout.vue`** - 布局组件
   - 修改：侧边栏新增"风险拦截记录"和"用户管理"菜单项
   - 修改：导入 Document 和 User 图标

7. **`package.json`** - 依赖清单
   - 修改：新增 echarts 和 vue-echarts 依赖

8. **`mock/index.js`** - Mock 入口
   - 修改：导入并导出 riskInterception Mock 配置

---

## 任务分解

### 任务 1：安装依赖

**文件：**
- 修改：`package.json`

- [ ] **步骤 1：安装 ECharts 和 vue-echarts**

```bash
npm install echarts vue-echarts
```

运行后 `package.json` 的 `dependencies` 将新增：
```json
"echarts": "^5.x.x",
"vue-echarts": "^7.x.x"
```

- [ ] **步骤 2：验证安装**

```bash
npm list echarts vue-echarts
```

预期输出包含版本号，无 error。

- [ ] **步骤 3：提交**

```bash
git add package.json package-lock.json
git commit -m "chore: install echarts and vue-echarts dependencies"
```

---

### 任务 2：创建 API 模块

**文件：**
- 创建：`src/api/riskInterception.js`

- [ ] **步骤 1：创建 API 文件**

创建 `src/api/riskInterception.js`，内容：

```javascript
import request from './request'

/**
 * 风险拦截记录 API
 */

/**
 * 获取风险拦截统计数据（聚合接口）
 * @param {Object} params - { period: '7' | '30' | '180' | 'all' }
 * @returns {Promise<Object>} - 包含 overview、categoryDistribution、categoryTrend、topUsers、controversialData
 */
export function getRiskStats(params) {
  return request.get('/risk-interception/stats', { params })
}
```

- [ ] **步骤 2：验证导入**

在浏览器开发者工具 Console 中验证（页面加载后）：
```javascript
import { getRiskStats } from './api/riskInterception.js'
```

无语法错误即可。

- [ ] **步骤 3：提交**

```bash
git add src/api/riskInterception.js
git commit -m "feat: add risk interception API module"
```

---

### 任务 3：创建 Mock 数据

**文件：**
- 创建：`mock/riskInterception.js`
- 修改：`mock/index.js`

- [ ] **步骤 1：创建 Mock 文件**

创建 `mock/riskInterception.js`，完整内容：

```javascript
import Mock from 'mockjs'

// 辅助函数：生成分类趋势数据
function generateCategoryTrend(days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    result.push({
      date: date.toISOString().split('T')[0],
      violence: Mock.Random.integer(10, 25),
      politics: Mock.Random.integer(8, 20),
      pornography: Mock.Random.integer(5, 15),
      privacy: Mock.Random.integer(3, 12),
      illegal: Mock.Random.integer(2, 10),
      rumor: Mock.Random.integer(1, 8)
    })
  }
  return result
}

// 辅助函数：生成 Controversial 趋势数据
function generateControversialTrend(days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    result.push({
      date: date.toISOString().split('T')[0],
      count: Mock.Random.integer(15, 40)
    })
  }
  return result
}

export default [
  {
    url: '/api/risk-interception/stats',
    method: 'get',
    response: ({ query }) => {
      const { period = '7' } = query
      
      // 根据 period 生成不同数量的趋势数据点
      const daysCount = period === '7' ? 7 : period === '30' ? 30 : period === '180' ? 180 : 365
      
      return {
        code: 0,
        message: '成功',
        data: {
          overview: {
            totalRequests: Mock.Random.integer(8000, 12000),
            blockedCount: Mock.Random.integer(1000, 1500),
            blockRate: '12.5%',
            inputBlockCount: Mock.Random.integer(400, 600),
            outputBlockCount: Mock.Random.integer(600, 900),
            safeCount: Mock.Random.integer(4000, 5000),
            unsafeCount: Mock.Random.integer(3000, 4000),
            controversialCount: Mock.Random.integer(800, 1200)
          },
          
          categoryDistribution: [
            { category: 'violence', name: '暴力', count: 120 },
            { category: 'politics', name: '政治敏感', count: 85 },
            { category: 'pornography', name: '色情', count: 60 },
            { category: 'privacy', name: '隐私泄露', count: 45 },
            { category: 'illegal', name: '违法犯罪', count: 38 },
            { category: 'rumor', name: '虚假信息', count: 25 }
          ],
          
          categoryTrend: generateCategoryTrend(daysCount),
          
          topUsers: Mock.mock({
            'list|10': [{
              'userId': '@id',
              'username': '@cname',
              'blockCount|10-50': 1,
              'lastBlockTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
            }]
          }).list.sort((a, b) => b.blockCount - a.blockCount),
          
          controversialData: {
            distribution: [
              { category: 'violence', name: '暴力', count: 30 },
              { category: 'politics', name: '政治敏感', count: 25 },
              { category: 'pornography', name: '色情', count: 18 },
              { category: 'privacy', name: '隐私泄露', count: 12 }
            ],
            trend: generateControversialTrend(daysCount)
          }
        }
      }
    }
  }
]
```

- [ ] **步骤 2：在 Mock 入口引入**

编辑 `mock/index.js`，在文件末尾的导出数组中新增：

```javascript
import riskInterception from './riskInterception'

export default [
  // ... 现有 Mock 配置
  ...riskInterception
]
```

- [ ] **步骤 3：验证 Mock 生效**

启动开发服务器：
```bash
npm run dev
```

在浏览器访问：`http://localhost:3000/api/risk-interception/stats?period=7`

预期返回 JSON 数据，包含 `code: 0` 和 `data` 字段。

- [ ] **步骤 4：提交**

```bash
git add mock/riskInterception.js mock/index.js
git commit -m "feat: add risk interception mock data"
```

---

### 任务 4：配置 ECharts（修改 main.js）

**文件：**
- 修改：`src/main.js`

- [ ] **步骤 1：在 main.js 中添加 ECharts 导入**

在 `src/main.js` 的导入区域（`import` 语句块），第 6 行（`import * as ElementPlusIconsVue` 之后）添加：

```javascript
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
```

- [ ] **步骤 2：注册 ECharts 组件**

在 `const app = createApp(App)` 之后、Element Plus 图标注册之前（约第 10 行），添加：

```javascript
// 注册 ECharts 组件（按需引入）
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])
```

- [ ] **步骤 3：全局注册 vue-echarts 组件**

在上面代码之后、Element Plus 图标注册循环之前，添加：

```javascript
// 全局注册 vue-echarts 组件
app.component('v-chart', VChart)
```

- [ ] **步骤 4：验证配置**

启动开发服务器：
```bash
npm run dev
```

无报错，控制台无 ECharts 相关错误即可。

- [ ] **步骤 5：提交**

```bash
git add src/main.js
git commit -m "feat: configure ECharts and register vue-echarts globally"
```

---

### 任务 5：更新路由配置

**文件：**
- 修改：`src/router.js`

- [ ] **步骤 1：在路由表新增两个路由**

编辑 `src/router.js`，在 `children` 数组的**最后**（`心理风险预警` 路由之后、数组结束 `]` 之前），添加：

```javascript
      {
        path: '/risk-interception',
        name: 'RiskInterception',
        component: () => import('./views/RiskInterceptionRecords.vue'),
        meta: { title: '风险拦截记录' }
      },
      {
        path: '/user-management',
        name: 'UserManagement',
        component: () => import('./views/UserManagement.vue'),
        meta: { title: '用户管理' }
      }
```

注意：在上一个路由（`PsychologicalWarnings`）的闭合花括号后**加逗号**。

- [ ] **步骤 2：验证路由配置**

启动开发服务器，访问：
- `http://localhost:3000/risk-interception`（将显示 404，因为组件还未创建）
- `http://localhost:3000/user-management`（同样 404）

预期：URL 可访问，路由存在（即使组件未创建）。

- [ ] **步骤 3：提交**

```bash
git add src/router.js
git commit -m "feat: add routes for risk interception and user management"
```

---

### 任务 6：更新菜单（修改 Layout.vue）

**文件：**
- 修改：`src/layout/Layout.vue`

- [ ] **步骤 1：添加图标导入**

编辑 `src/layout/Layout.vue`，在 `<script setup>` 的导入语句中，找到图标导入行（约第 80 行）：

```javascript
import { Cpu, Grid, ChatDotRound, ChatLineSquare, Warning, ArrowDown } from '@element-plus/icons-vue'
```

修改为（新增 `Document` 和 `User`）：

```javascript
import { Cpu, Grid, ChatDotRound, ChatLineSquare, Warning, Document, User, ArrowDown } from '@element-plus/icons-vue'
```

- [ ] **步骤 2：在侧边栏添加两个菜单项**

在 `<nav class="nav-menu">` 中，找到最后一个 `<router-link>`（`/psychological-warnings`），在它之后、`</nav>` 之前，添加：

```vue
        <router-link to="/risk-interception" class="nav-item" :class="{ active: route.path === '/risk-interception' }">
          <el-icon><Document /></el-icon>
          <span>风险拦截记录</span>
        </router-link>
        <router-link to="/user-management" class="nav-item" :class="{ active: route.path === '/user-management' }">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>
```

- [ ] **步骤 3：验证菜单显示**

刷新浏览器，侧边栏应显示新增的两个菜单项："风险拦截记录"和"用户管理"，点击后 URL 变化。

- [ ] **步骤 4：提交**

```bash
git add src/layout/Layout.vue
git commit -m "feat: add menu items for risk interception and user management"
```

---

### 任务 7：创建页面骨架与状态管理

**文件：**
- 创建：`src/views/RiskInterceptionRecords.vue`

- [ ] **步骤 1：创建基础组件结构**

创建 `src/views/RiskInterceptionRecords.vue`，内容：

```vue
<template>
  <div class="page-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar-section">
      <el-radio-group v-model="period" size="default" @change="loadData">
        <el-radio-button label="7">近7天</el-radio-button>
        <el-radio-button label="30">近30天</el-radio-button>
        <el-radio-button label="180">近180天</el-radio-button>
        <el-radio-button label="all">累计</el-radio-button>
      </el-radio-group>
      <el-button :icon="Refresh" @click="loadData" :loading="loading">刷新</el-button>
    </div>

    <!-- 数据加载中 -->
    <div v-if="loading && !statsData" v-loading="true" style="height: 400px"></div>

    <!-- 数据展示区 -->
    <div v-else-if="statsData" class="data-sections">
      <!-- 各模块将在后续任务中添加 -->
      <div>数据加载成功，period: {{ period }}</div>
    </div>

    <!-- 空态 -->
    <el-empty v-else description="暂无数据" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getRiskStats } from '../api/riskInterception'

// 状态
const period = ref('7')
const loading = ref(false)
const statsData = ref(null)

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const res = await getRiskStats({ period: period.value })
    statsData.value = res
  } catch (e) {
    // 错误已由 request.js 拦截器统一提示
    console.error('加载风险拦截数据失败:', e)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.data-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
```

- [ ] **步骤 2：验证页面显示**

刷新浏览器，点击侧边栏"风险拦截记录"：
- 应看到时间周期选择器和刷新按钮
- 数据加载后显示"数据加载成功，period: 7"

- [ ] **步骤 3：验证时间周期切换**

点击不同的时间周期按钮，观察：
- URL 参数变化（Network 面板）
- Console 无报错
- 切换有 loading 效果

- [ ] **步骤 4：提交**

```bash
git add src/views/RiskInterceptionRecords.vue
git commit -m "feat: create risk interception page skeleton and state management"
```

---

### 任务 8：实现拦截概览模块（统计卡片）

**文件：**
- 修改：`src/views/RiskInterceptionRecords.vue`

- [ ] **步骤 1：在 `<template>` 中添加统计卡片**

在 `<div class="data-sections">` 内（替换"数据加载成功"占位文本），添加：

```vue
      <!-- 1. 拦截概览 -->
      <div class="section-card">
        <div class="section-title">拦截概览</div>
        
        <!-- 统计卡片网格 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">总请求数</div>
            <div class="stat-value">{{ statsData.overview.totalRequests.toLocaleString() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">拦截数</div>
            <div class="stat-value danger">{{ statsData.overview.blockedCount.toLocaleString() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">拦截率</div>
            <div class="stat-value warning">{{ statsData.overview.blockRate }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">输出/输入占比</div>
            <div class="stat-value">
              <span class="ratio-item">
                输出 {{ getOutputInputRatio().outputPercent }}%
              </span>
              <span class="ratio-divider">/</span>
              <span class="ratio-item">
                输入 {{ getOutputInputRatio().inputPercent }}%
              </span>
            </div>
          </div>
        </div>
      </div>
```

- [ ] **步骤 2：在 `<script setup>` 中添加计算函数**

在 `loadData` 函数之后，添加：

```javascript
// 计算输出/输入占比
function getOutputInputRatio() {
  if (!statsData.value) return { outputPercent: 0, inputPercent: 0 }
  
  const { outputBlockCount, inputBlockCount } = statsData.value.overview
  const total = outputBlockCount + inputBlockCount
  
  if (total === 0) return { outputPercent: 0, inputPercent: 0 }
  
  return {
    outputPercent: Math.round((outputBlockCount / total) * 100),
    inputPercent: Math.round((inputBlockCount / total) * 100)
  }
}
```

- [ ] **步骤 3：在 `<style scoped>` 中添加样式**

在现有样式之后添加：

```css
/* 模块容器 */
.section-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-900);
  margin-bottom: 20px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 20px;
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: var(--ink-500);
  margin-bottom: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink-900);
  font-family: var(--font-mono);
}

.stat-value.danger {
  color: var(--danger);
}

.stat-value.warning {
  color: var(--warn);
}

.ratio-item {
  font-size: 18px;
}

.ratio-divider {
  margin: 0 8px;
  color: var(--ink-300);
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-value {
    font-size: 24px;
  }
}
```

- [ ] **步骤 4：验证统计卡片显示**

刷新浏览器，应看到4个统计卡片，数据正确显示（带千分位格式化）。

- [ ] **步骤 5：提交**

```bash
git add src/views/RiskInterceptionRecords.vue
git commit -m "feat: implement overview stats cards"
```

---

### 任务 9：实现拦截概览模块（饼图）

**文件：**
- 修改：`src/views/RiskInterceptionRecords.vue`

- [ ] **步骤 1：在 `<template>` 中添加饼图容器**

在统计卡片网格之后（`</div><!-- .stats-grid -->` 后），添加：

```vue
        <!-- 饼图 -->
        <div class="pie-charts-grid">
          <div class="chart-card">
            <div class="chart-title">输入/输出拦截分布</div>
            <v-chart :option="inputOutputPieOption" :autoresize="true" style="height: 300px" />
          </div>
          <div class="chart-card">
            <div class="chart-title">三级分布</div>
            <v-chart :option="levelPieOption" :autoresize="true" style="height: 300px" />
          </div>
        </div>
      </div><!-- .section-card -->
```

- [ ] **步骤 2：在 `<script setup>` 中添加响应式图表配置**

在导入语句中添加 `computed, watch`：

```javascript
import { ref, onMounted, computed, watch } from 'vue'
```

在 `getOutputInputRatio` 函数之后，添加图表配置计算属性：

```javascript
// 输入/输出饼图配置
const inputOutputPieOption = computed(() => {
  if (!statsData.value) return {}
  
  const { inputBlockCount, outputBlockCount } = statsData.value.overview
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: inputBlockCount, name: '输入拦截', itemStyle: { color: '#3748FF' } },
          { value: outputBlockCount, name: '输出拦截', itemStyle: { color: '#5A67FF' } }
        ]
      }
    ]
  }
})

// 三级分布饼图配置
const levelPieOption = computed(() => {
  if (!statsData.value) return {}
  
  const { safeCount, unsafeCount, controversialCount } = statsData.value.overview
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: safeCount, name: '安全', itemStyle: { color: '#11A36B' } },
          { value: unsafeCount, name: '不安全', itemStyle: { color: '#E5484D' } },
          { value: controversialCount, name: '争议', itemStyle: { color: '#E0901B' } }
        ]
      }
    ]
  }
})
```

- [ ] **步骤 3：在 `<style scoped>` 中添加样式**

```css
/* 饼图网格 */
.pie-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.chart-card {
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-700);
  margin-bottom: 12px;
  text-align: center;
}

@media (max-width: 768px) {
  .pie-charts-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **步骤 4：验证饼图显示**

刷新浏览器，应看到两个饼图：
- 左侧：输入/输出拦截分布（蓝色系）
- 右侧：安全/不安全/争议三级分布（绿/红/橙）
- Hover 时有 tooltip

- [ ] **步骤 5：提交**

```bash
git add src/views/RiskInterceptionRecords.vue
git commit -m "feat: implement overview pie charts"
```

---

### 任务 10：实现违规分类分布模块（柱状图）

**文件：**
- 修改：`src/views/RiskInterceptionRecords.vue`

- [ ] **步骤 1：在 `<template>` 中添加柱状图容器**

在拦截概览模块之后（第一个 `</div><!-- .section-card -->` 后），添加：

```vue
      <!-- 2. 违规分类分布 -->
      <div class="section-card">
        <div class="section-title">违规分类分布</div>
        
        <div class="chart-card">
          <div class="chart-title">分类拦截次数</div>
          <v-chart :option="categoryBarOption" :autoresize="true" style="height: 350px" />
        </div>
      </div>
```

- [ ] **步骤 2：在 `<script setup>` 中添加柱状图配置**

在 `levelPieOption` 之后，添加：

```javascript
// 违规分类柱状图配置
const categoryBarOption = computed(() => {
  if (!statsData.value) return {}
  
  const categories = statsData.value.categoryDistribution
  const names = categories.map(c => c.name)
  const counts = categories.map(c => c.count)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '拦截次数'
    },
    series: [
      {
        type: 'bar',
        data: counts,
        itemStyle: {
          color: '#3748FF'
        },
        barWidth: '60%'
      }
    ]
  }
})
```

- [ ] **步骤 3：验证柱状图显示**

刷新浏览器，应看到分类柱状图：
- X轴：各违规分类名称
- Y轴：拦截次数
- 柱子颜色为品牌色蓝

- [ ] **步骤 4：提交**

```bash
git add src/views/RiskInterceptionRecords.vue
git commit -m "feat: implement category distribution bar chart"
```

---

### 任务 11：实现违规分类分布模块（时间趋势折线图）

**文件：**
- 修改：`src/views/RiskInterceptionRecords.vue`

- [ ] **步骤 1：在 `<template>` 中添加折线图容器**

在柱状图卡片之后（同一个 `.section-card` 内），添加：

```vue
        <div class="chart-card" style="margin-top: 20px">
          <div class="chart-title">分类时间趋势</div>
          <v-chart :option="categoryTrendOption" :autoresize="true" style="height: 400px" />
        </div>
      </div><!-- .section-card -->
```

- [ ] **步骤 2：在 `<script setup>` 中添加折线图配置**

在 `categoryBarOption` 之后，添加：

```javascript
// 违规分类时间趋势折线图配置
const categoryTrendOption = computed(() => {
  if (!statsData.value) return {}
  
  const trendData = statsData.value.categoryTrend
  const categories = statsData.value.categoryDistribution
  
  // 提取日期（X轴）
  const dates = trendData.map(d => d.date.slice(5)) // 截取 MM-DD
  
  // 为每个分类创建一条折线
  const series = categories.map(cat => ({
    name: cat.name,
    type: 'line',
    smooth: true,
    data: trendData.map(d => d[cat.category] || 0)
  }))
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: categories.map(c => c.name),
      bottom: '5%',
      type: 'scroll'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '拦截次数'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series
  }
})
```

- [ ] **步骤 3：验证折线图显示**

刷新浏览器，应看到：
- 多条彩色折线（每个分类一条）
- X轴显示日期（MM-DD格式）
- 图例可点击切换显示/隐藏
- 底部有滑动条可缩放

- [ ] **步骤 4：提交**

```bash
git add src/views/RiskInterceptionRecords.vue
git commit -m "feat: implement category time trend line chart"
```

---

### 任务 12：实现用户维度模块（TOP 10 表格）

**文件：**
- 修改：`src/views/RiskInterceptionRecords.vue`

- [ ] **步骤 1：在 `<template>` 中添加表格容器**

在违规分类模块之后（第二个 `</div><!-- .section-card -->` 后），添加：

```vue
      <!-- 3. 用户维度 -->
      <div class="section-card">
        <div class="section-title">高频触发用户 TOP 10</div>
        
        <el-table :data="statsData.topUsers" style="width: 100%">
          <el-table-column label="排名" width="80" align="center">
            <template #default="{ $index }">
              <span v-if="$index === 0" class="rank-medal">🥇</span>
              <span v-else-if="$index === 1" class="rank-medal">🥈</span>
              <span v-else-if="$index === 2" class="rank-medal">🥉</span>
              <span v-else class="rank-number">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="userId" label="用户ID" width="200">
            <template #default="{ row }">
              <span class="mono">{{ row.userId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="blockCount" label="拦截次数" width="120" align="center" sortable>
            <template #default="{ row }">
              <el-tag type="danger" size="small">{{ row.blockCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastBlockTime" label="最后拦截时间" min-width="180">
            <template #default="{ row }">
              <span class="mono">{{ row.lastBlockTime }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
```

- [ ] **步骤 2：在 `<style scoped>` 中添加样式**

```css
/* TOP 10 表格 */
.rank-medal {
  font-size: 20px;
}

.rank-number {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-600);
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-600);
}
```

- [ ] **步骤 3：验证表格显示**

刷新浏览器，应看到：
- 前3名有金银铜牌图标
- 用户ID和时间用等宽字体
- 拦截次数用红色标签
- 点击"拦截次数"列头可排序

- [ ] **步骤 4：提交**

```bash
git add src/views/RiskInterceptionRecords.vue
git commit -m "feat: implement top users table"
```

---

### 任务 13：实现 Controversial 专项模块

**文件：**
- 修改：`src/views/RiskInterceptionRecords.vue`

- [ ] **步骤 1：在 `<template>` 中添加 Controversial 模块**

在用户维度模块之后（第三个 `</div><!-- .section-card -->` 后），添加：

```vue
      <!-- 4. Controversial 专项 -->
      <div class="section-card">
        <div class="section-title">Controversial（争议）专项分析</div>
        
        <div class="pie-charts-grid">
          <div class="chart-card">
            <div class="chart-title">Controversial 分类分布</div>
            <v-chart :option="controversialPieOption" :autoresize="true" style="height: 300px" />
          </div>
          <div class="chart-card">
            <div class="chart-title">Controversial 时间趋势</div>
            <v-chart :option="controversialTrendOption" :autoresize="true" style="height: 300px" />
          </div>
        </div>
      </div>
    </div><!-- .data-sections -->
```

- [ ] **步骤 2：在 `<script setup>` 中添加图表配置**

在 `categoryTrendOption` 之后，添加：

```javascript
// Controversial 分类饼图配置
const controversialPieOption = computed(() => {
  if (!statsData.value) return {}
  
  const distribution = statsData.value.controversialData.distribution
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: distribution.map(d => ({
          value: d.count,
          name: d.name
        }))
      }
    ]
  }
})

// Controversial 时间趋势折线图配置
const controversialTrendOption = computed(() => {
  if (!statsData.value) return {}
  
  const trend = statsData.value.controversialData.trend
  const dates = trend.map(d => d.date.slice(5)) // MM-DD
  const counts = trend.map(d => d.count)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '争议数量'
    },
    series: [
      {
        name: 'Controversial',
        type: 'line',
        smooth: true,
        data: counts,
        itemStyle: {
          color: '#E0901B'
        },
        areaStyle: {
          color: 'rgba(224, 144, 27, 0.1)'
        }
      }
    ]
  }
})
```

- [ ] **步骤 3：验证 Controversial 模块显示**

刷新浏览器，应看到：
- 左侧饼图：Controversial 各分类占比
- 右侧折线图：Controversial 总数随时间变化（橙色，带渐变填充）

- [ ] **步骤 4：提交**

```bash
git add src/views/RiskInterceptionRecords.vue
git commit -m "feat: implement Controversial analysis module"
```

---

### 任务 14：功能测试与优化

**文件：**
- 测试：完整页面功能

- [ ] **步骤 1：功能测试清单**

逐项测试以下功能：

1. **时间周期切换**
   - 点击"近7天"、"近30天"、"近180天"、"累计"
   - 验证：Network 面板显示正确的 `period` 参数
   - 验证：所有图表数据更新

2. **统计卡片**
   - 验证：数字格式化有千分位（如 10,234）
   - 验证：拦截率显示为百分比（如 12.5%）
   - 验证：输出/输入占比计算正确

3. **饼图交互**
   - Hover 时显示 tooltip
   - 点击图例切换显示/隐藏

4. **柱状图**
   - X轴标签完整显示（旋转 30 度）
   - Hover 显示数值

5. **折线图**
   - 图例点击切换
   - 使用底部滑动条缩放
   - Hover 显示详细数据

6. **TOP 10 表格**
   - 前3名显示奖牌图标
   - 点击"拦截次数"列头排序

7. **Controversial 模块**
   - 饼图和折线图正确显示

- [ ] **步骤 2：错误处理测试**

在浏览器 Console 执行：
```javascript
// 模拟接口失败（需先打开 DevTools → Network → Offline）
```

切换时间周期，验证：
- 出现 Toast 错误提示
- loading 状态正确复位
- 页面不崩溃

- [ ] **步骤 3：响应式测试**

打开浏览器开发者工具，切换到移动端视图（iPhone/iPad）：
- 统计卡片：4列 → 2列
- 饼图：并排 → 堆叠
- 图表高度调整
- 表格横向滚动

- [ ] **步骤 4：性能检查**

打开 Network 面板，切换时间周期：
- 验证：只发送一次请求（无重复请求）
- 验证：响应时间 < 200ms（Mock 数据）

- [ ] **步骤 5：提交**

```bash
git add -A
git commit -m "test: verify all features and responsive design"
```

---

### 任务 15：知识库更新与文档

**文件：**
- 创建：`knowledge-base/modules/risk-interception.md`
- 修改：`knowledge-base/modules/inventory.md`
- 修改：`knowledge-base/system/URL路由.md`
- 修改：`knowledge-base/log.md`

- [ ] **步骤 1：创建模块文档**

创建 `knowledge-base/modules/risk-interception.md`，内容：

```markdown
---
title: 风险拦截记录模块
category: modules
status: stable
owner: Claude
created: 2026-06-25
updated: 2026-06-25
tags: [风险拦截, ECharts, 数据看板]
---

# 风险拦截记录模块

> 风险拦截数据看板，展示多维度拦截统计与可视化。

**文件位置**：`src/views/RiskInterceptionRecords.vue`

---

## 1. 功能概览

展示风险拦截数据的4大模块：
1. **拦截概览**：统计卡片（总请求数、拦截数、拦截率、输出/输入占比）+ 2个饼图
2. **违规分类分布**：柱状图（各分类拦截次数）+ 折线图（时间趋势）
3. **用户维度**：TOP 10 表格（高频触发用户）
4. **Controversial 专项**：饼图（分类分布）+ 折线图（时间趋势）

## 2. 时间周期切换

全局时间周期选择器，支持：
- 近7天（默认）
- 近30天
- 近180天
- 累计

切换后所有模块数据同步更新。

## 3. 技术实现

- **图表库**：ECharts 5 + vue-echarts
- **API**：`api/riskInterception.js` → `getRiskStats()`
- **Mock**：`mock/riskInterception.js`

## 4. 关联文档

- API 接口：`api.md`
- 设计文档：`docs/specs/2026-06-25-risk-interception-dashboard-design.md`
```

- [ ] **步骤 2：更新模块清单**

编辑 `knowledge-base/modules/inventory.md`，在模块总览表格中新增一行：

```markdown
| 风险拦截记录 | `views/RiskInterceptionRecords.vue` | `api/riskInterception.js` | `/risk-interception` | 已实现 |
```

- [ ] **步骤 3：更新路由表**

编辑 `knowledge-base/system/URL路由.md`，在路由总览表格中新增：

```markdown
| `/risk-interception` | `RiskInterception` | `views/RiskInterceptionRecords.vue` | 风险拦截记录 | `api/riskInterception.js` | `Document` |
| `/user-management` | `UserManagement` | `views/UserManagement.vue` | 用户管理 | （待实现） | `User` |
```

- [ ] **步骤 4：更新操作日志**

编辑 `knowledge-base/log.md`，追加：

```markdown
- 2026-06-25 | 新增 | src/views/RiskInterceptionRecords.vue | 风险拦截记录数据看板页面 | Claude
- 2026-06-25 | 新增 | src/api/riskInterception.js | 风险拦截 API 模块 | Claude
- 2026-06-25 | 新增 | mock/riskInterception.js | 风险拦截 Mock 数据 | Claude
- 2026-06-25 | 修改 | src/main.js | 注册 ECharts 组件 | Claude
- 2026-06-25 | 修改 | src/router.js | 新增风险拦截记录和用户管理路由 | Claude
- 2026-06-25 | 修改 | src/layout/Layout.vue | 新增菜单项 | Claude
- 2026-06-25 | 新增 | knowledge-base/modules/risk-interception.md | 风险拦截模块文档 | Claude
```

- [ ] **步骤 5：提交**

```bash
git add knowledge-base/
git commit -m "docs: update knowledge base for risk interception module"
```

---

## 总结

**已完成：**
✅ 安装 ECharts 和 vue-echarts 依赖
✅ 创建 API 模块（`api/riskInterception.js`）
✅ 创建 Mock 数据（`mock/riskInterception.js`）
✅ 配置 ECharts 全局注册（`main.js`）
✅ 更新路由（`router.js`）
✅ 更新菜单（`layout/Layout.vue`）
✅ 创建页面组件（`RiskInterceptionRecords.vue`）
✅ 实现拦截概览模块（统计卡片 + 饼图）
✅ 实现违规分类分布模块（柱状图 + 折线图）
✅ 实现用户维度模块（TOP 10 表格）
✅ 实现 Controversial 专项模块（饼图 + 折线图）
✅ 功能测试与优化
✅ 知识库更新

**待后续：**
- 用户管理页面（占位路由已添加）
- 真实后端 API 对接（替换 Mock）
- 点击交互（如点击柱状图查看该分类明细）
- 导出功能

**验收标准：**
- 所有图表正确显示数据
- 时间周期切换正常
- 响应式布局适配移动端
- 无控制台错误
- 知识库文档完整

