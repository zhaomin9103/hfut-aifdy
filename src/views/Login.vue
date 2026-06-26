<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 品牌 -->
      <div class="login-brand">
        <div class="brand-mark">AI</div>
        <div class="brand-text">
          <div class="brand-title">AI 辅导员后台</div>
          <div class="brand-subtitle">合肥工业大学</div>
        </div>
      </div>

      <div class="login-heading">
        <h1>欢迎登录</h1>
        <p>请使用管理员分配的账号登录系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            :prefix-icon="User"
            clearable
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        如忘记密码，请联系系统管理员重置
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../api/user'
import { setAuth } from '../utils/auth'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function handleLogin() {
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const res = await login({
        username: form.username.trim(),
        password: form.password
      })
      setAuth(res.token, res.user)
      ElMessage.success('登录成功')
      // 支持登录后回跳到原目标页
      const redirect = route.query.redirect
      router.replace(typeof redirect === 'string' ? redirect : '/')
    } catch (e) {
      // 错误已由拦截器统一提示
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(1200px 600px at 50% -10%, var(--brand-soft), transparent),
    var(--canvas);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
  padding: 40px 36px 28px;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
  background: linear-gradient(140deg, var(--brand), #5A67FF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 17px;
  box-shadow: 0 6px 16px -4px rgba(55, 72, 255, 0.5);
}

.brand-text {
  line-height: 1.25;
}

.brand-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-900);
}

.brand-subtitle {
  font-size: 12px;
  color: var(--ink-400);
}

.login-heading {
  margin-bottom: 24px;
}

.login-heading h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 6px;
}

.login-heading p {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0;
}

.login-btn {
  width: 100%;
}

.login-footer {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--ink-400);
}
</style>
