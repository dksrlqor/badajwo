import { BLOCKED_WORDS, RESERVED_HANDLES } from './blockedWords'

// 닉네임: 2~12자. Unicode 문자(\p{L}) + 숫자(\p{N}) 만 허용.
//   - 한글/영문/한자/히라가나/악센트 라틴 OK
//   - 공백/기호/이모지 차단
const NICKNAME_RE = /^[\p{L}\p{N}]{2,12}$/u

// 아이디: 영문 소문자, 숫자, 밑줄. 3~16자.
const HANDLE_RE = /^[a-z0-9_]{3,16}$/

export function containsBlockedWords(text) {
  if (!text) return false
  const lower = String(text).toLowerCase()
  return BLOCKED_WORDS.some((w) => lower.includes(w.toLowerCase()))
}

export function isReservedHandle(handle) {
  if (!handle) return false
  return RESERVED_HANDLES.has(String(handle).toLowerCase())
}

// 결과: { valid: true } | { valid: false, code, message }
// code 종류: 'empty' | 'length' | 'chars' | 'blocked' | 'reserved'
export function validateNickname(raw) {
  if (raw == null) return { valid: false, code: 'empty', message: '닉네임을 입력해주세요.' }
  const v = String(raw).trim()
  if (!v) return { valid: false, code: 'empty', message: '닉네임을 입력해주세요.' }
  if (v.length < 2 || v.length > 12) {
    return { valid: false, code: 'length', message: '닉네임은 2~12자로 입력해주세요.' }
  }
  if (!NICKNAME_RE.test(v)) {
    return { valid: false, code: 'chars', message: '사용할 수 없는 문자가 포함되어 있어요.' }
  }
  if (containsBlockedWords(v)) {
    return { valid: false, code: 'blocked', message: '사용할 수 없는 닉네임이에요.' }
  }
  return { valid: true }
}

export function validateHandle(raw) {
  if (raw == null) return { valid: false, code: 'empty', message: '아이디를 입력해주세요.' }
  const v = String(raw).trim().toLowerCase()
  if (!v) return { valid: false, code: 'empty', message: '아이디를 입력해주세요.' }
  if (v.length < 3 || v.length > 16) {
    return { valid: false, code: 'length', message: '아이디는 3~16자로 입력해주세요.' }
  }
  if (!HANDLE_RE.test(v)) {
    return { valid: false, code: 'chars', message: '아이디는 영문 소문자, 숫자, _ 만 사용할 수 있어요.' }
  }
  if (isReservedHandle(v)) {
    return { valid: false, code: 'reserved', message: '예약된 아이디라 사용할 수 없어요.' }
  }
  return { valid: true }
}
