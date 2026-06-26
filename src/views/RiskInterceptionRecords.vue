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
      </div>

      <!-- 2. 违规分类分布 -->
      <div class="section-card">
        <div class="section-title">违规分类分布</div>

        <div class="chart-card">
          <div class="chart-title">分类拦截次数</div>
          <v-chart :option="categoryBarOption" :autoresize="true" style="height: 350px" />
        </div>

        <div class="chart-card" style="margin-top: 20px">
          <div class="chart-title">分类时间趋势</div>
          <v-chart :option="categoryTrendOption" :autoresize="true" style="height: 400px" />
        </div>
      </div>

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
    </div>

    <!-- 空态 -->
    <el-empty v-else description="暂无数据" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
    console.error('加载风险拦截数据失败:', e)
  } finally {
    loading.value = false
  }
}

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
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
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
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
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

// 违规分类柱状图配置
const categoryBarOption = computed(() => {
  if (!statsData.value) return {}

  const categories = statsData.value.categoryDistribution
  const names = categories.map(c => c.name)
  const counts = categories.map(c => c.count)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
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
      axisLabel: { interval: 0, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: '拦截次数'
    },
    series: [
      {
        type: 'bar',
        data: counts,
        itemStyle: { color: '#3748FF' },
        barWidth: '60%'
      }
    ]
  }
})

// 违规分类时间趋势折线图配置
const categoryTrendOption = computed(() => {
  if (!statsData.value) return {}

  const trendData = statsData.value.categoryTrend
  const categories = statsData.value.categoryDistribution

  const dates = trendData.map(d => d.date.slice(5))
  const series = categories.map(cat => ({
    name: cat.name,
    type: 'line',
    smooth: true,
    data: trendData.map(d => d[cat.category] || 0)
  }))

  return {
    tooltip: { trigger: 'axis' },
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
      { type: 'inside', start: 0, end: 100 },
      { start: 0, end: 100 }
    ],
    series
  }
})

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
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
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
  const dates = trend.map(d => d.date.slice(5))
  const counts = trend.map(d => d.count)

  return {
    tooltip: { trigger: 'axis' },
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
        itemStyle: { color: '#E0901B' },
        areaStyle: { color: 'rgba(224, 144, 27, 0.1)' }
      }
    ]
  }
})

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

/* 响应式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 24px;
  }

  .pie-charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>



