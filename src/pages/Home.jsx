import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import OpenLetterModal from '../components/OpenLetterModal'

// 받아줘 메인 — 종이 책상 위에 펼친 작은 스크랩북 한 페이지.
// 큰 hero 섹션 대신 종이 라벨 + 마스킹테이프로 시작 화면을 잡는다.

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
      <div className="flex-1 flex flex-col items-center justify-center text-center w-full pt-4">

        {/* 종이 라벨 위에 손글씨처럼 적힌 받아줘 */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative inline-block mb-8 px-8 py-6"
          style={{
            background: '#FDF8EE',
            borderRadius: '14px 10px 16px 12px',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.7) inset, 0 2px 5px rgba(92,62,40,0.10), 0 16px 36px rgba(92,62,40,0.14)',
            transform: 'rotate(-1.4deg)'
          }}
        >
          {/* 마스킹테이프 — 종이 라벨을 책상에 붙인 느낌 */}
          <div
            aria-hidden
            className="masking-tape tape-kraft"
            style={{
              width: 70,
              top: -10,
              left: '50%',
              transform: 'translateX(-50%) rotate(-6deg)'
            }}
          />
          {/* 종이 클립 — 좌상단에 살짝 걸쳐진 듯한 SVG */}
          <svg
            aria-hidden
            width="28"
            height="42"
            viewBox="0 0 28 42"
            style={{
              position: 'absolute',
              top: -14,
              left: -8,
              transform: 'rotate(-22deg)',
              filter:
                'drop-shadow(0 2px 4px rgba(92, 62, 40, 0.30))'
            }}
          >
            <path
              d="M 9 4 L 9 30 Q 9 36 14 36 Q 19 36 19 30 L 19 10 Q 19 6 15 6 Q 11 6 11 10 L 11 28"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 9 4 L 9 30 Q 9 36 14 36 Q 19 36 19 30 L 19 10"
              fill="none"
              stroke="#D6DADE"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
          <h1
            className="text-[34px] font-bold tracking-tight"
            style={{
              color: '#3D2E22',
              fontFamily:
                "'Apple SD Gothic Neo', 'Malgun Gothic', Georgia, serif",
              letterSpacing: '0.02em'
            }}
          >
            받아줘
          </h1>
          <div className="text-[10px] mt-1 tracking-widest" style={{ color: '#86705E' }}>
            takemyletter.site
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base mb-1"
          style={{ color: '#3D2E22' }}
        >
          말로 하기 어려운 마음을, 편지로 받아줘.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-xs mb-12"
          style={{ color: '#86705E' }}
        >
          링크로 전하는 디지털 손편지
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-4"
        >
          <MotionButton
            variant="primary"
            onClick={() => navigate('/create/letter')}
          >
            편지 쓰기
          </MotionButton>
          <MotionButton variant="accent" onClick={() => navigate('/ask')}>
            나한테 편지 써줘
          </MotionButton>
          <MotionButton variant="soft" onClick={() => setOpenModal(true)}>
            받은 편지 열기
          </MotionButton>
        </motion.div>

        <button
          onClick={() => navigate('/create/diary')}
          className="mt-8 text-xs underline underline-offset-4"
          style={{ color: '#86705E', textDecorationStyle: 'dashed' }}
        >
          다이어리 만들기
        </button>

        {/* 종이 탭 안내 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10 w-full"
        >
          <div
            className="paper-tab w-full justify-center !py-3"
            style={{ borderRadius: 14 }}
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
