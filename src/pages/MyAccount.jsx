import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'

export default function MyAccount() {
  const navigate = useNavigate()
  const { user, status, logout } = useAuth()

  useEffect(() => {
    if (status === 'guest') navigate('/login', { replace: true })
    else if (status === 'pending-setup') navigate('/setup', { replace: true })
  }, [status, navigate])

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-ink-700 text-sm px-2 py-1 -ml-2 hover:text-ink-900"
        >
          ← 뒤로
        </button>
        <div className="flex-1 text-center text-sm font-medium text-ink-700">
          내 계정
        </div>
        <div className="w-12" />
      </div>

      <SoftCard className="mb-5 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent-pink to-accent-lavender flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-soft"
        >
          {user.nickname.slice(0, 1)}
        </motion.div>
        <div className="text-lg font-bold text-ink-900">{user.nickname}</div>
        <div className="text-sm text-accent-pinkDeep mt-1">@{user.handle}</div>

        <div className="mt-6 pt-5 border-t border-cream-200">
          <div className="text-xs text-ink-500 mb-1">받은 편지</div>
          <div className="text-3xl font-bold text-ink-900">
            {user.receivedLetterCount || 0}
            <span className="text-sm font-normal text-ink-500 ml-1">통</span>
          </div>
        </div>
      </SoftCard>

      <div className="space-y-3 mb-6">
        <AccountLink
          icon="💌"
          title="받은 편지함"
          description="누군가에게서 도착한 편지"
          onClick={() => navigate('/me/inbox')}
        />
        <AccountLink
          icon="📦"
          title="보관함"
          description="간직하고 싶은 편지"
          onClick={() => navigate('/me/archive')}
        />
        <AccountLink
          icon="🌿"
          title="피드"
          description="공개된 편지 둘러보기"
          onClick={() => navigate('/me/feed')}
        />
      </div>

      <MotionButton variant="ghost" onClick={handleLogout}>
        로그아웃
      </MotionButton>
    </motion.div>
  )
}

function AccountLink({ icon, title, description, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-white/90 rounded-2xl shadow-soft border border-cream-200 px-5 py-4 text-left"
    >
      <div className="w-11 h-11 rounded-2xl bg-cream-100 flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900">{title}</div>
        <div className="text-xs text-ink-500 mt-0.5">{description}</div>
      </div>
      <div className="text-ink-300 text-base">›</div>
    </motion.button>
  )
}
