import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 开发环境走 Vite 代理（见 vite.config.js），baseURL 只保留路径前缀
const request = axios.create({
  baseURL: '/api/v1/client',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 统一解包 {status, code, info, data}；请求配置里传 silent: true 可关闭错误弹窗
request.interceptors.response.use(
  (response) => {
    const { status, code, info, data } = response.data || {}
    if (code === 200 && status === 'success') {
      return data
    }
    return handleError(response.config, code, info)
  },
  (error) => {
    const body = error.response?.data
    if (body?.code) {
      return handleError(error.config, body.code, body.info)
    }
    if (!error.config?.silent) {
      ElMessage.error('网络异常，请稍后重试')
    }
    return Promise.reject(error)
  },
)

function handleError(config, code, info) {
  if (code === 401) {
    const userStore = useUserStore()
    userStore.clearLogin()
    if (!config?.silent) {
      userStore.openLogin()
    }
  } else if (!config?.silent) {
    ElMessage.error(info || '请求失败')
  }
  return Promise.reject({ code, info })
}

export default request
