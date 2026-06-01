// 받아줘 storage layer (v2).
// 새 아키텍처: users 는 username 기반, letters 는 receiverId 로 inbox 분리.
// receiver 는 URL username 조회 결과 / 검색 결과로만 결정되어야 한다.
// auth.currentUser 가 receiver 로 자동 매핑되는 일이 없도록 storage 단에서도 강제하지 않는다.
//
// 백엔드 (Supabase / Firebase) 로 옮길 때:
//   - 모든 read/write 가 이 파일을 거치므로 함수 시그니처만 유지하면 됨
//   - users 는 unique(username), unique(googleSub) 인덱스
//   - letters 는 (receiverId, createdAt) 인덱스, RLS 로 receiverId === auth.uid 인 row 만 read
//
// NOTE: 평문 저장이라 실서비스 전엔 반드시 서버 측 보안 적용.

const USERS_KEY     = 'badajwo:users'        // { [id]: user }
const USERNAME_KEY  = 'badajwo:usernameToId' // { [usernameLower]: userId }
const GOOGLE_KEY    = 'badajwo:googleToId'   // { [googleSub]: userId }
const LETTERS_KEY   = 'badajwo:letters'      // { [id]: letter }
const SESSION_KEY   = 'badajwo:session'      // userId string
// 간단 링크 — letters / user inbox 와 완전히 분리.
const QUICK_LINKS_KEY    = 'badajwo:quickLinks'    // { [id]: quickLink }
const QUICK_CODE_KEY     = 'badajwo:quickCodeToId' // { [code]: quickLinkId }
const QUICK_MESSAGES_KEY = 'badajwo:quickMessages' // { [id]: quickMessage }

// ── 기존 legacy 키 (옛 메인 플로우용 — 새 메인에서는 사용 안 함) ──
const LEGACY_ITEMS_KEY = 'badajwo:items'
const LEGACY_ASKS_KEY  = 'badajwo:askRequests'

// 예약된 username (라우트와 충돌 / 시스템 단어)
export const RESERVED_USERNAMES = new Set([
  'me','u','write','login','onboarding','privacy','letter','letters',
  'api','admin','app','www','about','help','support','contact',
  'system','root','official','받아줘','takemyletter','create','complete',
  'view','ask','inbox','archive','feed','public','my'
])

// ─── low-level json helpers ─────────────────────────────
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

// ─── id helpers ─────────────────────────────────────────
function makeId() {
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 9)
  )
}

// ─── username validation ────────────────────────────────
export function validateUsername(raw) {
  const u = String(raw || '').trim().toLowerCase()
  if (!u) return { ok: false, reason: '아이디를 적어주세요.' }
  if (u.length < 3) return { ok: false, reason: '아이디는 3자 이상이어야 해요.' }
  if (u.length > 20) return { ok: false, reason: '아이디는 20자 이하로 적어주세요.' }
  if (!/^[a-z0-9]+$/.test(u))
    return { ok: false, reason: '영문 소문자와 숫자만 쓸 수 있어요.' }
  if (RESERVED_USERNAMES.has(u))
    return { ok: false, reason: '이 아이디는 사용할 수 없어요.' }
  return { ok: true, normalized: u }
}

export function isUsernameAvailable(username) {
  const v = validateUsername(username)
  if (!v.ok) return false
  const map = readJSON(USERNAME_KEY, {})
  return !map[v.normalized]
}

// ─── 추천 아이디 생성 — 사용자 개인정보 일절 사용 금지 ───
// wordA + wordB + (선택)숫자 조합. 모두 일반 감성 단어. user.displayName/email/googleSub
// 등은 절대 인풋으로 받지 않는다.
const WORD_A = [
  'paper','moon','blue','soft','dear','warm','star','cloud','letter','spring',
  'tiny','cozy','gentle','ivory','night','sunny','rosy','lavender','quiet','calm',
  'misty','clear','sage','amber'
]
const WORD_B = [
  'post','room','note','box','mail','letter','garden','page','archive',
  'diary','stamp','envelope','desk','book','pocket','sketch'
]
export function suggestRandomUsername() {
  // 사용자에 의존하지 않는 순수 랜덤. 길이 3~20 자 보장.
  for (let attempt = 0; attempt < 32; attempt++) {
    const a = WORD_A[Math.floor(Math.random() * WORD_A.length)]
    const b = WORD_B[Math.floor(Math.random() * WORD_B.length)]
    const withNumber = Math.random() < 0.55
    const n = withNumber ? Math.floor(Math.random() * 100) : ''
    const candidate = (a + b + n).toLowerCase()
    const v = validateUsername(candidate)
    if (!v.ok) continue
    if (!isUsernameAvailable(v.normalized)) continue
    return v.normalized
  }
  // 만약 32회 모두 collision/invalid 면 단순 단어 + 4자리 숫자 fallback
  const fallback = 'letter' + Math.floor(1000 + Math.random() * 9000)
  return fallback
}

// 정적인 placeholder 예시 (회전용) — UI 가 useState 로 사용.
// 사용자 정보 절대 미포함. 하드코딩된 일반 단어.
export const PLACEHOLDER_USERNAMES = [
  'paperstar', 'blueletter', 'moonpost24', 'dearroom', 'letterbox7',
  'softletter', 'warmnote', 'cloudmail', 'starpost', 'springpaper'
]

// ─── users ──────────────────────────────────────────────
// user shape:
//   { id, googleSub, email, displayName, username,
//     profileImage, profileImageSource: 'google'|'upload'|'default',
//     createdAt, updatedAt }

export function getUser(id) {
  if (!id) return null
  const users = readJSON(USERS_KEY, {})
  return users[id] || null
}

export function getUserByUsername(username) {
  const u = String(username || '').trim().toLowerCase()
  if (!u) return null
  const map = readJSON(USERNAME_KEY, {})
  const id = map[u]
  return id ? getUser(id) : null
}

export function getUserByGoogleSub(googleSub) {
  if (!googleSub) return null
  const map = readJSON(GOOGLE_KEY, {})
  const id = map[googleSub]
  return id ? getUser(id) : null
}

// Google 로그인 후 user 가 처음 들어왔을 때.
// 기존 user 가 있으면 그대로 반환, 없으면 username 없이 새로 만들어 반환.
// username 은 /onboarding 에서 별도로 세팅.
export function findOrCreateGoogleUser({ googleSub, email, displayName, profileImage }) {
  if (!googleSub) return null
  const existing = getUserByGoogleSub(googleSub)
  if (existing) return existing
  const id = makeId()
  const user = {
    id,
    googleSub,
    email: email || '',
    displayName: displayName || '',
    username: null,
    profileImage: profileImage || '',
    profileImageSource: profileImage ? 'google' : 'default',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  const users = readJSON(USERS_KEY, {})
  users[id] = user
  writeJSON(USERS_KEY, users)
  const gmap = readJSON(GOOGLE_KEY, {})
  gmap[googleSub] = id
  writeJSON(GOOGLE_KEY, gmap)
  return user
}

// 개발 모드 / OAuth client_id 없을 때 사용할 mock 로그인.
// 실제 운영에서는 안 보이게 막을 것.
export function findOrCreateMockUser({ key, displayName, profileImage }) {
  const fakeSub = 'mock:' + key
  return findOrCreateGoogleUser({
    googleSub: fakeSub,
    email: `${key}@local.test`,
    displayName: displayName || key,
    profileImage: profileImage || ''
  })
}

// username 을 처음 정하거나 바꿀 때.
export function setUsername(userId, rawUsername) {
  const v = validateUsername(rawUsername)
  if (!v.ok) return { ok: false, reason: v.reason }
  const u = v.normalized
  const usernameMap = readJSON(USERNAME_KEY, {})
  const existing = usernameMap[u]
  if (existing && existing !== userId) {
    return { ok: false, reason: '이미 누가 쓰고 있는 아이디예요.' }
  }
  const users = readJSON(USERS_KEY, {})
  const user = users[userId]
  if (!user) return { ok: false, reason: '계정을 찾지 못했어요.' }
  // 옛 username 인덱스 정리
  if (user.username && user.username !== u) {
    delete usernameMap[user.username]
  }
  user.username = u
  user.updatedAt = Date.now()
  users[userId] = user
  usernameMap[u] = userId
  writeJSON(USERS_KEY, users)
  writeJSON(USERNAME_KEY, usernameMap)
  return { ok: true, user }
}

export function updateUserProfile(userId, patch) {
  const users = readJSON(USERS_KEY, {})
  const user = users[userId]
  if (!user) return null
  const next = { ...user, ...patch, updatedAt: Date.now() }
  // username 은 setUsername 만 통해서 바꾸도록 막아둠
  next.username = user.username
  next.id = user.id
  next.googleSub = user.googleSub
  next.createdAt = user.createdAt
  users[userId] = next
  writeJSON(USERS_KEY, users)
  return next
}

export function setProfileImage(userId, { src, source }) {
  return updateUserProfile(userId, {
    profileImage: src || '',
    profileImageSource: source || (src ? 'upload' : 'default')
  })
}

// ─── session ────────────────────────────────────────────
export function setSession(userId) {
  try {
    if (!userId) localStorage.removeItem(SESSION_KEY)
    else localStorage.setItem(SESSION_KEY, userId)
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
  setSession(null)
}
export function loadCurrentUser() {
  const id = getSession()
  return id ? getUser(id) : null
}

// ─── letters ────────────────────────────────────────────
// letter shape:
//   { id,
//     receiverId, receiverUsername,
//     senderMode: 'anonymous'|'name'|'user',
//     senderUserId, senderUsername, senderName,
//     content, reply,
//     isPublic, isArchived, isDeleted,
//     createdAt, updatedAt }

export function saveLetter(input) {
  // receiverId 와 receiverUsername 은 절대 senderUserId 기반으로 자동 채우면 안 된다.
  // 호출자가 명시적으로 넣어야 한다.
  if (!input || !input.receiverId || !input.receiverUsername) return null
  if (!['anonymous', 'name', 'user'].includes(input.senderMode)) return null
  const id = input.id || makeId()
  const now = Date.now()

  // senderMode 별 sender 필드 강제 정리 — leak 방지
  let senderUserId = null
  let senderUsername = null
  let senderName = null
  if (input.senderMode === 'user') {
    if (!input.senderUserId || !input.senderUsername) return null
    senderUserId = input.senderUserId
    senderUsername = input.senderUsername
  } else if (input.senderMode === 'name') {
    senderName = String(input.senderName || '').trim().slice(0, 30) || null
    if (!senderName) return null
  }
  // anonymous 는 셋 다 null

  const letter = {
    id,
    receiverId: input.receiverId,
    receiverUsername: input.receiverUsername,
    senderMode: input.senderMode,
    senderUserId,
    senderUsername,
    senderName,
    content: String(input.content || '').slice(0, 2000),
    reply: null,
    isPublic: false,
    isArchived: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now
  }
  const letters = readJSON(LETTERS_KEY, {})
  letters[id] = letter
  if (!writeJSON(LETTERS_KEY, letters)) return null
  return letter
}

export function getLetter(id) {
  if (!id) return null
  const letters = readJSON(LETTERS_KEY, {})
  return letters[id] || null
}

export function updateLetter(id, patch) {
  const letters = readJSON(LETTERS_KEY, {})
  const cur = letters[id]
  if (!cur) return null
  // sender / receiver 식별 정보는 patch 로 못 바꾸도록 격리
  const safe = { ...cur, ...patch }
  safe.id = cur.id
  safe.receiverId = cur.receiverId
  safe.receiverUsername = cur.receiverUsername
  safe.senderMode = cur.senderMode
  safe.senderUserId = cur.senderUserId
  safe.senderUsername = cur.senderUsername
  safe.senderName = cur.senderName
  safe.createdAt = cur.createdAt
  safe.updatedAt = Date.now()
  letters[id] = safe
  writeJSON(LETTERS_KEY, letters)
  return safe
}

export function setLetterReply(id, replyText) {
  const txt = String(replyText || '').slice(0, 2000)
  return updateLetter(id, { reply: txt || null })
}
export function setLetterPublic(id, isPublic) {
  return updateLetter(id, { isPublic: !!isPublic })
}
export function setLetterArchived(id, isArchived) {
  return updateLetter(id, { isArchived: !!isArchived })
}
export function softDeleteLetter(id) {
  return updateLetter(id, { isDeleted: true })
}

// 받은 편지함 — receiverId 본인 편지만.
export function listInboxFor(receiverId) {
  if (!receiverId) return []
  const letters = readJSON(LETTERS_KEY, {})
  return Object.values(letters)
    .filter(
      (l) =>
        l.receiverId === receiverId && !l.isDeleted && !l.isArchived
    )
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function listArchiveFor(receiverId) {
  if (!receiverId) return []
  const letters = readJSON(LETTERS_KEY, {})
  return Object.values(letters)
    .filter((l) => l.receiverId === receiverId && l.isArchived && !l.isDeleted)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

// 공개 편지 — receiver 본인이 isPublic=true 로 직접 토글한 것만.
export function listPublicFor(receiverId) {
  if (!receiverId) return []
  const letters = readJSON(LETTERS_KEY, {})
  return Object.values(letters)
    .filter(
      (l) =>
        l.receiverId === receiverId && l.isPublic && !l.isDeleted && !l.isArchived
    )
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

// 받은 편지 카운트 (대시보드용)
export function inboxCount(receiverId) {
  return listInboxFor(receiverId).length
}

// 편지 조회 권한 — receiver 본인 또는 isPublic 인 경우만.
export function canViewLetter(letter, currentUserId) {
  if (!letter) return false
  if (letter.isDeleted) return false
  if (letter.isPublic) return true
  return !!currentUserId && letter.receiverId === currentUserId
}

// ─── 익명성 표시 helper ─────────────────────────────────
// receiver UI 에서 sender 를 표시할 때 — anonymous 면 식별 정보 일절 노출 금지.
export function presentSender(letter) {
  if (!letter) return { label: '익명', detail: null }
  if (letter.senderMode === 'anonymous') {
    return { label: '익명', detail: null, isAnonymous: true }
  }
  if (letter.senderMode === 'name') {
    return { label: letter.senderName || '익명', detail: null }
  }
  if (letter.senderMode === 'user') {
    return {
      label: letter.senderUsername ? '@' + letter.senderUsername : '익명',
      detail: null
    }
  }
  return { label: '익명', detail: null, isAnonymous: true }
}

// ─── quick links — letters / inbox 와 완전히 분리된 일회성 편지 링크 ──
// quickLink shape: { id, code, createdByUserId | null, createdAt, expiresAt | null, status: 'active'|'closed' }
// quickMessage shape: { id, quickLinkId, senderMode: 'anonymous'|'name', senderDisplayName, content, createdAt }
//
// 보안 / 익명성:
//   - quickMessages 의 senderDisplayName 은 익명일 땐 무조건 '익명'.
//   - senderUserId 는 저장하지 않는다 (간단 링크는 가벼운 일회성 흐름이라 의도적으로).
//   - quickLink 의 createdByUserId 도 익명 공유를 위해 nullable. 비로그인 사용자도 만들 수 있음.

function genQuickCode() {
  // 6자 base36 — 약 22 억 조합. MVP 충분.
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function createQuickLink({ createdByUserId = null } = {}) {
  // collision 회피 — 16회 시도 후 fallback
  let code = ''
  const codeMap = readJSON(QUICK_CODE_KEY, {})
  for (let i = 0; i < 16; i++) {
    const c = genQuickCode()
    if (!codeMap[c]) {
      code = c
      break
    }
  }
  if (!code) code = genQuickCode() + Math.random().toString(36).slice(2, 4)

  const id = makeId()
  const link = {
    id,
    code,
    createdByUserId: createdByUserId || null,
    createdAt: Date.now(),
    expiresAt: null,
    status: 'active'
  }
  const links = readJSON(QUICK_LINKS_KEY, {})
  links[id] = link
  codeMap[code] = id
  writeJSON(QUICK_LINKS_KEY, links)
  writeJSON(QUICK_CODE_KEY, codeMap)
  return link
}

export function getQuickLinkByCode(code) {
  if (!code) return null
  const map = readJSON(QUICK_CODE_KEY, {})
  const id = map[String(code).toLowerCase()]
  if (!id) return null
  const links = readJSON(QUICK_LINKS_KEY, {})
  return links[id] || null
}

export function addQuickMessage({ quickLinkId, senderMode, senderName, content }) {
  if (!quickLinkId) return null
  if (!['anonymous', 'name'].includes(senderMode)) return null
  const link = readJSON(QUICK_LINKS_KEY, {})[quickLinkId]
  if (!link) return null
  if (link.status !== 'active') return null

  // 익명성 강제 — anonymous 면 displayName 은 무조건 '익명'.
  let displayName = '익명'
  if (senderMode === 'name') {
    displayName = String(senderName || '').trim().slice(0, 30)
    if (!displayName) return null
  }
  const msg = {
    id: makeId(),
    quickLinkId,
    senderMode,
    senderDisplayName: displayName,
    content: String(content || '').slice(0, 2000),
    createdAt: Date.now()
  }
  const msgs = readJSON(QUICK_MESSAGES_KEY, {})
  msgs[msg.id] = msg
  writeJSON(QUICK_MESSAGES_KEY, msgs)
  return msg
}

export function listQuickMessagesByLink(quickLinkId) {
  if (!quickLinkId) return []
  const msgs = readJSON(QUICK_MESSAGES_KEY, {})
  return Object.values(msgs)
    .filter((m) => m.quickLinkId === quickLinkId)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

// 로그인 사용자가 자기가 만든 quick links 한꺼번에 보기 (대시보드 옵션)
export function listQuickLinksByCreator(userId) {
  if (!userId) return []
  const links = readJSON(QUICK_LINKS_KEY, {})
  return Object.values(links)
    .filter((l) => l.createdByUserId === userId)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

// ─── 옛 함수들 (legacy items / asks) ────────────────────
// /create/letter 등 옛 라우트 제거 후에도 옛 데이터 보존을 위해 read 만 유지.
export function getLegacyItem(id) {
  const map = readJSON(LEGACY_ITEMS_KEY, {})
  return map[id] || null
}
export function listLegacyItems() {
  const map = readJSON(LEGACY_ITEMS_KEY, {})
  return Object.values(map)
}
export function getLegacyAskRequest(id) {
  const map = readJSON(LEGACY_ASKS_KEY, {})
  return map[id] || null
}

// ─── 기존 함수명 호환 (Login/MyAccount 등 옛 페이지가 import) ──
// 새 라우트에서는 안 쓰지만 import 실패 막기 위해 noop / re-export.
export function saveUser(user) {
  if (!user || !user.id) return false
  const users = readJSON(USERS_KEY, {})
  users[user.id] = user
  return writeJSON(USERS_KEY, users)
}
export function getUserBySubject(provider, subject) {
  if (provider !== 'google' || !subject) return null
  return getUserByGoogleSub(subject)
}
export function findUserByHandle(handle) {
  return getUserByUsername(handle)
}
export function listUsers() {
  const users = readJSON(USERS_KEY, {})
  return Object.values(users)
}
export function savePendingAuth() {}
export function loadPendingAuth() { return null }
export function clearPendingAuth() {}
// 옛 saveItem — 옛 페이지가 호출하더라도 throw 안 하게 noop.
export function saveItem() { return false }
export function getItem(id) { return getLegacyItem(id) }
export function removeItem() {}
export function listItems() { return [] }
export function listItemsBySender() { return [] }
export function saveAskRequest() { return false }
export function getAskRequest(id) { return getLegacyAskRequest(id) }
