import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateLetter from './pages/CreateLetter'
import CreateDiary from './pages/CreateDiary'
import Complete from './pages/Complete'
import ViewPage from './pages/ViewPage'
import Login from './pages/Login'
import SetupAccount from './pages/SetupAccount'
import MyAccount from './pages/MyAccount'
import Inbox from './pages/Inbox'
import Archive from './pages/Archive'
import Feed from './pages/Feed'

export default function App() {
  const location = useLocation()
  return (
    <Layout>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/create/letter" element={<CreateLetter />} />
        <Route path="/create/diary" element={<CreateDiary />} />
        <Route path="/complete/:id" element={<Complete />} />
        <Route path="/view/:id" element={<ViewPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<SetupAccount />} />
        <Route path="/me" element={<MyAccount />} />
        <Route path="/me/inbox" element={<Inbox />} />
        <Route path="/me/archive" element={<Archive />} />
        <Route path="/me/feed" element={<Feed />} />
        <Route
          path="*"
          element={
            <div className="pt-20 text-center text-ink-500 text-sm">
              존재하지 않는 페이지입니다.
            </div>
          }
        />
      </Routes>
    </Layout>
  )
}
