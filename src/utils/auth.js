// 받아줘 auth providers.
// 현재는 더미 구현. 실제 Supabase / Firebase Auth 로 교체할 때는
//   - loginWithGoogle / loginWithApple 함수 내부만 SDK 호출로 바꾸면 됨.
//   - 반환 형태 { provider, subject, displayName, email } 를 유지.
//   - subject 는 공급자가 부여한 안정적인 사용자 식별자(OIDC sub 등).
// NOTE: 실서비스에서는 OAuth 토큰 검증, 세션 발급/갱신을 반드시 서버에서 처리해야 함.

const DEMO_SUBJECT_KEY = 'badajwo:demoSubjects'

function readSubjects() {
  try {
    const raw = localStorage.getItem(DEMO_SUBJECT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeSubjects(map) {
  try {
    localStorage.setItem(DEMO_SUBJECT_KEY, JSON.stringify(map))
  } catch {}
}

// 같은 브라우저에서는 항상 같은 더미 subject 를 반환하도록 보장 →
// "이미 계정을 만든 사용자는 내 계정 화면으로" 흐름이 동작한다.
function getOrCreateDeviceSubject(provider) {
  const map = readSubjects()
  if (!map[provider]) {
    map[provider] = provider + '-' + Math.random().toString(36).slice(2, 12)
    writeSubjects(map)
  }
  return map[provider]
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function loginWithGoogle() {
  await delay(450)
  return {
    provider: 'google',
    subject: getOrCreateDeviceSubject('google'),
    displayName: '',
    email: ''
  }
}

export async function loginWithApple() {
  await delay(450)
  return {
    provider: 'apple',
    subject: getOrCreateDeviceSubject('apple'),
    displayName: '',
    email: ''
  }
}
