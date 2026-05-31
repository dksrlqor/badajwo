import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState'

export default function Inbox() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-2">
        <button
          onClick={() => navigate('/me')}
          className="text-ink-700 text-sm px-2 py-1 -ml-2 hover:text-ink-900"
        >
          ← 뒤로
        </button>
        <div className="flex-1 text-center text-sm font-medium text-ink-700">
          받은 편지함
        </div>
        <div className="w-12" />
      </div>
      <EmptyState
        icon="💌"
        title="아직 받은 편지가 없어요"
        description={'누군가가 보낸 편지가 도착하면\n여기에서 모아 볼 수 있어요.'}
      />
    </motion.div>
  )
}
