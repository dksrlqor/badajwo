import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import RecipientLayout from './components/RecipientLayout'
import Home from './pages/Home'
import CreateLetter from './pages/CreateLetter'
import CreateDiary from './pages/CreateDiary'
import Complete from './pages/Complete'
import ViewPage from './pages/ViewPage'
import AskSetup from './pages/AskSetup'
import AskLink from './pages/AskLink'

// 현재 MVP 에서는 로그인 기능을 노출하지 않는다.
// 로그인 관련 페이지 파일은 보존하되 라우트만 빼서, 추후 백엔드 연동 시
// 다시 import / Route 만 부활시키면 됨.
//   import Login from './pages/Login'
//   import SetupAccount from './pages/SetupAccount'
//   import MyAccount from './pages/MyAccount'
//   import Inbox from './pages/Inbox'
//   import Archive from './pages/Archive'
//   import Feed from './pages/Feed'

export default function App() {
  const location = useLocation()
  return (
    <Routes location={location}>
      {/* 수신자 전용 — 메인 UI 없이 봉투/편지 + 하단 작은 탭만 */}
      <Route
        path="/view/:id"
        element={
          <RecipientLayout>
            <ViewPage />
          </RecipientLayout>
        }
      />

      {/* 메인(작성자) — 일반 Layout */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/create/letter"
        element={
          <Layout>
            <CreateLetter />
          </Layout>
        }
      />
      <Route
        path="/create/diary"
        element={
          <Layout>
            <CreateDiary />
          </Layout>
        }
      />
      <Route
        path="/complete/:id"
        element={
          <Layout>
            <Complete />
          </Layout>
        }
      />

      {/* "나한테 편지 써줘" 흐름 */}
      <Route
        path="/ask"
        element={
          <Layout>
            <AskSetup />
          </Layout>
        }
      />
      <Route
        path="/ask/:id"
        element={
          <Layout>
            <AskLink />
          </Layout>
        }
      />
      <Route
        path="/write-to/:askId"
        element={
          <Layout>
            <CreateLetter />
          </Layout>
        }
      />

      <Route
        path="*"
        element={
          <Layout>
            <div className="pt-20 text-center text-ink-500 text-sm">
              존재하지 않는 페이지입니다.
            </div>
          </Layout>
        }
      />
    </Routes>
  )
}
