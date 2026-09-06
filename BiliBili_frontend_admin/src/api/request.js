import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useAdminStore } from '@/stores/admin'

export const ADMIN_BASE_URL = 'http://localhost:7072/admin'

const request = axios.create({
  baseURL: ADMIN_BASE_URL,
  withCredentials: true,
})

request.interceptors.response.use(
  (response) => {
    const body = response.data

    if (body.code === 200) {
      if (body.status === 'error') {
        ElMessage.error(body.info)
        return Promise.reject(body)
      }
      return body.data
    }

    if (body.code === 401) {
      useAdminStore().clearAdminInfo()
      ElMessage.error('登录已失效，请重新登录')
      router.push('/login')
      return Promise.reject(body)
    }

    if (body.code >= 600) {
      ElMessage.error(body.info)
      return Promise.reject(body)
    }

    return Promise.reject(body)
  },
  (error) => {
    ElMessage.error('网络异常，请稍后重试')
    return Promise.reject(error)
  },
)

export default request
