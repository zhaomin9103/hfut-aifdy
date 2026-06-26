<template>
  <div class="page-container">
    <div class="card-compact">
      <!-- Toolbar -->
      <div class="card-toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索问题名称"
          :prefix-icon="Search"
          clearable
          style="width: 280px"
          @clear="loadData"
          @input="resetPage"
        />
        <el-button type="primary" :icon="Plus" @click="openDialog()">添加问题</el-button>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="问题名称" min-width="200">
          <template #default="{ row }">
            <span class="cell-name">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="agentName" label="关联智能体" width="160">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.agentName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="useCount" label="点击次数" width="120" align="center">
          <template #default="{ row }">
            <span class="mono">{{ row.useCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该问题？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
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

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑快捷问题' : '添加快捷问题'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="问题" prop="title">
          <el-input
            v-model="form.title"
            type="textarea"
            :rows="4"
            placeholder="请输入问题内容"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="关联智能体" prop="agentId">
          <el-select v-model="form.agentId" placeholder="请选择关联智能体" style="width: 100%" filterable>
            <el-option
              v-for="a in agentOptions"
              :key="a.id"
              :label="a.name"
              :value="a.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import {
  getQuickQuestions,
  createQuickQuestion,
  updateQuickQuestion,
  deleteQuickQuestion
} from '../api/quickQuestion'
import { getAgents } from '../api/agent'

const agentOptions = ref([])

const loading = ref(false)
const searchText = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const tableData = ref([])
const pageInfo = reactive({ page: 1, size: 10, total: 0 })

const initForm = () => ({
  title: '',
  agentId: ''
})
const form = reactive(initForm())

const rules = {
  title: [{ required: true, message: '请输入问题内容', trigger: 'blur' }],
  agentId: [{ required: true, message: '请选择关联智能体', trigger: 'change' }]
}

function resetPage() {
  pageInfo.page = 1
}

async function loadAgentOptions() {
  try {
    const res = await getAgents({ page: 1, size: 100 })
    agentOptions.value = res.list
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getQuickQuestions({
      page: pageInfo.page,
      size: pageInfo.size,
      title: searchText.value || undefined
    })
    tableData.value = res.list
    pageInfo.total = res.total
  } catch (e) {
    // 错误已由拦截器统一提示
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    editingId.value = row.id
    form.title = row.title
    form.agentId = row.agentId
  } else {
    isEdit.value = false
    editingId.value = null
    Object.assign(form, initForm())
  }
  dialogVisible.value = true
}

function handleSubmit() {
  formRef.value.validate(async valid => {
    if (!valid) return
    try {
      if (isEdit.value) {
        await updateQuickQuestion(editingId.value, {
          title: form.title,
          agentId: form.agentId
        })
      } else {
        await createQuickQuestion({
          title: form.title,
          agentId: form.agentId
        })
      }
      dialogVisible.value = false
      ElMessage.success('操作成功')
      loadData()
    } catch (e) {
      // 错误已由拦截器统一提示
    }
  })
}

async function handleDelete(row) {
  try {
    await deleteQuickQuestion(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

onMounted(() => {
  loadAgentOptions()
  loadData()
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 22px;
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
</style>
