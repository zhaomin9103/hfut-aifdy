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

## 4. 数据结构

### 4.1 API 响应结构

```javascript
{
  overview: {
    totalRequests: Number,        // 总请求数
    blockedCount: Number,          // 拦截数
    blockRate: String,             // 拦截率（如 "12.5%"）
    inputBlockCount: Number,       // 输入拦截数
    outputBlockCount: Number,      // 输出拦截数
    safeCount: Number,             // 安全数
    unsafeCount: Number,           // 不安全数
    controversialCount: Number     // 争议数
  },
  categoryDistribution: [          // 分类分布
    { category: String, name: String, count: Number }
  ],
  categoryTrend: [                 // 分类时间趋势
    { date: String, violence: Number, politics: Number, ... }
  ],
  topUsers: [                      // 高频用户 TOP 10
    { userId: String, username: String, blockCount: Number, lastBlockTime: String }
  ],
  controversialData: {             // Controversial 专项数据
    distribution: [{ category: String, name: String, count: Number }],
    trend: [{ date: String, count: Number }]
  }
}
```

### 4.2 图表配置

所有图表使用 ECharts 5，通过 `computed` 属性动态生成配置：

- **饼图**：环形图 (radius: ['40%', '70%'])
- **柱状图**：单系列柱状图，支持 tooltip
- **折线图**：多系列折线图，支持 legend 切换、dataZoom 缩放

## 5. 视觉规范

### 5.1 统计卡片

- 4 列网格布局（移动端 2 列）
- 数字格式化：`toLocaleString()` 千分位
- 颜色变量：拦截数（danger）、拦截率（warning）

### 5.2 图表颜色

- 输入拦截：`#3748FF`（蓝色）
- 输出拦截：`#5A67FF`（浅蓝）
- 安全：`#11A36B`（绿色）
- 不安全：`#E5484D`（红色）
- 争议：`#E0901B`（橙色）

### 5.3 表格设计

- 前3名显示奖牌图标：🥇🥈🥉
- 拦截次数列：红色标签，支持排序
- 用户ID、时间：等宽字体（mono）

## 6. 响应式设计

**断点**：`max-width: 768px`

| 元素 | 桌面端 | 移动端 |
|------|--------|--------|
| 统计卡片网格 | 4 列 | 2 列 |
| 饼图网格 | 2 列并排 | 1 列堆叠 |
| 统计数字大小 | 28px | 24px |

## 7. 交互功能

1. **时间周期切换**：点击按钮 → 触发 `loadData()` → 更新所有图表
2. **饼图交互**：Hover 显示 tooltip，点击图例切换显示
3. **柱状图交互**：Hover 显示数值
4. **折线图交互**：
   - 点击图例切换系列显示
   - dataZoom 滑动条缩放时间范围
   - 支持内部缩放（鼠标滚轮）
5. **表格排序**：点击"拦截次数"列头排序

## 8. 代码结构

### 8.1 核心函数

- `loadData()`：加载数据，调用 `getRiskStats()`
- `getOutputInputRatio()`：计算输出/输入占比百分比

### 8.2 计算属性（图表配置）

- `inputOutputPieOption`：输入/输出饼图
- `levelPieOption`：三级分布饼图
- `categoryBarOption`：分类柱状图
- `categoryTrendOption`：分类时间趋势折线图
- `controversialPieOption`：Controversial 饼图
- `controversialTrendOption`：Controversial 趋势折线图

## 9. 关联文档

- API 接口：`api.md`
- 路由表：`../system/URL路由.md`
- 技术栈：`../system/技术栈.md`（ECharts 依赖）
- 设计文档：`../raw/` 中设计规范文件

## 10. 维护提示

- Mock 数据随 `period` 参数动态生成不同天数的趋势数据
- 图表配置使用 `computed` 响应式更新，无需手动刷新
- 新增分类需同步更新 Mock 中的 `categoryDistribution` 和趋势数据字段
