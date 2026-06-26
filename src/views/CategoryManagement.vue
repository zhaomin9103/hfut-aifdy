<template>
  <div class="page-container">
    <div class="card-compact">
      <!-- Toolbar -->
      <div class="card-toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索分类名称"
          :prefix-icon="Search"
          clearable
          style="width: 220px"
          @clear="loadData"
          @input="resetPage"
        />
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增分类</el-button>
      </div>

      <!-- Table -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="160">
          <template #default="{ row }">
            <span class="cell-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="160" align="center">
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
            <el-popconfirm title="确定删除该分类？" @confirm="handleDelete(row)">
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
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="460px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入分类名称"
            maxlength="12"
            show-word-limit
          />
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
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/category'

const loading = ref(false)
const searchText = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const tableData = ref([])
const pageInfo = reactive({ page: 1, size: 10, total: 0 })

const initForm = () => ({ name: '' })
const form = reactive(initForm())

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 12, message: '不能超过12个字', trigger: 'blur' }
  ]
}

function resetPage() {
  pageInfo.page = 1
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCategories({
      page: pageInfo.page,
      size: pageInfo.size,
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

async function saveSort(row) {
  try {
    await updateCategory(row.id, { sortOrder: row.sortOrder })
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
        await updateCategory(editingId.value, { name: form.name })
      } else {
        await createCategory({ name: form.name })
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
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    // 错误已由拦截器统一提示
  }
}

onMounted(() => loadData())
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
