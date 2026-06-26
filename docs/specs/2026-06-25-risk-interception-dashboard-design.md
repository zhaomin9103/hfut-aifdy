# 风险拦截记录数据看板 - 设计文档

**日期**: 2026-06-25  
**状态**: 待实现  
**作者**: Claude + 用户协作

---

## 1. 概述

### 1.1 目标

为「合工大 AI 辅导员」后台管理系统新增**风险拦截记录数据看板**页面，提供多维度的风险拦截数据分析与可视化，帮助运营人员：

1. 监控总体拦截情况（请求量、拦截率、输入/输出分布）
2. 识别高危违规分类及其趋势变化
3. 发现高频触发拦截的用户（潜在恶意测试/攻击）
4. 专项分析 Controversial（争议）类记录

### 1.2 功能边界

**包含：**
- 拦截数据概览（统计卡片 + 饼图）
- 违规分类分布与趋势（柱状图 + 折线图）
- 高频用户 TOP 10（表格）
- Controversial 专项分析（饼图 + 折线图）
- 时间周期切换（近7天、近30天、近180天、累计）

**不包含：**
- 拦截记录明细列表（可后续扩展）
- 实时告警功能
- 用户画像详情页

---

## 2. 整体架构

### 2.1 页面结构

```
┌──────────────────────────────────────────────────────┐
│ 顶部工具栏                                            │
│ ┌─────────────────────┐ ┌──────┐                    │
│ │ 时间周期: 近7天 ▼    │ │ 刷新 │                    │
│ └─────────────────────┘ └──────┘                    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 拦截概览                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│ │总请求数│ │拦截数  │ │拦截率  │ │输出/   │         │
│ │10,234  │ │1,280   │ │12.5%   │ │输入占比│         │
│ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                       │
│ ┌──────────────────┐ ┌──────────────────┐           │
│ │ 输入/输出饼图     │ │ 三级分布饼图     │           │
│ │ 输入 35%         │ │ 安全 45%         │           │
│ │ 输出 65%         │ │ 不安全 35%       │           │
│ │                  │ │ 争议 20%         │           │
│ └──────────────────┘ └──────────────────┘           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 违规分类分布                                          │
│ ┌────────────────────────────────────────────────┐   │
│ │ 分类柱状图                                      │   │
│ │ [暴力][政治敏感][色情][隐私][...]               │   │
│ └────────────────────────────────────────────────┘   │
│                                                       │
│ ┌────────────────────────────────────────────────┐   │
│ │ 分类时间趋势折线图                              │   │
│ │ [多条线: 暴力、政治敏感、色情...]              │   │
│ └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 用户维度                                              │
│ ┌────────────────────────────────────────────────┐   │
│ │ 高频触发用户 TOP 10                             │   │
│ │ 排名 | 用户ID | 用户名 | 拦截次数 | 最后拦截  │   │
│ │  🥇  | user01 | 张三   | 45       | 06-24 15:30│   │
│ │  🥈  | user02 | 李四   | 38       | 06-24 14:20│   │
│ └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Controversial 专项                                    │
│ ┌──────────────────┐ ┌──────────────────┐           │
│ │ 分类分布饼图     │ │ 趋势折线图       │           │
│ └──────────────────┘ └──────────────────┘           │
└──────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 页面组件 | Vue 3 Composition API | `RiskInterceptionRecords.vue` |
| UI 组件库 | Element Plus | 统计卡片、表格、选择器 |
| 图表库 | **ECharts + vue-echarts** | 饼图、柱状图、折线图 |
| API 模块 | Axios | `api/riskInterception.js` |
| Mock 数据 | mockjs + vite-plugin-mock | `mock/riskInterception.js` |
| 状态管理 | ref / reactive | 页面内状态，无全局 store |

**新增依赖：**
```bash
npm install echarts vue-echarts
```

---

## 3. 接口设计

### 3.1 API 定义

**文件位置**: `src/api/riskInterception.js`

#### 接口：获取风险拦截统计数据

```javascript
/**
 * 获取风险拦截统计数据（聚合接口）
 * @param {Object} params - { period: '7' | '30' | '180' | 'all' }
 * @returns {Promise<Object>}
 */
export function getRiskStats(params) {
  return request.get('/risk-interception/stats', { params })
}
```

### 3.2 响应数据结构

```typescript
{
  // 1. 拦截概览
  overview: {
    totalRequests: number,        // 总请求数
    blockedCount: number,          // 拦截数
    blockRate: string,             // 拦截率（百分比字符串，如 "12.5%"）
    inputBlockCount: number,       // 输入拦截数
    outputBlockCount: number,      // 输出拦截数
    safeCount: number,             // 安全数量
    unsafeCount: number,           // 不安全数量
    controversialCount: number     // 争议数量
  },
  
  // 2. 违规分类分布
  categoryDistribution: [
    {
      category: string,            // 分类标识（如 'violence'）
      name: string,                // 分类中文名（如 '暴力'）
      count: number                // 拦截次数
    }
  ],
  
  // 3. 分类时间趋势
  categoryTrend: [
    {
      date: string,                // 日期 'YYYY-MM-DD'
      violence: number,            // 各分类当天拦截数
      politics: number,
      pornography: number,
      privacy: number
      // ... 其他分类动态字段
    }
  ],
  
  // 4. 高频用户 TOP 10
  topUsers: [
    {
      userId: string,              // 用户ID
      username: string,            // 用户名
      blockCount: number,          // 拦截次数
      lastBlockTime: string        // 最后拦截时间 'YYYY-MM-DD HH:mm:ss'
    }
  ],
  
  // 5. Controversial 专项数据
  controversialData: {
    distribution: [               // 分类分布
      {
        category: string,
        name: string,
        count: number
      }
    ],
    trend: [                      // 时间趋势
      {
        date: string,
        count: number             // 当天 Controversial 总数
      }
    ]
  }
}
```

### 3.3 设计要点

1. **单接口聚合**：一次请求返回所有模块数据，避免多次请求导致的数据不一致和性能问题
2. **period 参数**：
   - `'7'`：近7天（默认）
   - `'30'`：近30天
   - `'180'`：近180天
   - `'all'`：累计数据
3. **分类动态获取**：`categoryDistribution` 数组由后端返回实际分类，前端不硬编码
4. **百分比格式化**：`blockRate` 在后端计算并格式化为字符串（如 "12.5%"），前端直接展示
5. **趋势数据粒度**：
   - 近7天/30天：按天聚合
   - 近180天：按天或按周（视后端实现）
   - 累计：按周或按月

---

## 4. 组件设计

### 4.1 页面组件

**文件位置**: `src/views/RiskInterceptionRecords.vue`

**核心状态：**
```javascript
const period = ref('7')              // 当前时间周期
const loading = ref(false)           // 加载状态
const statsData = ref(null)          // 统计数据
```

**生命周期：**
- `onMounted`: 加载默认数据（近7天）
- 监听 `period` 变化 → 重新加载数据

### 4.2 模块拆解

#### 模块 1：拦截概览

**统计卡片（4个）**

使用 Element Plus `el-statistic` 或自定义卡片组件：

```vue
<div class="stats-cards">
  <div class="stat-card">
    <div class="stat-label">总请求数</div>
    <div class="stat-value">{{ statsData.overview.totalRequests.toLocaleString() }}</div>
    <div class="stat-trend">📊 环比 +5.2%</div>
  </div>
  <!-- 其他3个卡片 -->
</div>
```

**样式要点：**
- 卡片网格布局（4列，响应式）
- 数字使用 `toLocaleString()` 格式化千分位
- 环比数据（可选，Mock 时可省略）

**两个饼图**

使用 `vue-echarts` 组件：

```vue
<div class="pie-charts">
  <v-chart :option="inputOutputPieOption" style="height: 300px" />
  <v-chart :option="levelPieOption" style="height: 300px" />
</div>
```

**饼图配置：**
- 左图：输入拦截 vs 输出拦截
- 右图：安全 vs 不安全 vs 争议
- 颜色：
  - 输入：`#3748FF`（品牌色）
  - 输出：`#5A67FF`
  - 安全：`#11A36B`（绿）
  - 不安全：`#E5484D`（红）
  - 争议：`#E0901B`（橙）

#### 模块 2：违规分类分布

**分类柱状图**

```javascript
const categoryBarOption = {
  xAxis: {
    type: 'category',
    data: ['暴力', '政治敏感', '色情', '隐私', ...]  // 动态生成
  },
  yAxis: { type: 'value' },
  series: [{
    type: 'bar',
    data: [120, 85, 60, 45, ...],
    itemStyle: { color: '#3748FF' }
  }]
}
```

**分类时间趋势折线图**

```javascript
const categoryTrendOption = {
  xAxis: {
    type: 'category',
    data: ['06-18', '06-19', ...]  // 日期数组
  },
  yAxis: { type: 'value' },
  series: [
    { name: '暴力', type: 'line', data: [15, 18, ...] },
    { name: '政治敏感', type: 'line', data: [12, 10, ...] },
    // ... 其他分类
  ],
  legend: { data: ['暴力', '政治敏感', ...] }
}
```

**交互：**
- 支持图例点击切换显示/隐藏
- 支持缩放（dataZoom）
- Tooltip 显示详细数值

#### 模块 3：用户维度

**TOP 10 表格**

```vue
<el-table :data="statsData.topUsers">
  <el-table-column label="排名" width="80">
    <template #default="{ $index }">
      <span v-if="$index === 0">🥇</span>
      <span v-else-if="$index === 1">🥈</span>
      <span v-else-if="$index === 2">🥉</span>
      <span v-else>{{ $index + 1 }}</span>
    </template>
  </el-table-column>
  <el-table-column prop="userId" label="用户ID" />
  <el-table-column prop="username" label="用户名" />
  <el-table-column prop="blockCount" label="拦截次数" sortable />
  <el-table-column prop="lastBlockTime" label="最后拦截时间" />
</el-table>
```

#### 模块 4：Controversial 专项

**分类饼图 + 趋势折线图**

与违规分类模块类似，但数据来源为 `statsData.controversialData`。

---

## 5. ECharts 集成

### 5.1 安装与配置

**安装依赖：**
```bash
npm install echarts vue-echarts
```

**全局注册（`main.js`）：**
```javascript
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 按需注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 全局注册 vue-echarts 组件
app.component('v-chart', VChart)
```

### 5.2 主题配置

在页面或全局设置 ECharts 主题，匹配品牌色：

```javascript
const chartTheme = {
  color: ['#3748FF', '#5A67FF', '#7C4DFF', '#9D6CFF', '#BE8CFF'],
  backgroundColor: 'transparent'
}
```

### 5.3 响应式处理

```vue
<v-chart 
  :option="chartOption" 
  :autoresize="true"
  style="height: 400px"
/>
```

`autoresize` 属性确保图表随容器大小变化自动调整。

---

## 6. Mock 数据

### 6.1 Mock 文件

**文件位置**: `mock/riskInterception.js`

```javascript
import Mock from 'mockjs'

export default [
  {
    url: '/api/risk-interception/stats',
    method: 'get',
    response: ({ query }) => {
      const { period = '7' } = query
      
      // 根据 period 生成不同数量的趋势数据点
      const daysCount = period === '7' ? 7 : period === '30' ? 30 : 180
      
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
```

---

## 7. 路由与菜单

### 7.1 路由配置

**文件位置**: `src/router.js`

在 `children` 数组中新增路由（放在最后）：

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

### 7.2 菜单更新

**文件位置**: `src/layout/Layout.vue`

在侧边栏 `<nav class="nav-menu">` 中追加两个菜单项：

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

**图标导入：**
```javascript
import { Cpu, Grid, ChatDotRound, ChatLineSquare, Warning, Document, User, ArrowDown } from '@element-plus/icons-vue'
```

**最终菜单顺序：**
1. 智能体管理
2. 分类管理
3. 快捷问题配置
4. 用户反馈
5. 心理风险预警
6. 风险拦截记录 ✨
7. 用户管理 ✨

---

## 8. 错误处理与边界情况

### 8.1 接口错误

- **场景**：接口请求失败（网络错误、后端异常）
- **处理**：
  1. Toast 提示用户："数据加载失败，请稍后重试"
  2. 保留上次成功加载的数据
  3. loading 状态复位

### 8.2 无数据

- **场景**：接口返回空数组或 0 值
- **处理**：
  1. 统计卡片显示 0
  2. 图表显示"暂无数据"占位符
  3. 表格显示空态

### 8.3 图表渲染失败

- **场景**：ECharts 初始化失败或数据格式错误
- **处理**：
  1. 降级为纯数字展示
  2. Console 输出错误日志（开发环境）
  3. 不影响其他模块

### 8.4 响应式适配

**移动端（<768px）：**
- 统计卡片：4列 → 2列
- 饼图：并排 → 堆叠
- 图表高度：400px → 300px
- 表格：固定左侧用户名列

---

## 9. 性能优化

### 9.1 图表按需加载

仅引入使用的图表类型（PieChart、BarChart、LineChart），减小打包体积。

### 9.2 数据缓存

切换时间周期时，缓存已加载的数据，避免重复请求相同周期的数据。

### 9.3 图表防抖

窗口 resize 时，图表重绘添加 200ms 防抖，避免频繁渲染。

### 9.4 懒加载

路由组件使用动态导入 `() => import()`，按需加载。

---

## 10. 测试要点

### 10.1 功能测试

- [ ] 时间周期切换后，所有模块数据正确更新
- [ ] 统计卡片数字格式化正确（千分位）
- [ ] 饼图占比计算正确
- [ ] 柱状图、折线图数据点对应正确
- [ ] TOP 10 表格排序正确（前3名有奖牌图标）
- [ ] 图例点击切换显示/隐藏正常
- [ ] 图表缩放、Tooltip 交互正常

### 10.2 错误处理测试

- [ ] Mock 返回空数据时，页面显示空态
- [ ] 模拟接口失败，Toast 提示正常
- [ ] 图表数据格式异常时，降级展示

### 10.3 响应式测试

- [ ] 移动端布局正常（卡片堆叠、图表缩小）
- [ ] 桌面端布局正常（卡片网格、图表并排）

---

## 11. 实施顺序

1. **安装依赖** - ECharts + vue-echarts
2. **创建 API 模块** - `api/riskInterception.js`
3. **创建 Mock 数据** - `mock/riskInterception.js`
4. **创建页面组件** - `RiskInterceptionRecords.vue`（分步实现各模块）
5. **更新路由与菜单** - `router.js` + `Layout.vue`
6. **测试与调试** - 各模块功能、交互、响应式
7. **知识库更新** - 更新 `knowledge-base/` 相关文档

---

## 12. 后续扩展

- [ ] 点击分类柱状图，查看该分类的拦截记录明细
- [ ] 点击 TOP 10 用户，查看该用户的拦截历史
- [ ] 导出功能（Excel/CSV）
- [ ] 实时数据推送（WebSocket）
- [ ] 自定义时间范围选择
- [ ] 告警阈值设置（拦截率异常时通知）

---

## 13. 附录

### 13.1 文件清单

**新增文件：**
- `src/api/riskInterception.js` - API 模块
- `src/views/RiskInterceptionRecords.vue` - 页面组件
- `mock/riskInterception.js` - Mock 数据
- `docs/specs/2026-06-25-risk-interception-dashboard-design.md` - 本文档

**修改文件：**
- `src/router.js` - 新增路由
- `src/layout/Layout.vue` - 新增菜单
- `src/main.js` - 注册 ECharts 组件
- `package.json` - 新增依赖

### 13.2 参考资料

- [ECharts 官方文档](https://echarts.apache.org/zh/index.html)
- [vue-echarts GitHub](https://github.com/ecomfe/vue-echarts)
- [Element Plus Statistic 组件](https://element-plus.org/zh-CN/component/statistic.html)
- 项目现有页面：`PsychologicalWarnings.vue`（参考数据看板实现）

---

**文档状态**: ✅ 设计完成，待用户审查
