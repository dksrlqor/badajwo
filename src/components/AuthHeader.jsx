import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthHeader() {
  const navigate = useNavigate()
  const { user, status } = useAuth()

  if (status === 'authed' && user) {
    return (
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ y: -1 }}
        onClick={() => navigate('/me')}
        className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur pl-1 pr-3 py-1 shadow-soft border border-cream-200"
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-pink to-accent-lavender text-white text-xs font-bold flex items-center justify-center">
          {(user.nickname || '?').slice(0, 1)}
        </span>
        <span className="text-ink-700 max-w-[80px] truncate text-xs font-medium">
          {user.nickname}
        </span>
      </motion.button>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      onClick={() => navigate('/login')}
      className="rounded-full bg-white/80 backdrop-blur px-4 py-2 text-xs font-medium text-ink-700 shadow-soft border border-cream-200"
    >
      로그인
    </motion.button>
  )
}
