<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getCheckCode, login, register } from '@/api/user'

const userStore = useUserStore()

const mode = ref('login') // login | register
const formRef = ref(null)
const submitting = ref(false)
const checkCodeImg = ref('')

const form = reactive({
  account: '',
  nickName: '',
  password: '',
  confirmPassword: '',
  checkCode: '',
  checkCodeKey: '',
})

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (!value) callback(new Error('请再次输入密码'))
        else if (value !== form.password) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

async function refreshCheckCode() {
  form.checkCode = ''
  try {
    const data = await getCheckCode()
    form.checkCodeKey = data.checkCodeKey
    const base64 = data.checkCodeBase64 || ''
    checkCodeImg.value = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
  } catch {
    checkCodeImg.value = ''
  }
}

function resetForm() {
  form.account = ''
  form.nickName = ''
  form.password = ''
  form.confirmPassword = ''
  formRef.value?.clearValidate()
  refreshCheckCode()
}

function switchMode(value) {
  mode.value = value
  resetForm()
}

watch(
  () => userStore.loginVisible,
  (visible) => {
    if (visible) {
      mode.value = 'login'
      resetForm()
    }
  },
)

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (mode.value === 'login') {
      const data = await login({
        account: form.account,
        password: form.password,
        checkCode: form.checkCode,
        checkCodeKey: form.checkCodeKey,
      })
      userStore.setLogin(data.token, data.userInfo)
      userStore.loginVisible = false
      ElMessage.success(`欢迎回来，${data.userInfo?.nickName || ''}`)
    } else {
      await register({
        account: form.account,
        nickName: form.nickName,
        password: form.password,
        checkCode: form.checkCode,
        checkCodeKey: form.checkCodeKey,
      })
      ElMessage.success('注册成功，请登录')
      const account = form.account
      switchMode('login')
      form.account = account
    }
  } catch {
    // 验证码为一次性使用，失败后后端已删除，需刷新
    refreshCheckCode()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="userStore.loginVisible"
    width="440px"
    :show-close="true"
    align-center
    class="login-dialog"
  >
    <div class="login-dialog__tabs">
      <span :class="{ active: mode === 'login' }" @click="switchMode('login')">密码登录</span>
      <i class="login-dialog__divider"></i>
      <span :class="{ active: mode === 'register' }" @click="switchMode('register')">注册账号</span>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
      <el-form-item prop="account">
        <el-input v-model="form.account" placeholder="请输入账号" clearable />
      </el-form-item>
      <el-form-item v-if="mode === 'register'" prop="nickName">
        <el-input v-model="form.nickName" placeholder="请输入昵称" maxlength="20" clearable />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item v-if="mode === 'register'" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item prop="checkCode">
        <div class="login-dialog__code">
          <el-input v-model="form.checkCode" placeholder="请输入验证码" @keyup.enter="handleSubmit" />
          <img
            v-if="checkCodeImg"
            :src="checkCodeImg"
            class="login-dialog__code-img"
            title="看不清？点击刷新"
            alt="验证码"
            @click="refreshCheckCode"
          />
          <span v-else class="login-dialog__code-img is-empty" @click="refreshCheckCode">点击获取</span>
        </div>
      </el-form-item>
      <el-button
        type="primary"
        class="login-dialog__submit"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'login' ? '登录' : '注册' }}
      </el-button>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.login-dialog__tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: -8px 0 24px;
  font-size: 18px;
  color: var(--text2);
}

.login-dialog__tabs span {
  cursor: pointer;
  transition: color 0.2s;
}

.login-dialog__tabs span.active,
.login-dialog__tabs span:hover {
  color: var(--bili-blue);
}

.login-dialog__divider {
  width: 1px;
  height: 18px;
  background: var(--line);
}

.login-dialog__code {
  display: flex;
  gap: 12px;
  width: 100%;
}

.login-dialog__code-img {
  flex-shrink: 0;
  width: 130px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  background: var(--graph-bg);
}

.login-dialog__code-img.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  font-size: 13px;
}

.login-dialog__submit {
  width: 100%;
  height: 40px;
  --el-button-bg-color: var(--bili-blue);
  --el-button-border-color: var(--bili-blue);
  --el-button-hover-bg-color: #40c5f1;
  --el-button-hover-border-color: #40c5f1;
}
</style>
