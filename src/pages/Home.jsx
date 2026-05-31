import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import AuthHeader from '../components/AuthHeader'
import OpenLetterModal from '../components/OpenLetterModal'
import { useAuth } from '../context/AuthContext'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

export default function Home() {
  const navigate = useNavigate()
  const { status } = useAuth()
  const [openModal, setOpenModal] = useState(false)

  const goAccount = () => {
    if (status === 'authed') navigate('/me')
    else navigate('/login')
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col min-h-[85vh]"
    >
      <div className="flex justify-end -mt-2 mb-2">
        <AuthHeader />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-2"
        >
          <h1 className="text-[28px] font-bold tracking-tight text-ink-900">
            받아줘
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm text-ink-500 mb-10"
        >
          말로 하기 어려운 마음, 링크로 받아줘.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-3"
        >
          <MotionButton
            variant="primary"
            onClick={() => navigate('/create/letter')}
          >
            편지 쓰기
          </MotionButton>
          <MotionButton variant="soft" onClick={() => setOpenModal(true)}>
            받은 편지 열기
          </MotionButton>
          <MotionButton
            variant="soft"
            onClick={() => navigate('/create/diary')}
          >
            다이어리 만들기
          </MotionButton>
          <MotionButton variant="ghost" onClick={goAccount}>
            계정 설정
          </MotionButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-7 w-full"
        >
          <div className="paper-tab w-full justify-center !py-3" style={{ borderRadius: 16 }}>
            <span className="text-base mr-1">🕊</span>
            <span className="text-xs leading-relaxed">
              로그인 없이도 편지를 만들고 보낼 수 있어요.
            </span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {openModal && (
          <OpenLetterModal onClose={() => setOpenModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
