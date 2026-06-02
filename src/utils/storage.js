// 받아줘 storage layer (v3).
// users / sessions / letters / quickLinks 는 여전히 localStorage 기반(개인 단위).
// simpleLetters(공유 편지) 는 Supabase 가 활성이면 supabase, 아니면 localStorage fallback.
//
// simple letter 함수들은 모두 async — 호출자는 await 사용.

import {
  supabase,
  hasSupabase,
  SIMPLE_LETTERS_TABLE,
  LETTER_PHOTOS_BUCKET,
  RPC_INCREMENT_VIEW
} from './supabase'

const USERS_KEY     = 'badajwo:users'        // { [id]: user }
const USERNAME_KEY  = 'badajwo:usernameToId' // { [usernameLower]: userId }
const GOOGLE_KEY    = 'badajwo:googleToId'   // { [googleSub]: userId }
const LETTERS_KEY   = 'badajwo:letters'      // { [id]: letter }
const SESSION_KEY   = 'badajwo:session'      // userId string
// 간단 링크 (옛 흐름 — 친구가 빈 링크에 메시지 남기는 구조). 사용 안 함, read 만 유지.
const QUICK_LINKS_KEY    = 'badajwo:quickLinks'    // { [id]: quickLink }
const QUICK_CODE_KEY     = 'badajwo:quickCodeToId' // { [code]: quickLinkId }
const QUICK_MESSAGES_KEY = 'badajwo:quickMessages' // { [id]: quickMessage }
// 간단 편지 (새 흐름 — 작성자가 만든 완성 편지를 공유 링크로 보여줌). letters / user inbox / quickLinks 와 완전히 분리.
const SIMPLE_LETTERS_KEY = 'badajwo:simpleLetters'      // { [id]: simpleLetter }
const SIMPLE_CODE_KEY    = 'badajwo:simpleLetterCodeToId' // { [code]: simpleLetterId }

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

// ─── 계정 삭제 ──────────────────────────────────────────
// localStorage 한정 — 이 브라우저의 다음 데이터를 모두 처리한다.
//   1) users / usernameToId / googleToId 에서 본인 제거
//   2) letters: receiverId === userId 인 항목 삭제 (받은 편지 / 보관 / 공개 / 삭제 상태 무관)
//   3) letters: senderUserId === userId 인 항목은 anonymize — senderMode → 'anonymous',
//      senderUserId / senderUsername / senderName 전부 null. 받은 사람의 편지지는 보존하되
//      너 신원만 wipe (right to be forgotten).
//   4) quickLinks: createdByUserId === userId 인 항목 삭제. 그 quickLinkId 에 묶인
//      quickMessages 도 cascade 삭제.
//   5) session clear.
//
// 함수 시그니처 (deleteAccount(userId)) 는 백엔드 이전 시에도 그대로 유지하면 됨.
export function deleteAccount(userId) {
  if (!userId) return { ok: false, reason: '계정을 찾지 못했어요.' }
  const users = readJSON(USERS_KEY, {})
  const user = users[userId]
  if (!user) return { ok: false, reason: '계정을 찾지 못했어요.' }

  // 1) users / usernameToId / googleToId
  delete users[userId]
  writeJSON(USERS_KEY, users)
  if (user.username) {
    const um = readJSON(USERNAME_KEY, {})
    if (um[user.username] === userId) {
      delete um[user.username]
      writeJSON(USERNAME_KEY, um)
    }
  }
  if (user.googleSub) {
    const gm = readJSON(GOOGLE_KEY, {})
    if (gm[user.googleSub] === userId) {
      delete gm[user.googleSub]
      writeJSON(GOOGLE_KEY, gm)
    }
  }

  // 2) + 3) letters
  const letters = readJSON(LETTERS_KEY, {})
  let lettersChanged = false
  for (const id of Object.keys(letters)) {
    const l = letters[id]
    if (l.receiverId === userId) {
      delete letters[id]
      lettersChanged = true
      continue
    }
    if (l.senderUserId === userId) {
      letters[id] = {
        ...l,
        senderMode: 'anonymous',
        senderUserId: null,
        senderUsername: null,
        senderName: null,
        updatedAt: Date.now()
      }
      lettersChanged = true
    }
  }
  if (lettersChanged) writeJSON(LETTERS_KEY, letters)

  // 4) quickLinks (created by user) + cascade quickMessages
  const links = readJSON(QUICK_LINKS_KEY, {})
  const codeMap = readJSON(QUICK_CODE_KEY, {})
  const msgs = readJSON(QUICK_MESSAGES_KEY, {})
  const removedLinkIds = new Set()
  for (const id of Object.keys(links)) {
    if (links[id].createdByUserId === userId) {
      removedLinkIds.add(id)
      const code = links[id].code
      if (code && codeMap[code] === id) delete codeMap[code]
      delete links[id]
    }
  }
  if (removedLinkIds.size > 0) {
    writeJSON(QUICK_LINKS_KEY, links)
    writeJSON(QUICK_CODE_KEY, codeMap)
    for (const mid of Object.keys(msgs)) {
      if (removedLinkIds.has(msgs[mid].quickLinkId)) {
        delete msgs[mid]
      }
    }
    writeJSON(QUICK_MESSAGES_KEY, msgs)
  }

  // 4-b) simpleLetters (created by user) — 본인이 만든 공유 편지 전부 hard delete.
  const sLetters = readJSON(SIMPLE_LETTERS_KEY, {})
  const sCodeMap = readJSON(SIMPLE_CODE_KEY, {})
  let sChanged = false
  for (const id of Object.keys(sLetters)) {
    if (sLetters[id].createdByUserId === userId) {
      const code = sLetters[id].code
      if (code && sCodeMap[code] === id) delete sCodeMap[code]
      delete sLetters[id]
      sChanged = true
    }
  }
  if (sChanged) {
    writeJSON(SIMPLE_LETTERS_KEY, sLetters)
    writeJSON(SIMPLE_CODE_KEY, sCodeMap)
  }

  // 5) session
  clearSession()

  return { ok: true }
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

// ─── simple letters — 작성자가 완성한 편지를 공유 링크로 보여주는 흐름 ──
// hasSupabase === true 면 Supabase (디바이스 간 공유 가능), 아니면 localStorage fallback (이 브라우저에서만).
// 모든 함수는 async — 호출자는 await 필요.
//
// simpleLetter shape (camelCase 통일):
//   { id, code, type: 'simple_shared_letter',
//     recipientName, senderName, title, content, templateId,
//     photos: [{ src, alt, rotation, tape }],
//     music: { provider, originalUrl, embedUrl, canEmbed, title } | null,
//     createdByUserId | null, createdAt(ms), expiresAt(ms) | null,
//     viewCount, isDeleted }

const SIMPLE_TITLE_MAX = 60
const SIMPLE_NAME_MAX = 30
const SIMPLE_CONTENT_MAX = 4000
const SIMPLE_PHOTO_MAX = 5

function genSimpleLetterCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

function sanitizeSimpleInput(input) {
  const recipientName = String(input?.recipientName || '').trim().slice(0, SIMPLE_NAME_MAX)
  const senderName = String(input?.senderName || '').trim().slice(0, SIMPLE_NAME_MAX)
  const title = String(input?.title || '').trim().slice(0, SIMPLE_TITLE_MAX)
  const content = String(input?.content || '').slice(0, SIMPLE_CONTENT_MAX)
  const templateId = String(input?.templateId || '').trim() || null

  const photosIn = Array.isArray(input?.photos) ? input.photos : []
  const photos = photosIn
    .filter((p) => p && typeof p.src === 'string' && p.src)
    .slice(0, SIMPLE_PHOTO_MAX)
    .map((p, i) => ({
      src: p.src,
      alt: String(p.alt || '').slice(0, 80),
      rotation: typeof p.rotation === 'number' ? p.rotation : (i % 2 === 0 ? -2.5 : 2.5),
      tape: typeof p.tape === 'string' ? p.tape : 'pink'
    }))

  let music = null
  if (input?.music && (input.music.originalUrl || input.music.embedUrl)) {
    music = {
      provider: String(input.music.provider || 'unknown'),
      originalUrl: String(input.music.originalUrl || ''),
      embedUrl: input.music.embedUrl ? String(input.music.embedUrl) : null,
      canEmbed: !!input.music.canEmbed,
      title: String(input.music.title || '').slice(0, 120)
    }
  }
  return { recipientName, senderName, title, content, templateId, photos, music }
}

function rowToSimpleLetter(row) {
  if (!row) return null
  return {
    id: row.id,
    code: row.code,
    type: row.type || 'simple_shared_letter',
    recipientName: row.recipient_name || '',
    senderName: row.sender_name || '',
    title: row.title || '',
    content: row.content || '',
    templateId: row.template_id,
    photos: Array.isArray(row.photos) ? row.photos : [],
    music: row.music || null,
    createdByUserId: row.created_by_user_id || null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
    viewCount: row.view_count ?? 0,
    isDeleted: !!row.is_deleted
  }
}

// dataURL → Blob → Supabase Storage 업로드 → 공개 URL 반환.
// 이미 http(s) URL 이면 패스 (이미 업로드된 사진을 다시 사용하는 케이스).
async function uploadPhotoIfNeeded(src, code, index) {
  if (!src) return null
  if (/^https?:\/\//i.test(src)) return src
  if (!src.startsWith('data:')) return src
  try {
    const res = await fetch(src)
    const blob = await res.blob()
    const ext = (blob.type && blob.type.split('/')[1]) || 'jpg'
    const path = `${code}/${index}.${ext.replace(/[^a-z0-9]/gi, '') || 'jpg'}`
    const { error } = await supabase.storage
      .from(LETTER_PHOTOS_BUCKET)
      .upload(path, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
        cacheControl: '31536000'
      })
    if (error) throw error
    const { data } = supabase.storage.from(LETTER_PHOTOS_BUCKET).getPublicUrl(path)
    return data?.publicUrl || null
  } catch (e) {
    // 업로드 실패는 letter 생성을 막지 않는다 — 사진만 빠진 채로 진행.
    console.warn('[badajwo] photo upload failed', e)
    return null
  }
}

// ── 로컬 fallback ─────────────────────────────────────
function createSimpleLetterLocal(data, createdByUserId) {
  const codeMap = readJSON(SIMPLE_CODE_KEY, {})
  let code = ''
  for (let i = 0; i < 16; i++) {
    const c = genSimpleLetterCode()
    if (!codeMap[c]) { code = c; break }
  }
  if (!code) code = genSimpleLetterCode() + Math.random().toString(36).slice(2, 4)
  const id = makeId()
  const letter = {
    id,
    code,
    type: 'simple_shared_letter',
    recipientName: data.recipientName,
    senderName: data.senderName,
    title: data.title,
    content: data.content,
    templateId: data.templateId,
    photos: data.photos,
    music: data.music,
    createdByUserId: createdByUserId || null,
    createdAt: Date.now(),
    expiresAt: null,
    viewCount: 0,
    isDeleted: false
  }
  const letters = readJSON(SIMPLE_LETTERS_KEY, {})
  letters[id] = letter
  codeMap[code] = id
  if (!writeJSON(SIMPLE_LETTERS_KEY, letters)) return null
  writeJSON(SIMPLE_CODE_KEY, codeMap)
  return letter
}

function getSimpleLetterByCodeLocal(code) {
  if (!code) return null
  const map = readJSON(SIMPLE_CODE_KEY, {})
  const id = map[String(code).toLowerCase()]
  if (!id) return null
  const letters = readJSON(SIMPLE_LETTERS_KEY, {})
  const l = letters[id]
  if (!l || l.isDeleted) return null
  return l
}

function incrementSimpleLetterViewLocal(code) {
  if (!code) return
  const map = readJSON(SIMPLE_CODE_KEY, {})
  const id = map[String(code).toLowerCase()]
  if (!id) return
  const letters = readJSON(SIMPLE_LETTERS_KEY, {})
  const l = letters[id]
  if (!l || l.isDeleted) return
  letters[id] = { ...l, viewCount: (l.viewCount || 0) + 1 }
  writeJSON(SIMPLE_LETTERS_KEY, letters)
}

// ── 공개 함수 (async) ──────────────────────────────────

export async function createSimpleLetter(rawInput, { createdByUserId = null } = {}) {
  const data = sanitizeSimpleInput(rawInput)
  if (!data.content && !data.title) return null
  if (!data.templateId) return null

  if (!hasSupabase) {
    return createSimpleLetterLocal(data, createdByUserId)
  }

  // 1) code 생성 — DB unique constraint 의존 + 충돌 시 retry.
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = genSimpleLetterCode()

    // 2) 사진 dataURL → Storage 업로드 (병렬). 업로드 실패한 자리는 그대로 제외.
    const uploadedPhotos = await Promise.all(
      data.photos.map(async (p, i) => {
        const url = await uploadPhotoIfNeeded(p.src, code, i)
        if (!url) return null
        return { ...p, src: url }
      })
    )
    const photos = uploadedPhotos.filter(Boolean)

    // 3) insert
    const row = {
      code,
      type: 'simple_shared_letter',
      recipient_name: data.recipientName,
      sender_name: data.senderName,
      title: data.title,
      content: data.content,
      template_id: data.templateId,
      photos,
      music: data.music,
      created_by_user_id: createdByUserId || null
    }
    const { data: inserted, error } = await supabase
      .from(SIMPLE_LETTERS_TABLE)
      .insert(row)
      .select('*')
      .single()

    if (!error && inserted) return rowToSimpleLetter(inserted)

    // unique violation (23505) → 다른 code 로 재시도, 그 외 에러는 실패.
    if (error?.code === '23505') continue
    console.warn('[badajwo] simple_letters insert error', error)
    return null
  }
  return null
}

export async function getSimpleLetterByCode(code) {
  if (!code) return null
  if (!hasSupabase) return getSimpleLetterByCodeLocal(code)

  const { data, error } = await supabase
    .from(SIMPLE_LETTERS_TABLE)
    .select('*')
    .eq('code', String(code).toLowerCase())
    .eq('is_deleted', false)
    .maybeSingle()

  if (error) {
    console.warn('[badajwo] simple_letters select error', error)
    return null
  }
  return rowToSimpleLetter(data)
}

export async function incrementSimpleLetterView(code) {
  if (!code) return
  if (!hasSupabase) return incrementSimpleLetterViewLocal(code)
  try {
    await supabase.rpc(RPC_INCREMENT_VIEW, { p_code: String(code).toLowerCase() })
  } catch (e) {
    // view count 는 best-effort. 실패해도 사용자 경험에 영향 X.
  }
}

export async function listSimpleLettersByCreator(userId) {
  if (!userId) return []
  if (!hasSupabase) {
    const letters = readJSON(SIMPLE_LETTERS_KEY, {})
    return Object.values(letters)
      .filter((l) => l.createdByUserId === userId && !l.isDeleted)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }
  const { data, error } = await supabase
    .from(SIMPLE_LETTERS_TABLE)
    .select('*')
    .eq('created_by_user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('[badajwo] simple_letters list error', error)
    return []
  }
  return (data || []).map(rowToSimpleLetter)
}

// 비로그인 작성 편지는 anon 권한으로 본인 row 식별 불가 → 삭제 불가.
// 로그인 작성도 anon 정책 상 update 차단. 추후 service-role 기반 RPC 추가 필요.
export async function softDeleteSimpleLetter(id, currentUserId = null) {
  if (!id) return false
  if (!hasSupabase) {
    const letters = readJSON(SIMPLE_LETTERS_KEY, {})
    const l = letters[id]
    if (!l) return false
    if (l.createdByUserId && currentUserId !== l.createdByUserId) return false
    letters[id] = { ...l, isDeleted: true }
    writeJSON(SIMPLE_LETTERS_KEY, letters)
    return true
  }
  // Supabase 모드에서는 anon 권한으로 update 불가 — 추후 별도 RPC 로 처리.
  return false
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
