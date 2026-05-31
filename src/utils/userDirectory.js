// 닉네임/아이디 중복 확인.
// 현재는 localStorage 기반 mock. 백엔드 붙일 때:
//   - 이 두 함수만 fetch 호출로 바꾸면 된다.
//   - 인터페이스(Promise<boolean>) 와 의미(true = 이미 사용 중) 유지.
import { findUserByHandle, listUsers } from './storage'

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// true = 이미 사용 중(중복), false = 사용 가능
export async function checkHandleDuplicate(handle, excludeUserId) {
  await delay(220)
  if (!handle) return false
  const existing = findUserByHandle(handle)
  if (!existing) return false
  return existing.id !== excludeUserId
}

export async function checkNicknameDuplicate(nickname, excludeUserId) {
  await delay(220)
  if (!nickname) return false
  const lower = String(nickname).toLowerCase()
  return listUsers().some(
    (u) =>
      u.nickname &&
      u.nickname.toLowerCase() === lower &&
      u.id !== excludeUserId
  )
}
