<template>
  <div class="page-container">
    <!-- 统计概览 -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <el-icon><ChatLineSquare /></el-icon>
        </div>
        <div class="stat-main">
          <div class="stat-label">反馈总数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </div>
      <div
        v-for="item in stats.typeStats"
        :key="item.type"
        class="stat-card"
      >
        <div class="stat-main">
          <div class="stat-label">{{ item.type }}占比</div>
          <div class="stat-value">
            {{ item.percent }}<span class="stat-unit">%</span>
            <span class="stat-sub">{{ item.count }} 条</span>
          </div>
          <el-progress
            :percentage="item.percent"
            :stroke-width="6"
            :show-text="false"
            :color="getTypeColor(item.type)"
            class="stat-progress"
          />
        </div>
      </div>
    </div>

    <div class="card-compact">
      <!-- Toolbar -->
      <div class="card-toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="userSearch"
            placeholder="搜索用户姓名/用户名"
            :prefix-icon="Search"
            clearable
            style="width: 220px"
            @clear="loadData"
            @input="resetPage"
          />
          <el-select
            v-model="typeFilter"
            placeholder="反馈类型"
            clearable
            style="width: 140px"
            @change="loadData"
            @clear="loadData"
          >
            <el-option label="反馈" value="反馈" />
            <el-option label="建议" value="建议" />
          </el-select>
          <el-select
            v-model="statusFilter"
            placeholder="处理状态"
            clearable
            style="width: 140px"
            @change="loadData"
            @clear="loadData"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
          </el-select>
          <el-button type="primary" :icon="Refresh" @click="loadData">查询</el-button>
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column label="反馈用户" width="180">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="cell-name">{{ row.userName }}</span>
              <span class="user-id mono">{{ row.userId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="agentName" label="反馈来源" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.agentName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="反馈类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === '反馈' ? 'danger' : 'primary'" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="问题描述" min-width="280">
          <template #default="{ row }">
            <span v-if="row.content.length > 40" class="link-text" @click="showFullContent(row)">
              {{ row.content.slice(0, 40) }}...
            </span>
            <span v-else>{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="180">
          <template #default="{ row }">
            <div v-if="row.images && row.images.length > 0" class="image-thumbnails">
              <div
                v-for="(img, index) in row.images.slice(0, 3)"
                :key="index"
                class="thumbnail-item"
                @click="previewImages(row.images, index)"
              >
                <img :src="img" :alt="`图片${index + 1}`" />
                <div v-if="index === 2 && row.images.length > 3" class="thumbnail-more">
                  +{{ row.images.length - 3 }}
                </div>
              </div>
            </div>
            <span v-else class="no-image">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'pending' ? 'warning' : 'success'" size="small">
              <span class="status-dot" :class="row.status"></span>
              {{ row.status === 'pending' ? '待处理' : '已处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="反馈时间" width="180">
          <template #default="{ row }">
            <span class="mono">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              @click="openProcessDialog(row)"
            >
              处理
            </el-button>
            <el-button
              v-else
              link
              type="primary"
              @click="openResultDialog(row)"
            >
              处理结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="card-footer">
        <div class="footer-info">共 {{ pageInfo.total }} 条 · 每页 {{ pageInfo.size }} 条</div>
        <el-pagination
          v-model:current-page="pageInfo.page"
          v-model:page-size="pageInfo.size"
          :total="pageInfo.total"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, sizes, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- Full Content Dialog -->
    <el-dialog v-model="contentVisible" title="问题详情" width="520px">
      <p style="white-space: pre-wrap; line-height: 1.8; color: var(--ink-700);">{{ currentContent }}</p>
      <template #footer>
        <el-button type="primary" @click="contentVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 处理反馈 Dialog -->
    <el-dialog v-model="processVisible" title="处理反馈" width="560px" :close-on-click-modal="false">
      <div v-if="currentRow" class="process-context">
        <div class="context-row">
          <span class="context-label">反馈用户</span>
          <span>{{ currentRow.userName }}（{{ currentRow.userId }}）</span>
        </div>
        <div class="context-row">
          <span class="context-label">反馈内容</span>
          <span class="context-content">{{ currentRow.content }}</span>
        </div>
      </div>
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="80px" style="margin-top: 18px">
        <el-form-item label="处理人" prop="handledBy">
          <el-input v-model="processForm.handledBy" placeholder="请输入处理人姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="处理记录" prop="handledRemark">
          <el-input
            v-model="processForm.handledRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理情况说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitProcess">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 处理结果 Dialog -->
    <el-dialog v-model="resultVisible" title="处理结果" width="560px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="反馈用户">
          {{ currentRow.userName }}（{{ currentRow.userId }}）
        </el-descriptions-item>
        <el-descriptions-item label="反馈内容">
          <span style="white-space: pre-wrap;">{{ currentRow.content }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentRow.handledBy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ currentRow.handledTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理记录">
          <span style="white-space: pre-wrap;">{{ currentRow.handledRemark || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="resultVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 图片预览 Dialog -->
    <el-dialog v-model="imagePreviewVisible" :width="imagePreviewWidth" class="image-preview-dialog">
      <template #header>
        <div class="preview-header">
          <span>图片预览（{{ currentImageIndex + 1 }} / {{ previewImageList.length }}）</span>
        </div>
      </template>
      <div class="preview-content">
        <img :src="previewImageList[currentImageIndex]" alt="预览图" class="preview-image" />
      </div>
      <template #footer>
        <div class="preview-footer">
          <el-button
            :disabled="currentImageIndex === 0"
            @click="currentImageIndex--"
          >
            上一张
          </el-button>
          <span class="preview-indicator">{{ currentImageIndex + 1 }} / {{ previewImageList.length }}</span>
          <el-button
            :disabled="currentImageIndex === previewImageList.length - 1"
            @click="currentImageIndex++"
          >
            下一张
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, ChatLineSquare } from '@element-plus/icons-vue'
import { getFeedbackRecords, getFeedbackStats, updateFeedbackStatus } from '../api/feedback'

const loading = ref(false)
const userSearch = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const contentVisible = ref(false)
const currentContent = ref('')

const tableData = ref([])
const pageInfo = reactive({ page: 1, size: 10, total: 0 })

// 统计数据
const stats = reactive({ total: 0, pendingCount: 0, processedCount: 0, typeStats: [] })

// 处理 / 处理结果弹窗
const processVisible = ref(false)
const resultVisible = ref(false)
const submitting = ref(false)
const currentRow = ref(null)
const processFormRef = ref(null)
const processForm = reactive({ handledBy: '', handledRemark: '' })
const processRules = {
  handledBy: [{ required: true, message: '请输入处理人', trigger: 'blur' }],
  handledRemark: [{ required: true, message: '请输入处理记录', trigger: 'blur' }]
}

// 图片预览
const imagePreviewVisible = ref(false)
const previewImageList = ref([])
const currentImageIndex = ref(0)
const imagePreviewWidth = computed(() => {
  // 响应式预览宽度
  return window.innerWidth > 1200 ? '70%' : window.innerWidth > 768 ? '85%' : '95%'
})

function resetPage() {
  pageInfo.page = 1
}

async function loadData() {
  loading.value = true
  try {
    const res = await getFeedbackRecords({
      page: pageInfo.page,
      size: pageInfo.size,
      userSearch: userSearch.value || undefined,
      type: typeFilter.value || undefined,
      status: statusFilter.value || undefined
    })
    tableData.value = res.list
    pageInfo.total = res.total
  } catch (e) {
    // 错误已由拦截器统一提示
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await getFeedbackStats()
    Object.assign(stats, res)
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

function showFullContent(row) {
  currentContent.value = row.content
  contentVisible.value = true
}

// 打开处理弹窗
function openProcessDialog(row) {
  currentRow.value = row
  processForm.handledBy = ''
  processForm.handledRemark = ''
  processFormRef.value?.clearValidate()
  processVisible.value = true
}

// 提交处理
async function submitProcess() {
  if (!processFormRef.value) return
  await processFormRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      await updateFeedbackStatus(currentRow.value.id, {
        status: 'processed',
        handledBy: processForm.handledBy,
        handledRemark: processForm.handledRemark
      })
      ElMessage.success('反馈已处理')
      processVisible.value = false
      loadData()
      loadStats()
    } catch (e) {
      // 错误已由拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}

// 查看处理结果
function openResultDialog(row) {
  currentRow.value = row
  resultVisible.value = true
}

// 反馈类型进度条配色
function getTypeColor(type) {
  return type === '反馈' ? '#E5484D' : '#3748FF'
}

// 预览图片
function previewImages(images, startIndex = 0) {
  previewImageList.value = images
  currentImageIndex.value = startIndex
  imagePreviewVisible.value = true
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
  transition: all 0.18s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: var(--brand-soft);
  color: var(--brand);
}

.stat-card.total .stat-value {
  color: var(--brand);
}

.stat-main {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: var(--ink-500);
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink-900);
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat-unit {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-500);
}

.stat-sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-400);
  margin-left: auto;
}

.stat-progress {
  margin-top: 8px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 处理弹窗上下文 */
.process-context {
  background: var(--canvas);
  border-radius: var(--r-sm);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.context-row {
  display: flex;
  gap: 10px;
  font-size: 13px;
  line-height: 1.7;
}

.context-label {
  flex-shrink: 0;
  width: 56px;
  color: var(--ink-500);
  font-weight: 600;
}

.context-content {
  color: var(--ink-700);
  white-space: pre-wrap;
  word-break: break-word;
}

.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--line);
  gap: 14px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid var(--line);
}

.footer-info {
  font-size: 13px;
  color: var(--ink-400);
}

.cell-name {
  font-weight: 600;
  color: var(--ink-900);
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-id {
  font-size: 12px;
  color: var(--ink-400);
}

.link-text {
  color: var(--brand);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--brand-200);
  transition: all 0.18s;
}

.link-text:hover {
  color: var(--brand-hover);
  text-decoration-color: var(--brand);
}

/* 图片缩略图 */
.image-thumbnails {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.thumbnail-item {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: var(--r-sm);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--line);
  transition: all 0.2s;
}

.thumbnail-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-more {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.no-image {
  color: var(--ink-300);
  font-size: 14px;
}

/* 图片预览对话框 */
.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-900);
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  max-height: 70vh;
  background: var(--canvas);
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--r-md);
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.preview-indicator {
  font-size: 14px;
  color: var(--ink-600);
  min-width: 80px;
  text-align: center;
}
</style>
