import defaultAvatar from '@/assets/images/default-avatar.svg'

export { defaultAvatar }

// 图片地址：完整 URL 直接使用，相对路径拼接客户端图片资源接口
export function resolveImage(path, fallback = '') {
  if (!path) return fallback
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return `/api/v1/client/file/getResource?path=${encodeURIComponent(path)}`
}

export function resolveAvatar(path) {
  return resolveImage(path, defaultAvatar)
}

// 12345 -> 1.2万
export function formatCount(count) {
  const n = Number(count) || 0
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}亿`
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return String(n)
}

// 秒 -> mm:ss / h:mm:ss
export function formatDuration(seconds) {
  const s = Math.floor(Number(seconds) || 0)
  if (!s) return ''
  const pad = (v) => String(v).padStart(2, '0')
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

// 发布时间：1 小时内 "x分钟前"，1 天内 "x小时前"，今年 "M月D日"，更早 "YYYY-MM-DD"
export function formatPublishTime(value) {
  if (!value) return ''
  const date = new Date(typeof value === 'string' ? value.replace(' ', 'T') : value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  const now = new Date()
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  const pad = (v) => String(v).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
