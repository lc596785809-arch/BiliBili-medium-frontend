import { defineStore } from 'pinia'
import { autoLogin as autoLoginApi, logout as logoutApi } from '@/api/user'

const TOKEN_KEY = 'bili_token'
const USER_KEY = 'bili_user'

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    userInfo: readUser(),
    loginVisible: false,
  }),
  getters: {
    isLogin: (state) => !!state.token && !!state.userInfo,
  },
  actions: {
    setLogin(token, userInfo) {
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    },
    clearLogin() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
    openLogin() {
      this.loginVisible = true
    },
    async autoLogin() {
      if (!this.token) return
      try {
        this.setUserInfo(await autoLoginApi())
      } catch {
        // 401 已在拦截器中清空登录态
      }
    },
    async logout() {
      try {
        await logoutApi()
      } finally {
        this.clearLogin()
      }
    },
  },
})
