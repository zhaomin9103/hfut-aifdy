<template>
  <div class="page-container">
    <!-- 统计概览 / 高危关键词配置 -->
    <div class="stats-section">
      <el-tabs v-model="topSectionTab" class="top-section-tabs">
        <!-- 风险统计 -->
        <el-tab-pane label="风险统计" name="stats">
          <div class="stats-header">
            <el-radio-group v-model="statsPeriod" size="small" @change="loadStats">
              <el-radio-button label="7">近 7 天</el-radio-button>
              <el-radio-button label="30">近 30 天</el-radio-button>
              <el-radio-button label="180">近 180 天</el-radio-button>
              <el-radio-button label="all">累计</el-radio-button>
            </el-radio-group>
          </div>
          <div class="stats-grid">
            <div
              v-for="card in statCards"
              :key="card.level"
              class="stat-card"
              :class="card.level.toLowerCase()"
            >
              <div class="stat-main">
                <div class="stat-label">
                  <span class="stat-dot"></span>
                  {{ card.label }}
                  <el-tooltip placement="top" :content="card.desc" effect="dark">
                    <el-icon class="stat-info"><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
                <div class="stat-sub">{{ card.sub }}</div>
              </div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 高危关键词配置 -->
        <el-tab-pane label="高危关键词配置" name="keywords">
          <div class="keywords-config">
            <div class="keywords-input-row">
              <el-input
                v-model="newKeyword"
                placeholder="请输入高危关键词,用于快路触发判断"
                maxlength="50"
                clearable
                @keyup.enter="addKeyword"
              />
              <el-button type="primary" :icon="Plus" @click="addKeyword" :loading="keywordAdding">
                添加
              </el-button>
            </div>

            <div v-loading="keywordsLoading" class="keywords-list">
              <div
                v-for="item in sortedKeywords"
                :key="item.id"
                class="keyword-tag"
              >
                <span class="keyword-text">{{ item.keyword }}</span>
                <el-icon class="keyword-delete" @click="deleteKeyword(item)"><Close /></el-icon>
              </div>
              <el-empty
                v-if="!keywordsLoading && keywordsData.length === 0"
                description="暂无关键词,请在上方添加"
                :image-size="80"
                style="width: 100%"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>


    <!-- 主表格卡片 -->
    <div class="card-compact" v-show="topSectionTab === 'stats'">
      <!-- 工具栏 -->
      <div class="card-toolbar">
        <el-select
          v-model="filters.riskLevel"
          placeholder="风险等级"
          clearable
          style="width: 140px"
          @change="loadData"
          @clear="loadData"
        >
          <el-option label="P0-紧急危机" value="P0" />
          <el-option label="P1-高危" value="P1" />
          <el-option label="P2-中危" value="P2" />
          <el-option label="P3-低危" value="P3" />
        </el-select>

        <el-select
          v-model="filters.riskTypes"
          placeholder="风险类型"
          multiple
          clearable
          collapse-tags
          style="width: 200px"
          @change="loadData"
          @clear="loadData"
        >
          <el-option label="情绪类" value="情绪类" />
          <el-option label="自伤自杀类" value="自伤自杀类" />
          <el-option label="人际关系类" value="人际关系类" />
          <el-option label="学业类" value="学业类" />
          <el-option label="家庭类" value="家庭类" />
          <el-option label="创伤类" value="创伤类" />
          <el-option label="成瘾类" value="成瘾类" />
          <el-option label="精神类" value="精神类" />
          <el-option label="发展类" value="发展类" />
          <el-option label="其他" value="其他" />
        </el-select>

        <el-select
          v-model="filters.emailStatus"
          placeholder="邮件状态"
          clearable
          style="width: 140px"
          @change="loadData"
          @clear="loadData"
        >
          <el-option label="已发送" value="sent" />
          <el-option label="发送失败" value="failed" />
        </el-select>

        <el-input
          v-model="filters.studentSearch"
          placeholder="学生姓名/学号"
          :prefix-icon="Search"
          clearable
          style="width: 180px"
          @clear="loadData"
          @input="resetPage"
        />

        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 360px"
          @change="handleDateChange"
        />

        <div class="toolbar-actions">
          <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button :icon="Download" @click="handleExport">导出</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" />

        <el-table-column label="学生信息" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="cell-name">{{ row.studentName }}</span>
              <span class="user-id mono">{{ row.studentNumber }}</span>
              <span class="user-meta">{{ row.college }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="风险等级" min-width="130">
          <template #default="{ row }">
            <el-tag :type="getRiskLevelType(row.riskLevel)" size="small">
              {{ getRiskLevelText(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="风险类型" min-width="200">
          <template #default="{ row }">
            <div class="risk-types-cell">
              <el-tag
                v-for="(type, idx) in row.riskTypes.slice(0, 3)"
                :key="idx"
                size="small"
                type="info"
              >
                {{ type }}
              </el-tag>
              <el-tag v-if="row.riskTypes.length > 3" size="small" type="info">
                +{{ row.riskTypes.length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="置信度" min-width="130">
          <template #default="{ row }">
            <div class="confidence-cell">
              <span class="confidence-value">{{ row.confidence }}%</span>
              <el-progress
                :percentage="row.confidence"
                :stroke-width="4"
                :show-text="false"
                :color="getConfidenceColor(row.confidence)"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="邮件状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getEmailStatusType(row.emailSendStatus)" size="small">
              {{ getEmailStatusText(row.emailSendStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="counselorName" label="辅导员" min-width="100" show-overflow-tooltip />

        <el-table-column prop="createdAt" label="研判时间" min-width="170">
          <template #default="{ row }">
            <span class="mono">{{ row.createdAt }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="card-footer">
        <div class="footer-left">
          <div class="footer-info">共 {{ pageInfo.total }} 条 · 每页 {{ pageInfo.size }} 条</div>
          <el-button
            v-if="selectedIds.length > 0"
            type="primary"
            size="small"
            @click="handleBatchMarkHandled"
          >
            批量标记已处理 ({{ selectedIds.length }})
          </el-button>
        </div>
        <el-pagination
          v-model:current-page="pageInfo.page"
          v-model:page-size="pageInfo.size"
          :total="pageInfo.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="prev, pager, next, sizes, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="心理风险预警详情"
      width="1000px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-if="currentDetail" class="detail-container">
        <!-- Tab 区 -->
        <el-tabs v-model="detailTab" class="detail-tabs">
          <!-- 概览：基本信息 + 学生信息 -->
          <el-tab-pane label="概览" name="overview">
            <el-card class="detail-card" shadow="never" style="margin-bottom: 16px">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                  <el-tag :type="getRiskLevelType(currentDetail.riskLevel)" size="large">
                    {{ getRiskLevelText(currentDetail.riskLevel) }}
                  </el-tag>
                </div>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="预警ID">{{ currentDetail.id }}</el-descriptions-item>
                <el-descriptions-item label="会话ID">{{ currentDetail.sessionId }}</el-descriptions-item>
                <el-descriptions-item label="研判时间" :span="2">{{ currentDetail.createdAt }}</el-descriptions-item>
                <el-descriptions-item label="触发关键词" :span="2" v-if="currentDetail.triggerKeywords">
                  <el-tag
                    v-for="(keyword, idx) in currentDetail.triggerKeywords"
                    :key="idx"
                    type="danger"
                    size="small"
                    style="margin-right: 6px"
                  >
                    {{ keyword }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card class="detail-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>学生信息</span>
                </div>
              </template>
              <el-descriptions :column="3" border>
                <el-descriptions-item label="姓名">{{ currentDetail.studentName }}</el-descriptions-item>
                <el-descriptions-item label="学号">{{ currentDetail.studentNumber }}</el-descriptions-item>
                <el-descriptions-item label="学院">{{ currentDetail.college }}</el-descriptions-item>
                <el-descriptions-item label="专业">{{ currentDetail.major }}</el-descriptions-item>
                <el-descriptions-item label="班级">{{ currentDetail.className }}</el-descriptions-item>
                <el-descriptions-item label="对应辅导员">{{ currentDetail.counselorName }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-tab-pane>

          <!-- 风险研判结果 -->
          <el-tab-pane label="风险研判结果" name="result">
            <div class="risk-result">
              <div class="result-item">
                <div class="result-label">风险类型</div>
                <div class="result-value">
                  <el-tag
                    v-for="(type, idx) in currentDetail.riskTypes"
                    :key="idx"
                    type="warning"
                    size="default"
                    style="margin-right: 8px; margin-bottom: 8px"
                  >
                    {{ type }}
                  </el-tag>
                </div>
              </div>
              <div class="result-item">
                <div class="result-label">置信度</div>
                <div class="result-value">
                  <span style="font-size: 24px; font-weight: 600; color: var(--brand)">
                    {{ currentDetail.confidence }}%
                  </span>
                  <el-progress
                    :percentage="currentDetail.confidence"
                    :stroke-width="8"
                    :color="getConfidenceColor(currentDetail.confidence)"
                    style="margin-top: 8px"
                  />
                </div>
              </div>
              <div class="result-item">
                <div class="result-label">研判依据</div>
                <div class="result-value reasoning-text">{{ currentDetail.reasoning }}</div>
              </div>
              <div class="result-item" v-if="currentDetail.suggestedAction">
                <div class="result-label">建议措施</div>
                <div class="result-value">
                  <div v-if="currentDetail.suggestedAction.immediateResponse" class="action-item">
                    <strong>立即响应:</strong> {{ currentDetail.suggestedAction.immediateResponse }}
                  </div>
                  <div v-if="currentDetail.suggestedAction.notifyTargets" class="action-item">
                    <strong>通知对象:</strong> {{ currentDetail.suggestedAction.notifyTargets.join(', ') }}
                  </div>
                  <div v-if="currentDetail.suggestedAction.intervention" class="action-item">
                    <strong>介入方式:</strong> {{ currentDetail.suggestedAction.intervention }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 关键证据 -->
          <el-tab-pane label="关键证据" name="evidence">
            <el-timeline>
              <el-timeline-item
                v-for="(item, idx) in evidenceDialogues"
                :key="idx"
                :timestamp="item.timestamp"
                placement="top"
                color="#C4612F"
              >
                <el-card class="evidence-card">
                  <div class="dialogue-meta">
                    <el-tag size="small" type="info">轮次 #{{ item.turnIndex }}</el-tag>
                    <el-tag size="small" :type="item.role === 'student' ? 'warning' : 'primary'">
                      {{ item.role === 'student' ? '学生' : 'AI辅导员' }}
                    </el-tag>
                    <el-tag v-if="item.contentType !== 'text'" size="small" type="success">
                      {{ getContentTypeLabel(item.contentType) }}
                    </el-tag>
                  </div>
                  <div class="dialogue-content evidence-highlight">{{ item.content }}</div>
                  <div class="evidence-reason" v-if="item.evidenceReason">
                    <el-icon color="#C4612F"><WarnTriangleFilled /></el-icon>
                    <span>{{ item.evidenceReason }}</span>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-if="evidenceDialogues.length === 0" description="暂无关键证据" :image-size="80" />
          </el-tab-pane>

          <!-- 对话记录 -->
          <el-tab-pane label="对话记录" name="dialogue">
            <el-timeline>
              <el-timeline-item
                v-for="(item, idx) in detailDialogues"
                :key="idx"
                :timestamp="item.timestamp"
                placement="top"
              >
                <el-card :class="['dialogue-card', { 'context-dialogue': item.isContext }]">
                  <div class="dialogue-meta">
                    <el-tag size="small" type="info">轮次 #{{ item.turnIndex }}</el-tag>
                    <el-tag size="small" :type="item.role === 'student' ? 'warning' : 'primary'">
                      {{ item.role === 'student' ? '学生' : 'AI辅导员' }}
                    </el-tag>
                    <el-tag v-if="item.contentType !== 'text'" size="small" type="success">
                      {{ getContentTypeLabel(item.contentType) }}
                    </el-tag>
                    <el-tag v-if="item.isContext" size="small" type="info">上下文</el-tag>
                  </div>
                  <div class="dialogue-content">{{ item.content }}</div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-if="detailDialogues.length === 0" description="暂无对话记录" :image-size="80" />
          </el-tab-pane>

          <!-- 邮件发送记录 -->
          <el-tab-pane label="邮件发送记录" name="email">
            <el-descriptions :column="2" border style="margin-bottom: 16px">
              <el-descriptions-item label="邮件状态">
                <el-tag :type="getEmailStatusType(currentDetail.emailSendStatus)" size="small">
                  {{ getEmailStatusText(currentDetail.emailSendStatus) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="收件人">
                {{ currentDetail.counselorName }} ({{ currentDetail.counselorEmail }})
              </el-descriptions-item>
              <el-descriptions-item label="发送决策">
                {{ currentDetail.emailSendDecision }}
              </el-descriptions-item>
              <el-descriptions-item label="去重判定" v-if="currentDetail.dedupResult">
                {{ currentDetail.dedupResult }}
              </el-descriptions-item>
            </el-descriptions>

            <el-table :data="emailLogs" size="small" border>
              <el-table-column prop="attemptOrder" label="尝试次序" width="90" />
              <el-table-column prop="sendTime" label="时间" width="180" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="failureReason" label="失败原因" min-width="200" show-overflow-tooltip />
              <el-table-column prop="retryAfterSeconds" label="重试间隔" width="100">
                <template #default="{ row }">
                  {{ row.retryAfterSeconds ? row.retryAfterSeconds + 's' : '-' }}
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="emailLogs.length === 0" description="暂无邮件发送记录" :image-size="80" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  InfoFilled,
  WarnTriangleFilled,
  Plus,
  Close
} from '@element-plus/icons-vue'
import {
  getWarnings,
  getWarningDetail,
  getWarningDialogues,
  getEmailLogs,
  getWarningStats,
  batchMarkHandled,
  exportWarnings
} from '../api/warning'

// 状态管理
const loading = ref(false)
const tableData = ref([])
const pageInfo = reactive({ page: 1, size: 10, total: 0 })
const selectedIds = ref([])
const dateRange = ref(null)

// 顶部切换tab (统计 vs 关键词配置)
const topSectionTab = ref('stats')

// 高危关键词配置
const keywordsLoading = ref(false)
const keywordsData = ref([])
const newKeyword = ref('')
const keywordAdding = ref(false)

// 按添加时间倒序展示
const sortedKeywords = computed(() =>
  [...keywordsData.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

// 统计数据
const statsPeriod = ref('30')
const stats = reactive({
  p0Count: 0,
  p1Count: 0,
  p2Count: 0,
  p3Count: 0
})

// 风险等级说明（鼠标悬停展示）
const RISK_LEVEL_INFO = {
  P0: 'P0-紧急危机:明确自杀计划/正在实施自伤/急性精神异常/幻觉妄想失控',
  P1: 'P1-高危风险:自杀意念表达/重度抑郁倾向/严重情绪崩溃/创伤急性反应',
  P2: 'P2-中危关注:持续情绪低落/明显社交退缩/学业人际严重困扰/睡眠食欲显著异常',
  P3: 'P3-低危预警:偶发负面情绪/轻度压力反应/一般性困惑/需一般性支持'
}

// 统计卡片配置
const statCards = computed(() => [
  { level: 'P0', label: 'P0 紧急危机', sub: '立即介入', value: stats.p0Count, desc: RISK_LEVEL_INFO.P0 },
  { level: 'P1', label: 'P1 高危风险', sub: '尽快处理', value: stats.p1Count, desc: RISK_LEVEL_INFO.P1 },
  { level: 'P2', label: 'P2 中危关注', sub: '持续关注', value: stats.p2Count, desc: RISK_LEVEL_INFO.P2 },
  { level: 'P3', label: 'P3 低危预警', sub: '一般支持', value: stats.p3Count, desc: RISK_LEVEL_INFO.P3 }
])

// 筛选条件
const filters = reactive({
  riskLevel: '',
  riskTypes: [],
  emailStatus: '',
  studentSearch: '',
  startTime: '',
  endTime: ''
})

// 详情弹窗
const detailVisible = ref(false)
const detailTab = ref('overview')
const currentDetail = ref(null)
const detailDialogues = ref([])
const emailLogs = ref([])

// 关键证据（从对话记录中筛选 isEvidence 为 true 的）
const evidenceDialogues = computed(() => detailDialogues.value.filter(d => d.isEvidence))

// 初始化加载
onMounted(() => {
  loadStats()
  loadData()
})

// 监听顶部 tab 切换
watch(topSectionTab, (newTab) => {
  if (newTab === 'keywords' && keywordsData.value.length === 0) {
    loadKeywords()
  }
})

// 加载统计数据
async function loadStats() {
  try {
    const res = await getWarningStats({ period: statsPeriod.value })
    Object.assign(stats, {
      p0Count: res.p0Count,
      p1Count: res.p1Count,
      p2Count: res.p2Count,
      p3Count: res.p3Count
    })
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

// 加载列表数据
async function loadData() {
  loading.value = true
  try {
    const params = {
      page: pageInfo.page,
      size: pageInfo.size,
      riskLevel: filters.riskLevel || undefined,
      riskTypes: filters.riskTypes.length > 0 ? filters.riskTypes.join(',') : undefined,
      emailStatus: filters.emailStatus || undefined,
      studentSearch: filters.studentSearch || undefined,
      startTime: filters.startTime || undefined,
      endTime: filters.endTime || undefined
    }
    const res = await getWarnings(params)
    tableData.value = res.list
    pageInfo.total = res.total
  } catch (e) {
    // 错误已由拦截器统一提示
  } finally {
    loading.value = false
  }
}

// 加载高危关键词列表
async function loadKeywords() {
  keywordsLoading.value = true
  try {
    // TODO: 调用实际API
    // const res = await getKeywords()
    // keywordsData.value = res.list

    // Mock数据
    await new Promise(resolve => setTimeout(resolve, 500))
    keywordsData.value = [
      { id: 1, keyword: '自杀', createdAt: '2024-01-15 10:30:00' },
      { id: 2, keyword: '想死', createdAt: '2024-01-15 10:31:00' },
      { id: 3, keyword: '抑郁', createdAt: '2024-01-15 10:32:00' }
    ]
  } catch (e) {
    ElMessage.error('加载关键词失败')
  } finally {
    keywordsLoading.value = false
  }
}

// 添加关键词
async function addKeyword() {
  const value = newKeyword.value.trim()
  if (!value) {
    ElMessage.warning('请输入关键词')
    return
  }
  if (keywordsData.value.some(k => k.keyword === value)) {
    ElMessage.warning('该关键词已存在')
    return
  }

  keywordAdding.value = true
  try {
    // TODO: 调用实际API
    // const res = await addKeywordApi({ keyword: value })

    // Mock延时
    await new Promise(resolve => setTimeout(resolve, 400))

    keywordsData.value.push({
      id: Date.now(),
      keyword: value,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    })
    newKeyword.value = ''
    ElMessage.success('添加成功')
  } catch (e) {
    ElMessage.error('添加失败')
  } finally {
    keywordAdding.value = false
  }
}

// 删除关键词
async function deleteKeyword(item) {
  try {
    // TODO: 调用实际API
    // await deleteKeywordApi(item.id)

    keywordsData.value = keywordsData.value.filter(k => k.id !== item.id)
    ElMessage.success('删除成功')
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

// 重置筛选
function resetPage() {
  pageInfo.page = 1
}

function handleReset() {
  Object.assign(filters, {
    riskLevel: '',
    riskTypes: [],
    emailStatus: '',
    studentSearch: '',
    startTime: '',
    endTime: ''
  })
  dateRange.value = null
  resetPage()
  loadData()
}

function handleDateChange(val) {
  if (val) {
    filters.startTime = val[0]
    filters.endTime = val[1]
  } else {
    filters.startTime = ''
    filters.endTime = ''
  }
  loadData()
}

// 表格多选
function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item.id)
}

// 查看详情
async function showDetail(row) {
  try {
    loading.value = true
    const [detail, dialogues, logs] = await Promise.all([
      getWarningDetail(row.id),
      getWarningDialogues(row.id),
      getEmailLogs(row.id)
    ])
    currentDetail.value = detail
    detailDialogues.value = dialogues
    emailLogs.value = logs
    detailTab.value = 'overview'
    detailVisible.value = true
  } catch (e) {
    // 错误已由拦截器统一提示
  } finally {
    loading.value = false
  }
}

// 批量标记已处理
async function handleBatchMarkHandled() {
  try {
    const { value } = await ElMessageBox.prompt(
      `确认将选中的 ${selectedIds.value.length} 条预警标记为已处理?`,
      '批量标记已处理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入处理情况说明'
      }
    )
    await batchMarkHandled(selectedIds.value, {
      handledBy: '系统管理员',
      remark: value || ''
    })
    ElMessage.success('批量操作成功')
    selectedIds.value = []
    loadData()
    loadStats()
  } catch (e) {
    if (e !== 'cancel') {
      // 错误已由拦截器统一提示
    }
  }
}

// 导出数据
async function handleExport() {
  try {
    loading.value = true
    const params = {
      riskLevel: filters.riskLevel || undefined,
      riskTypes: filters.riskTypes.length > 0 ? filters.riskTypes.join(',') : undefined,
      emailStatus: filters.emailStatus || undefined,
      studentSearch: filters.studentSearch || undefined,
      startTime: filters.startTime || undefined,
      endTime: filters.endTime || undefined
    }
    const blob = await exportWarnings(params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `心理风险预警_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

// 辅助函数 - 风险等级
function getRiskLevelText(level) {
  const map = {
    P0: '🚨 P0-紧急危机',
    P1: '🔴 P1-高危',
    P2: '🟡 P2-中危',
    P3: '🔵 P3-低危'
  }
  return map[level] || level
}

function getRiskLevelType(level) {
  const map = {
    P0: 'danger',
    P1: 'danger',
    P2: 'warning',
    P3: 'info'
  }
  return map[level] || 'info'
}

// 辅助函数 - 置信度颜色
function getConfidenceColor(confidence) {
  if (confidence >= 80) return '#67C23A'
  if (confidence >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 辅助函数 - 邮件状态（仅 已发送 / 发送失败 两态）
function getEmailStatusText(status) {
  const map = {
    sent: '已发送 ✓',
    failed: '发送失败 ✗'
  }
  return map[status] || status
}

function getEmailStatusType(status) {
  const map = {
    sent: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

// 辅助函数 - 内容类型
function getContentTypeLabel(type) {
  const map = {
    voice: '[语音转写]',
    image: '[图片OCR]',
    file: '[文件]'
  }
  return map[type] || type
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* 统计区 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stats-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-900);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border-radius: var(--r-md);
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-left: 4px solid var(--ink-300);
  transition: all 0.18s;
}

.stat-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.stat-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ink-700);
  font-weight: 600;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ink-300);
  flex-shrink: 0;
}

.stat-info {
  font-size: 14px;
  color: var(--ink-400);
  cursor: help;
}

.stat-info:hover {
  color: var(--brand);
}

.stat-sub {
  font-size: 12px;
  color: var(--ink-400);
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: var(--ink-900);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* 等级配色 */
.stat-card.p0 {
  border-left-color: var(--danger);
}
.stat-card.p0 .stat-dot {
  background: var(--danger);
}
.stat-card.p0 .stat-value {
  color: var(--danger);
}

.stat-card.p1 {
  border-left-color: #ff7d45;
}
.stat-card.p1 .stat-dot {
  background: #ff7d45;
}

.stat-card.p2 {
  border-left-color: var(--warn);
}
.stat-card.p2 .stat-dot {
  background: var(--warn);
}

.stat-card.p3 {
  border-left-color: var(--brand);
}
.stat-card.p3 .stat-dot {
  background: var(--brand);
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 顶部 tabs */
.top-section-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.top-section-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 15px;
}

.top-section-tabs :deep(.el-tabs__item.is-active) {
  color: var(--brand);
}

/* 高危关键词配置 */
.keywords-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.keywords-input-row {
  display: flex;
  gap: 12px;
  max-width: 520px;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 80px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  font-size: 14px;
  color: var(--ink-800);
  transition: all 0.18s;
  position: relative;
}

.keyword-tag:hover {
  border-color: var(--brand);
  box-shadow: var(--shadow-card);
}

.keyword-text {
  line-height: 1.4;
}

.keyword-delete {
  display: none;
  font-size: 14px;
  color: var(--ink-400);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.15s;
}

.keyword-delete:hover {
  color: var(--danger);
}

.keyword-tag:hover .keyword-delete {
  display: inline-flex;
}

/* 工具栏 */
.card-toolbar {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--line);
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.toolbar-actions .el-button + .el-button {
  margin-left: 0;
}

/* 表格单元格 */
.user-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cell-name {
  font-weight: 600;
  color: var(--ink-900);
  font-size: 14px;
}

.user-id {
  font-size: 12px;
  color: var(--ink-400);
}

.user-meta {
  font-size: 11px;
  color: var(--ink-300);
}

.risk-types-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.confidence-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.confidence-value {
  font-weight: 600;
  font-size: 14px;
  color: var(--ink-900);
}

/* 分页 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--line);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-info {
  font-size: 13px;
  color: var(--ink-400);
}

/* 详情弹窗 */
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  border: 1px solid var(--line);
}

/* 详情 Tab */
.detail-tabs {
  margin-top: 4px;
}

.detail-tabs :deep(.el-tabs__item) {
  font-weight: 600;
}

.detail-tabs :deep(.el-tabs__item.is-active) {
  color: var(--brand);
}

.detail-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--brand);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 15px;
}

.risk-result {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-600);
}

.result-value {
  font-size: 14px;
  color: var(--ink-800);
  line-height: 1.7;
}

.reasoning-text {
  background: var(--canvas);
  padding: 14px;
  border-radius: var(--r-sm);
  border-left: 3px solid var(--brand);
}

.action-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}

.action-item:last-child {
  border-bottom: none;
}

/* 对话卡片 */
.dialogue-card,
.evidence-card {
  border: 1px solid var(--line);
  box-shadow: none;
}

.context-dialogue {
  background: var(--canvas);
  opacity: 0.7;
}

.dialogue-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.dialogue-content {
  line-height: 1.7;
  color: var(--ink-800);
  white-space: pre-wrap;
  word-break: break-word;
}

.evidence-highlight {
  background: #fff7e6;
  padding: 12px;
  border-radius: var(--r-sm);
  border-left: 3px solid #C4612F;
  font-weight: 500;
}

.evidence-reason {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  font-size: 13px;
  color: #C4612F;
}

/* 工具类 */
.mono {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}
</style>

