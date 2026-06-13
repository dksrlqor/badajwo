import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  loadCurrentUser,
  setSession,
  clearSession,
  findOrCreateMockUser,
  updateUserProfile,
  getUser,
  upsertGoogleProfile,
  setUsernameRemote,
  deleteAccountRemote
} from '../utils/storage'
import { hasSupabase } from '../utils/supabase'

const AuthContext = createContext(null)

// JWT id_token 페이로드 디코딩 (서명 검증은 서버 몫 — 클라이언트는 정보 추출만).
function decodeJwt(token) {
  try {
    const part = token.split('.')[1]
    const padded = part + '='.repeat((4 - (part.length % 4)) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadCurrentUser())

  // user 가 storage 에서 갱신됐을 수 있어서 username 변경 후 refresh 용
  const refreshUser = useCallback(() => {
    const id = user?.id
    if (!id) {
      setUser(null)
      return
    }
    setUser(getUser(id))
  }, [user?.id])

  // user 가 username 까지 가졌는지에 따른 status
  const status = !user
    ? 'guest'
    : !user.username
    ? 'needs-onboarding'
    : 'authed'

  // Google credential (JWT) 로그인 — @react-oauth/google 의 GoogleLogin 컴포넌트가 콜백으로 전달.
  // Supabase 에 프로필을 upsert 하고(google_sub 기준) 토큰 포함 user 를 받아온다 →
  // 다른 기기에서 로그인해도 같은 계정/받은편지함으로 이어진다.
  const signInWithGoogleCredential = useCallback(async (credential) => {
    const payload = decodeJwt(credential)
    if (!payload || !payload.sub) {
      return { ok: false, reason: '구글 로그인 정보를 읽지 못했어요.' }
    }
    const u = await upsertGoogleProfile({
      googleSub: payload.sub,
      email: payload.email || '',
      displayName: payload.name || payload.given_name || '',
      profileImage: payload.picture || ''
    })
    if (!u) return { ok: false, reason: '계정 생성에 실패했어요. 잠시 후 다시 시도해주세요.' }
    setSession(u.id)
    setUser(u)
    return { ok: true, user: u }
  }, [])

  // 개발 모드 / OAuth client_id 없을 때 — 가짜 로그인.
  const signInMock = useCallback((key, displayName) => {
    const u = findOrCreateMockUser({
      key,
      displayName: displayName || key,
      profileImage: ''
    })
    if (!u) return { ok: false, reason: '테스트 로그인 실패' }
    setSession(u.id)
    setUser(u)
    return { ok: true, user: u }
  }, [])

  const setUsername = useCallback(
    async (rawUsername) => {
      if (!user) return { ok: false, reason: '로그인이 필요해요.' }
      const res = await setUsernameRemote(user, rawUsername)
      if (res.ok) setUser(res.user)
      return res
    },
    [user]
  )

  const updateProfile = useCallback(
    (patch) => {
      if (!user) return null
      const next = updateUserProfile(user.id, patch)
      if (next) setUser(next)
      return next
    },
    [user]
  )

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  // 영구 계정 삭제. Supabase 프로필/받은편지 삭제 + 보낸편지 익명화, 로컬 흔적 정리.
  const deleteAccount = useCallback(async () => {
    if (!user) return { ok: false, reason: '로그인이 필요해요.' }
    const res = await deleteAccountRemote(user)
    if (res.ok) setUser(null)
    return res
  }, [user])

  // 마이그레이션 가드 — Supabase 백엔드 전환 전에 localStorage 로만 만들어진
  // 옛 세션은 inboxToken 이 없다. 그대로 두면 받은편지함이 빈 채로 보이고
  // /u/:username 도 서버에 없으므로, 한 번 로그아웃시켜 재로그인을 유도한다.
  useEffect(() => {
    if (hasSupabase && user && !user.inboxToken) {
      clearSession()
      setUser(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 다른 탭에서 로그인 / 로그아웃 했을 때 동기화
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return
      if (e.key === 'badajwo:session') {
        setUser(loadCurrentUser())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = {
    user,
    status,
    signInWithGoogleCredential,
    signInMock,
    signOut,
    deleteAccount,
    setUsername,
    updateProfile,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// 어디서든 OAuth client_id 가 세팅됐는지 확인.
export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}
export function hasGoogleClientId() {
  return !!getGoogleClientId()
}
