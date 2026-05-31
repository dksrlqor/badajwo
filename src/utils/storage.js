// 받아줘 storage layer.
// 현재는 localStorage 기반. 추후 Supabase / Firebase 등 백엔드로 교체할 수 있도록
// read/write 로직을 이 파일 안에 격리해 둔다.
//
// NOTE: 실서비스에서는 password 평문 저장 금지.
//       서버 측 hash 처리(bcrypt, argon2 등) 필수.

const ITEMS_KEY = 'badajwo:items'
const USERS_KEY = 'badajwo:users'
const SESSION_KEY = 'badajwo:session'
const PENDING_KEY = 'badajwo:pendingAuth'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') return fallback
    return parsed
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// ─── letters / diaries (items) ───────────────────────────────
export function saveItem(item) {
  if (!item || !item.id) return false
  const map = readJSON(ITEMS_KEY, {})
  map[item.id] = item
  return writeJSON(ITEMS_KEY, map)
}

export function getItem(id) {
  if (!id) return null
  const map = readJSON(ITEMS_KEY, {})
  return map[id] || null
}

export function removeItem(id) {
  const map = readJSON(ITEMS_KEY, {})
  if (map[id]) {
    delete map[id]
    writeJSON(ITEMS_KEY, map)
  }
}

export function listItems() {
  const map = readJSON(ITEMS_KEY, {})
  return Object.values(map).sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  )
}

export function listItemsBySender(userId) {
  if (!userId) return []
  return listItems().filter((it) => it.senderUserId === userId)
}

// ─── users ───────────────────────────────────────────────────
export function saveUser(user) {
  if (!user || !user.id) return false
  const map = readJSON(USERS_KEY, {})
  map[user.id] = user
  return writeJSON(USERS_KEY, map)
}

export function getUser(id) {
  if (!id) return null
  const map = readJSON(USERS_KEY, {})
  return map[id] || null
}

export function getUserBySubject(provider, subject) {
  if (!provider || !subject) return null
  const map = readJSON(USERS_KEY, {})
  return (
    Object.values(map).find(
      (u) => u.provider === provider && u.providerSubject === subject
    ) || null
  )
}

export function findUserByHandle(handle) {
  if (!handle) return null
  const lower = String(handle).toLowerCase()
  const map = readJSON(USERS_KEY, {})
  return Object.values(map).find((u) => u.handle === lower) || null
}

export function listUsers() {
  const map = readJSON(USERS_KEY, {})
  return Object.values(map)
}

// ─── session / pending auth ──────────────────────────────────
export function setSession(userId) {
  if (!userId) {
    clearSession()
    return
  }
  try {
    localStorage.setItem(SESSION_KEY, userId)
  } catch {}
}

export function getSession() {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}

export function savePendingAuth(auth) {
  writeJSON(PENDING_KEY, auth)
}

export function loadPendingAuth() {
  const v = readJSON(PENDING_KEY, null)
  return v && typeof v === 'object' && v.provider ? v : null
}

export function clearPendingAuth() {
  try {
    localStorage.removeItem(PENDING_KEY)
  } catch {}
}

export function loadCurrentUser() {
  const id = getSession()
  return id ? getUser(id) : null
}
