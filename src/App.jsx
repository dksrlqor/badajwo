import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
      <Route
        path="/privacy"
        element={
          <Layout>
            <Privacy />
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

      {/* 간단 편지 링크 — letters / inbox 와 분리된 별도 흐름 */}
      <Route
        path="/quick/new"
        element={
          <Layout>
            <QuickNew />
          </Layout>
        }
      />
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

      <Route
        path="*"
        element={
          <Layout>
            <div
              className="pt-20 text-center text-[13px]"
              style={{ color: '#86705E' }}
            >
              앗, 이 편지지는 찾을 수 없어요.
            </div>
          </Layout>
        }
      />
    </Routes>
  )
}
