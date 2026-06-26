<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand-section">
        <div class="brand-mark">AI</div>
        <div class="brand-text">
          <div class="brand-title">AI 辅导员</div>
          <div class="brand-subtitle">合肥工业大学</div>
        </div>
      </div>

      <nav class="nav-menu">
        <div class="nav-label">运营管理</div>
        <router-link to="/agents" class="nav-item" :class="{ active: route.path === '/agents' }">
          <el-icon><Cpu /></el-icon>
          <span>智能体管理</span>
        </router-link>
        <router-link to="/categories" class="nav-item" :class="{ active: route.path === '/categories' }">
          <el-icon><Grid /></el-icon>
          <span>分类管理</span>
        </router-link>
        <router-link to="/quick-questions" class="nav-item" :class="{ active: route.path === '/quick-questions' }">
          <el-icon><ChatDotRound /></el-icon>
          <span>快捷问题配置</span>
        </router-link>
        <router-link to="/feedback" class="nav-item" :class="{ active: route.path === '/feedback' }">
          <el-icon><ChatLineSquare /></el-icon>
          <span>用户反馈</span>
        </router-link>
        <router-link to="/psychological-warnings" class="nav-item" :class="{ active: route.path === '/psychological-warnings' }">
          <el-icon><Warning /></el-icon>
          <span>心理风险预警</span>
        </router-link>
        <router-link to="/risk-interception" class="nav-item" :class="{ active: route.path === '/risk-interception' }">
          <el-icon><Document /></el-icon>
          <span>风险拦截记录</span>
        </router-link>
        <router-link to="/user-management" class="nav-item" :class="{ active: route.path === '/user-management' }">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <el-dropdown trigger="click" placement="top-start" @command="handleCommand">
          <div class="user-chip">
            <div class="user-avatar">{{ avatarText }}</div>
            <div class="user-meta">
              <div class="user-name">{{ currentUser.name }}</div>
              <div class="user-role">{{ currentUser.username }}</div>
            </div>
            <el-icon class="user-arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="breadcrumb-section">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="pwdVisible"
      title="修改密码"
      width="440px"
      destroy-on-close
    >
      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="90px"
        @submit.prevent
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="pwdForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            placeholder="6-20位，建议字母+数字"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            autocomplete="new-password"
            @keyup.enter="submitChangePassword"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdSubmitting" @click="submitChangePassword">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Cpu, Grid, ChatDotRound, ChatLineSquare, Warning, Document, User, ArrowDown } from '@element-plus/icons-vue'
import { getCurrentUser, clearAuth } from '../utils/auth'
import { changePassword } from '../api/user'

const route = useRoute()
const router = useRouter()
const currentTitle = computed(() => route.meta.title || '')

// 当前登录用户
const currentUser = computed(() => getCurrentUser() || { name: '未登录', username: '' })
const avatarText = computed(() => (currentUser.value.name || '?').charAt(0))

// ===== 下拉菜单命令 =====
function handleCommand(command) {
  if (command === 'changePassword') {
    openChangePassword()
  } else if (command === 'logout') {
    handleLogout()
  }
}

// ===== 修改密码 =====
const pwdVisible = ref(false)
const pwdSubmitting = ref(false)
const pwdFormRef = ref(null)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const validateConfirm = (_rule, value, callback) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

function openChangePassword() {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdVisible.value = true
}

function submitChangePassword() {
  pwdFormRef.value.validate(async valid => {
    if (!valid) return
    pwdSubmitting.value = true
    try {
      await changePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      })
      pwdVisible.value = false
      ElMessage.success('密码修改成功，请重新登录')
      // 改密后清除登录态，强制重新登录
      clearAuth()
      router.replace('/login')
    } catch (e) {
      // 错误已由拦截器统一提示
    } finally {
      pwdSubmitting.value = false
    }
  })
}

// ===== 退出登录 =====
async function handleLogout() {
  try {
    await ElMessageBox.confirm('确认退出登录？', '退出登录', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消'
    })
    clearAuth()
    ElMessage.success('已退出登录')
    router.replace('/login')
  } catch (e) {
    // 取消
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--canvas);
}

/* ============ SIDEBAR ============ */
.sidebar {
  width: 236px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 22px 22px 18px;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  flex-shrink: 0;
  background: linear-gradient(140deg, var(--brand), #5A67FF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 6px 16px -4px rgba(55, 72, 255, 0.5);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-900);
  letter-spacing: -0.01em;
}

.brand-subtitle {
  font-size: 11px;
  color: var(--ink-400);
  font-weight: 500;
}

.nav-menu {
  padding: 6px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-400);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 10px 7px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: var(--r-sm);
  color: var(--ink-600);
  font-weight: 500;
  font-size: 13.5px;
  cursor: pointer;
  position: relative;
  transition: background 0.18s, color 0.18s;
  text-decoration: none;
}

.nav-item .el-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.nav-item:hover {
  background: var(--brand-50);
  color: var(--ink-900);
}

.nav-item.active {
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 600;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: -14px;
  top: 9px;
  bottom: 9px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--brand);
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface);
  cursor: pointer;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.user-chip:hover {
  border-color: var(--brand-200);
  box-shadow: var(--shadow-card);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3748FF, #7C4DFF);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.user-meta {
  flex: 1;
  line-height: 1.25;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-900);
}

.user-role {
  font-size: 11px;
  color: var(--ink-400);
}

.user-arrow {
  font-size: 16px;
  color: var(--ink-400);
}

/* ============ MAIN CONTAINER ============ */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-bar {
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: rgba(246, 247, 251, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 10;
}

.breadcrumb-section {
  display: flex;
  align-items: center;
}

.page-content {
  padding: 26px 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .page-content {
    padding: 16px;
  }
}
</style>
