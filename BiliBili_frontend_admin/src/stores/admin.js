import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'adminInfo'

function readFromSession() {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAdminStore = defineStore('admin', () => {
  const adminInfo = ref(readFromSession())

  const isLogin = computed(() => !!adminInfo.value)

  function setAdminInfo(info) {
    adminInfo.value = info
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info))
  }

  function clearAdminInfo() {
    adminInfo.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { adminInfo, isLogin, setAdminInfo, clearAdminInfo }
})
