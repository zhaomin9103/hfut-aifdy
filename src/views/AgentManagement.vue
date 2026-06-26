<template>
  <div class="page-container">
    <!-- Card Container -->
    <div class="card-compact">
      <!-- Toolbar -->
      <div class="card-toolbar">
        <div class="toolbar-left">
          <el-select
            v-model="categoryFilter"
            placeholder="全部分类"
            clearable
            style="width: 160px"
            @change="loadData"
            @clear="loadData"
          >
            <el-option
              v-for="c in categoryOptions"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
          <el-input
            v-model="searchText"
            placeholder="搜索智能体名称"
            :prefix-icon="Search"
            clearable
            style="width: 280px"
            @clear="loadData"
            @input="resetPage"
          />
        </div>
        <el-button type="primary" :icon="Plus" @click="openDialog()">添加智能体</el-button>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="智能体名称" min-width="200">
          <template #default="{ row }">
            <span class="cell-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="智能体链接" width="100" align="center">
          <template #default="{ row }">
            <el-link :href="row.link" target="_blank" type="primary" :underline="false">
              <el-icon :size="18"><Link /></el-icon>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sortOrder"
              :min="0"
              :max="99"
              size="small"
              controls-position="right"
              @change="saveSort(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除该智能体？" @confirm="handleDelete(row)">
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

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑智能体' : '添加智能体'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入智能体名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="c in categoryOptions"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="链接" prop="link">
          <el-input v-model="form.link" placeholder="请输入智能体链接地址" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="99" />
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
import { Search, Plus, Link } from '@element-plus/icons-vue'
import { getAgents, createAgent, updateAgent, deleteAgent } from '../api/agent'
import { getCategories } from '../api/category'

const categoryOptions = ref([])

const loading = ref(false)
const categoryFilter = ref('')
const searchText = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const tableData = ref([])
const pageInfo = reactive({ page: 1, size: 10, total: 0 })

const initForm = () => ({
  name: '',
  category: '',
  link: '',
  sortOrder: 0
})
const form = reactive(initForm())

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  link: [{ required: true, message: '请输入链接地址', trigger: 'blur' }]
}

function resetPage() {
  pageInfo.page = 1
}

async function loadCategoryOptions() {
  try {
    const res = await getCategories({ page: 1, size: 100 })
    categoryOptions.value = res.list.map(c => c.name)
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getAgents({
      page: pageInfo.page,
      size: pageInfo.size,
      category: categoryFilter.value || undefined,
      name: searchText.value || undefined
    })
    tableData.value = res.list
    pageInfo.total = res.total
  } catch (e) {
    // 错误已由拦截器统一提示
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(row) {
  try {
    await updateAgent(row.id, { status: row.status })
    ElMessage.success(`已${row.status === 'active' ? '启用' : '停用'}「${row.name}」`)
  } catch (e) {
    // 失败时回滚开关状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

async function saveSort(row) {
  try {
    await updateAgent(row.id, { sortOrder: row.sortOrder })
    ElMessage.success('排序已更新')
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    editingId.value = row.id
    form.name = row.name
    form.category = row.category
    form.link = row.link
    form.sortOrder = row.sortOrder
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
        await updateAgent(editingId.value, {
          name: form.name,
          category: form.category,
          link: form.link,
          sortOrder: form.sortOrder
        })
      } else {
        await createAgent({
          name: form.name,
          category: form.category,
          link: form.link,
          sortOrder: form.sortOrder
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
    await deleteAgent(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

onMounted(() => {
  loadCategoryOptions()
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
</style>
