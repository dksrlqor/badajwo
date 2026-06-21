import { Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom'
import { validateUsername } from './utils/storage'
import Layout from './components/Layout'
import RecipientLayout from './components/RecipientLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Me from './pages/Me'
import UserProfile from './pages/UserProfile'
import UserWrite from './pages/UserWrite'
import Write from './pages/Write'
import WriteId from './pages/WriteId'
import QuickNew from './pages/QuickNew'
import QuickView from './pages/QuickView'
import LetterDetail from './pages/LetterDetail'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

// 받아줘 — 라우트 구조 (v3)
//
// 편지 받기 (로그인 필요)
//   /onboarding              아이디 만들기
//   /me                      내 대시보드 + 받은 편지함 + 프로필 링크 공유
//   /u/:username             공개 프로필 (편지 쓰기 진입점) — receiver 고정
//   /letter/:id              받은 편지 상세 (receiver 본인 또는 isPublic 만)
//
// 편지 보내기 (로그인 없이 가능)
//   /write                   편지 쓰러가기 메인 — 두 카드 선택
//   /write/id                받는 사람 받아줘 아이디 입력
//   /u/:username/write       특정 사용자에게 편지 작성 — receiver 고정
//   /quick/new               간단 편지 링크 만들기
//   /quick/:code             간단 편지 링크 안에서 메시지 남기기
//
// 정책 / 인증
//   /                        홈
//   /login                   Google OAuth
//   /privacy                 개인정보 처리방침

export default function App() {
  const location = useLocation()
  return (
    <Routes location={location}>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/write"
        element={
          <Layout>
            <Write />
          </Layout>
        }
      />
      <Route
        path="/write/id"
        element={
          <Layout>
            <WriteId />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/onboarding"
        element={
          <Layout>
            <Onboarding />
          </Layout>
        }
      />
      {/* 정책 문서 — 픽셀 Layout(480px) 대신 DocPage 자체 760px 컬럼 사용 */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* 관리자 통계 — 로그인한 관리자 계정에서만 숫자가 보인다 */}
      <Route
        path="/admin"
        element={
          <Layout>
            <Admin />
          </Layout>
        }
      />

      <Route
        path="/me"
        element={
          <Layout>
            <Me />
          </Layout>
        }
      />

      {/* 받는 사람 고정 — Layout 은 수신자용 */}
      <Route
        path="/u/:username"
        element={
          <RecipientLayout>
            <UserProfile />
          </RecipientLayout>
        }
      />
      <Route
        path="/u/:username/write"
        element={
          <RecipientLayout>
            <UserWrite />
          </RecipientLayout>
        }
      />

      {/* 일회성 픽셀 편지 — letters / inbox 와 분리된 별도 흐름 */}
      <Route
        path="/one-letter"
        element={
          <Layout>
            <QuickNew />
          </Layout>
        }
      />
      <Route
        path="/l/:code"
        element={
          <RecipientLayout>
            <QuickView />
          </RecipientLayout>
        }
      />
      {/* 옛 간단 링크 경로 호환 — 이미 공유된 /quick/:code 링크는 계속 열려야 함 */}
      <Route path="/quick/new" element={<Navigate to="/one-letter" replace />} />
      <Route
        path="/quick/:code"
        element={
          <RecipientLayout>
            <QuickView />
          </RecipientLayout>
        }
      />

      <Route
        path="/letter/:id"
        element={
          <RecipientLayout>
            <LetterDetail />
          </RecipientLayout>
        }
      />

      {/* 옛 경로 redirect */}
      <Route path="/setup" element={<Navigate to="/onboarding" replace />} />
      <Route path="/inbox" element={<Navigate to="/me" replace />} />
      <Route path="/archive" element={<Navigate to="/me" replace />} />
      <Route path="/feed" element={<Navigate to="/me" replace />} />
      <Route path="/ask" element={<Navigate to="/me" replace />} />
      <Route path="/create/letter" element={<Navigate to="/write" replace />} />
      <Route path="/create/diary" element={<Navigate to="/write" replace />} />

      {/* /u 가 빠진 단일 세그먼트 링크(/redhong)는 /u/redhong 으로 보정.
          예약어/형식 위반은 NotFound. 위의 정적 라우트(/me·/login 등)는
          RRv6 specificity 상 이 동적 라우트보다 우선 매칭되므로 안전. */}
      <Route path="/:maybeUsername" element={<BareUsernameRedirect />} />

      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  )
}

function BareUsernameRedirect() {
  const { maybeUsername } = useParams()
  const v = validateUsername(maybeUsername)
  if (v.ok) return <Navigate to={`/u/${v.normalized}`} replace />
  return (
    <Layout>
      <NotFound />
    </Layout>
  )
}
