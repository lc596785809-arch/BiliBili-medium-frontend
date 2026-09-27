import request from './request'

// 返回 { checkCodeKey, checkCodeBase64 }
export function getCheckCode() {
  return request.get('/checkCode')
}

// 返回 { token, userInfo }
export function login(data) {
  return request.post('/login', data)
}

export function register(data) {
  return request.post('/register', data)
}

// 返回 UserInfoVO；Token 失效时静默处理，不主动弹登录框
export function autoLogin() {
  return request.post('/autoLogin', null, { silent: true })
}

export function logout() {
  return request.post('/logout', null, { silent: true })
}
