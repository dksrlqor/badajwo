import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'

// /write — 편지 쓰러가기 선택.
//   1. 아이디로 보내기   → /write/id → /u/:username/write (받은 편지함으로 도착)
//   2. 일회성 픽셀 편지  → /one-letter (전용 링크 한 통)
export default function Write() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <div className="flex items-center mb-4">
        <button onClick={() => navigate('/')} className="px-btn px-btn-ghost px-btn-sm" style={{ width: 'auto' }}>
          ← 뒤로
        </button>
      </div>

      <PixelWindow title="♡ 편지 쓰러가기 ♡">
        <div className="flex justify-center mb-4">
          <PixelCat state="idle" px={5} />
        </div>

        <div className="space-y-4">
          <div className="px-card px-card-cream p-4">
            <h2 className="text-[14px] font-bold mb-1" style={{ color: 'var(--px-text)' }}>
              아이디로 보내기
            </h2>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--px-deep)' }}>
              친구의 받아줘 아이디를 알고 있다면,
              <br />
              그 친구의 받은 편지함으로 편지가 도착해요.
            </p>
            <PixelButton variant="deep" size="sm" style={{ width: '100%' }} onClick={() => navigate('/write/id')}>
              아이디 입력하기
            </PixelButton>
          </div>

          <div className="px-card p-4">
            <h2 className="text-[14px] font-bold mb-1" style={{ color: 'var(--px-text)' }}>
              일회성 픽셀 편지
            </h2>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--px-deep)' }}>
              아이디를 몰라도 괜찮아요.
              <br />
              편지 한 통을 만들어 전용 링크로 보내요.
            </p>
            <PixelButton size="sm" style={{ width: '100%' }} onClick={() => navigate('/one-letter')}>
              편지 만들러 가기
            </PixelButton>
          </div>
        </div>
      </PixelWindow>
    </motion.div>
  )
}
