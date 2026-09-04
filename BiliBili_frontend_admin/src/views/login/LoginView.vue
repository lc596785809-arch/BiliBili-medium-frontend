<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Refresh } from '@element-plus/icons-vue'
import { getCheckCode, login } from '@/api/admin'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

const formRef = ref(null)
const loading = ref(false)
const checkCodeKey = ref('')
const checkCodeBase64 = ref('')

const form = reactive({
  account: '',
  password: '',
  checkCode: '',
})

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

// 601/603/605 等登录相关的业务失败码：需要额外刷新验证码并清空输入
const LOGIN_FAILURE_CODES = [601, 603, 605]

async function refreshCheckCode() {
  try {
    const data = await getCheckCode()
    checkCodeKey.value = data.checkCodeKey
    checkCodeBase64.value = data.checkCodeBase64
  } catch {
    // 拦截器已弹出错误提示
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const data = await login({
      account: form.account,
      password: form.password,
      checkCode: form.checkCode,
      checkCodeKey: checkCodeKey.value,
    })
    adminStore.setAdminInfo(data)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    if (LOGIN_FAILURE_CODES.includes(error?.code)) {
      form.checkCode = ''
      refreshCheckCode()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCheckCode()
})
</script>

<template>
  <div class="login-page">
    <el-card class="login-card">
      <h1 class="login-card__title">BiliBili 管理后台</h1>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        @keyup.enter="handleSubmit"
      >
        <el-form-item prop="account">
          <el-input v-model="form.account" placeholder="账号" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item prop="checkCode">
          <div class="login-card__check-code">
            <el-input v-model="form.checkCode" placeholder="验证码" />
            <img
              v-if="checkCodeBase64"
              :src="checkCodeBase64"
              alt="验证码"
              class="login-card__check-code-img"
              title="点击刷新验证码"
              @click="refreshCheckCode"
            />
            <el-button :icon="Refresh" circle @click="refreshCheckCode" />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-card__submit" :loading="loading" @click="handleSubmit">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
}

.login-card {
  width: 360px;
}

.login-card__title {
  margin: 0 0 24px;
  text-align: center;
  font-size: 20px;
}

.login-card__check-code {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.login-card__check-code-img {
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
}

.login-card__submit {
  width: 100%;
}
</style>
