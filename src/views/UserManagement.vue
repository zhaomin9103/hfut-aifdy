<template>
  <div class="page-container">
    <div class="card-compact">
      <!-- 工具栏 -->
      <div class="card-toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索用户名 / 姓名 / 工号"
          :prefix-icon="Search"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <div class="toolbar-actions">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增用户</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" min-width="160">
          <template #default="{ row }">
            <span class="mono">{{ row.username }}</span>
            <el-tag v-if="row.isAdmin" type="warning" size="small" effect="plain" style="margin-left: 8px">
              管理员
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <span class="cell-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="employeeId" label="工号" min-width="140">
          <template #default="{ row }">
            <span v-if="row.employeeId" class="mono">{{ row.employeeId }}</span>
            <span v-else class="text-placeholder">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <template v-if="row.isAdmin">
              <span class="text-placeholder">不可操作</span>
            </template>
            <template v-else>
              <el-button link type="primary" @click="handleResetPassword(row)">重置密码</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 新增用户弹窗 -->
    <el-dialog v-model="createVisible" title="新增用户" width="480px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入姓名" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="工号" prop="employeeId">
          <el-input v-model="createForm.employeeId" placeholder="选填" maxlength="20" />
        </el-form-item>
        <el-alert
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 4px"
        >
          <template #title>
            用户名将根据姓名全拼自动生成（重复则递增数字），初始密码为
            <strong>{{ DEFAULT_PASSWORD }}</strong>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 密码展示弹窗（新增成功 / 重置密码后） -->
    <el-dialog
      v-model="passwordVisible"
      :title="passwordDialog.title"
      width="440px"
      destroy-on-close
    >
      <div class="password-result">
        <el-result icon="success" :title="passwordDialog.subtitle">
          <template #extra>
            <div class="password-box">
              <div v-if="passwordDialog.username" class="password-row">
                <span class="password-label">用户名</span>
                <span class="mono password-value">{{ passwordDialog.username }}</span>
              </div>
              <div class="password-row">
                <span class="password-label">密码</span>
                <span class="mono password-value">{{ passwordDialog.password }}</span>
                <el-button type="primary" link :icon="CopyDocument" @click="copyPassword">
                  复制
                </el-button>
              </div>
            </div>
          </template>
        </el-result>
      </div>
      <template #footer>
        <el-button type="primary" @click="passwordVisible = false">知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<!-- SCRIPT_PLACEHOLDER -->
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, CopyDocument } from '@element-plus/icons-vue'
import { getUsers, createUser, resetUserPassword, deleteUser } from '../api/user'

const DEFAULT_PASSWORD = 'hfut123456'

// 列表状态
const loading = ref(false)
const searchText = ref('')
const tableData = ref([])
const pageInfo = reactive({ page: 1, size: 10, total: 0 })

// 新增用户弹窗
const createVisible = ref(false)
const submitting = ref(false)
const createFormRef = ref(null)
const createForm = reactive({ name: '', employeeId: '' })
const createRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 20, message: '姓名不能超过20个字', trigger: 'blur' }
  ]
}

// 密码展示弹窗
const passwordVisible = ref(false)
const passwordDialog = reactive({
  title: '',
  subtitle: '',
  username: '',
  password: ''
})

// ===== 列表 =====
async function loadData() {
  loading.value = true
  try {
    const res = await getUsers({
      page: pageInfo.page,
      size: pageInfo.size,
      keyword: searchText.value.trim() || undefined
    })
    tableData.value = res.list
    pageInfo.total = res.total
  } catch (e) {
    // 错误已由拦截器统一提示
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageInfo.page = 1
  loadData()
}

// ===== 新增用户 =====
function openCreateDialog() {
  createForm.name = ''
  createForm.employeeId = ''
  createVisible.value = true
}

function submitCreate() {
  createFormRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      const res = await createUser({
        name: createForm.name.trim(),
        employeeId: createForm.employeeId.trim()
      })
      createVisible.value = false
      ElMessage.success('创建成功')
      showPasswordDialog({
        title: '用户创建成功',
        subtitle: '请将以下账号信息告知用户',
        username: res.username,
        password: res.password
      })
      handleSearch()
    } catch (e) {
      // 错误已由拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}

// ===== 重置密码 =====
async function handleResetPassword(row) {
  try {
    await ElMessageBox.confirm(
      `确认将用户「${row.name}（${row.username}）」的密码重置为默认密码？`,
      '重置密码',
      { type: 'warning', confirmButtonText: '确认重置', cancelButtonText: '取消' }
    )
    const res = await resetUserPassword(row.id)
    ElMessage.success('密码已重置')
    showPasswordDialog({
      title: '密码重置成功',
      subtitle: `用户「${row.name}」的新密码如下`,
      username: row.username,
      password: res.password
    })
  } catch (e) {
    // 取消或接口错误（接口错误已由拦截器提示）
  }
}

// ===== 删除用户 =====
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除用户「${row.name}（${row.username}）」？该操作不可恢复。`,
      '删除用户',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    )
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    // 删除后若当前页已空，回退一页
    if (tableData.value.length === 1 && pageInfo.page > 1) {
      pageInfo.page -= 1
    }
    loadData()
  } catch (e) {
    // 取消或接口错误
  }
}

// ===== 密码展示与复制 =====
function showPasswordDialog({ title, subtitle, username, password }) {
  passwordDialog.title = title
  passwordDialog.subtitle = subtitle
  passwordDialog.username = username
  passwordDialog.password = password
  passwordVisible.value = true
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(passwordDialog.password)
    ElMessage.success('密码已复制到剪贴板')
  } catch (e) {
    // 降级方案：clipboard API 不可用（非 HTTPS / 旧浏览器）
    fallbackCopy(passwordDialog.password)
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    ElMessage.success('密码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  } finally {
    document.body.removeChild(textarea)
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

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

.mono {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: var(--ink-700);
}

.text-placeholder {
  color: var(--ink-300);
  font-size: 13px;
}

/* 密码展示弹窗 */
.password-result :deep(.el-result) {
  padding: 12px 0 0;
}

.password-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  min-width: 300px;
}

.password-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}

.password-label {
  font-size: 13px;
  color: var(--ink-500);
  width: 48px;
  flex-shrink: 0;
  text-align: left;
}

.password-value {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-900);
  letter-spacing: 0.5px;
}
</style>
