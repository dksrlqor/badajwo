import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import OpenLetterModal from '../components/OpenLetterModal'

// 받아줘 메인 화면.
// MVP 단계에서는 로그인이 필요 없어서 헤더/계정 진입점은 모두 숨겼다.
// 사용자가 들어오면 곧장 "편지 쓰기" / "받은 편지 열기" 로 이어진다.

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

export default function Home() {
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(false)

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col min-h-[85vh]"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center w-full pt-6">
        <motion.h1
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-[28px] font-bold tracking-tight text-ink-900 mb-3"
        >
          받아줘
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm text-ink-700 mb-2"
        >
          말로 하기 어려운 마음을, 편지로 받아줘.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-xs text-ink-500 mb-10"
        >
          링크로 전하는 디지털 손편지
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
          <MotionButton variant="soft" onClick={() => navigate('/ask')}>
            나한테 편지 써줘
          </MotionButton>
          <MotionButton variant="soft" onClick={() => setOpenModal(true)}>
            받은 편지 열기
          </MotionButton>
        </motion.div>

        <button
          onClick={() => navigate('/create/diary')}
          className="mt-6 text-xs text-ink-500 underline underline-offset-4 hover:text-ink-700"
        >
          다이어리 만들기
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 w-full"
        >
          <div
            className="paper-tab w-full justify-center !py-3"
            style={{ borderRadius: 16 }}
          >
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
