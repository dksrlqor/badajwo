import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RecipientLayout from './components/RecipientLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Me from './pages/Me'
import UserWrite from './pages/UserWrite'
import Write from './pages/Write'
import LetterDetail from './pages/LetterDetail'
import Privacy from './pages/Privacy'

// 받아줘 — 새 라우트 구조.
// 메인 플로우는 "프로필 링크 (/u/:username) → 친구가 받는 사람 편지함에 직접 전송".
// 옛 메인 플로우 (편지 만들고 링크 생성해서 상대에게 보내기) 는 제거.

export default function App() {
  const location = useLocation()
  return (
    <Routes location={location}>
      {/* 메인 (공개) */}
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

      {/* 로그인 사용자 본인 대시보드 */}
      <Route
        path="/me"
        element={
          <Layout>
            <Me />
          </Layout>
        }
      />

      {/* /u/:username — 받는 사람 고정 편지 작성 페이지 (수신자용 Layout) */}
      <Route
        path="/u/:username"
        element={
          <RecipientLayout>
            <UserWrite />
          </RecipientLayout>
        }
      />

      {/* 편지 상세 — receiver 본인 또는 isPublic */}
      <Route
        path="/letter/:id"
        element={
          <RecipientLayout>
            <LetterDetail />
          </RecipientLayout>
        }
      />

      {/* 옛 라우트 호환 — 새 흐름으로 redirect */}
      <Route path="/setup" element={<Navigate to="/onboarding" replace />} />
      <Route path="/inbox" element={<Navigate to="/me" replace />} />
      <Route path="/archive" element={<Navigate to="/me" replace />} />
      <Route path="/feed" element={<Navigate to="/me" replace />} />
      {/* 옛 ask/create/complete/view 흐름 제거. 일부 redirect 만. */}
      <Route path="/ask" element={<Navigate to="/me" replace />} />
      <Route path="/create/letter" element={<Navigate to="/write" replace />} />
      <Route path="/create/diary" element={<Navigate to="/write" replace />} />

      {/* 그 외 — 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="pt-20 text-center text-[13px]" style={{ color: '#86705E' }}>
              앗, 이 편지지는 찾을 수 없어요.
            </div>
          </Layout>
        }
      />
    </Routes>
  )
}
