import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import { useAuth } from '../context/AuthContext'
import { OrnamentLine } from '../components/VintageMail'

// 받아줘 메인 — 빈티지 종이 라벨 + 두 갈래 CTA
//   1) 편지 쓰러 가기 (로그인 없이) → /write
//   2) 내 편지함 만들기 (로그인) → /login or /me
export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-[85vh]"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center w-full pt-4">
        {/* 종이 라벨 — 받아줘 */}
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
              filter: 'drop-shadow(0 2px 4px rgba(92, 62, 40, 0.30))'
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
          </svg>
          <h1
            className="text-[34px] font-bold tracking-tight"
            style={{
              color: '#3D2E22',
              fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', Georgia, serif",
              letterSpacing: '0.02em'
            }}
          >
            받아줘
          </h1>
          <div className="flex justify-center mt-1.5 mb-1">
            <OrnamentLine width={120} color="#86705E" />
          </div>
          <div className="text-[10px] mt-0.5 tracking-widest" style={{ color: '#86705E' }}>
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

        {/* CTA 두 갈래 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-4"
        >
          <MotionButton
            variant="primary"
            onClick={() => navigate('/write')}
          >
            편지 쓰러 가기
          </MotionButton>
          <MotionButton
            variant="accent"
            onClick={() => navigate(user?.username ? '/me' : '/login')}
          >
            {user?.username ? `@${user.username} 으로 가기` : '내 편지함 만들기'}
          </MotionButton>
        </motion.div>

        {/* 하단 안내바 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10 w-full"
        >
          <div
            className="px-4 py-3 text-[11px] leading-relaxed text-center"
            style={{
              background: 'rgba(255, 252, 245, 0.7)',
              color: '#5A4538',
              border: '1px dashed rgba(92, 62, 40, 0.20)',
              borderRadius: '5px 7px 4px 6px'
            }}
          >
            로그인 없이도 편지를 보낼 수 있어요. 이름을 적지 않으면 익명으로 전달되며,
            개인정보는 동의 없이 공개되지 않아요.
            <br />
            <Link
              to="/privacy"
              className="inline-block mt-1 underline"
              style={{ color: '#5A4538', textUnderlineOffset: 3 }}
            >
              개인정보 처리방침
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
