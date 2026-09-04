import request from './request'

export function getCheckCode() {
  return request.get('/api/v1/admin/checkCode')
}

export function login(data) {
  return request.post('/api/v1/admin/login', data)
}

export function logout() {
  return request.post('/api/v1/admin/logout')
}
