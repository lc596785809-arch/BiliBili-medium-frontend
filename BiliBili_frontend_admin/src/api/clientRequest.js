import axios from 'axios'
import { ElMessage } from 'element-plus'

// 仅用于调用 7071（medium_web）上公开、无需登录的只读接口
const clientRequest = axios.create({
  baseURL: 'http://localhost:7071',
  withCredentials: true,
})

clientRequest.interceptors.response.use(
  (response) => {
    const body = response.data

    if (body.code === 200) {
      if (body.status === 'error') {
        ElMessage.error(body.info)
        return Promise.reject(body)
      }
      return body.data
    }

    ElMessage.error(body.info)
    return Promise.reject(body)
  },
  (error) => {
    ElMessage.error('网络异常，请稍后重试')
    return Promise.reject(error)
  },
)

export default clientRequest
