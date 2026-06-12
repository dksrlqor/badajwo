import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'

// 404 — 존재하지 않는 경로. 픽셀 세계관 안에서 안내하고 홈으로 돌려보낸다.
export default function NotFound() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-12 text-center"
    >
      <PixelWindow title="♡ 받아줘 ♡">
        <div className="flex flex-col items-center py-4">
          <PixelCat state="tilt" px={6} animate={false} />
          <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
            앗, 이 주소에는 편지가 없어요.
          </h1>
          <p
            className="mt-1 mb-5 text-[12px] leading-relaxed"
            style={{ color: 'var(--px-deep)' }}
          >
            주소가 잘못되었거나 사라진 페이지예요.
          </p>
          <div className="w-full space-y-3">
            <PixelButton variant="deep" onClick={() => navigate('/')}>
              처음으로 돌아가기
            </PixelButton>
            <PixelButton variant="ghost" onClick={() => navigate('/one-letter')}>
              새 편지 만들기
            </PixelButton>
          </div>
        </div>
      </PixelWindow>
    </motion.div>
  )
}
