import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'

// 받아줘 메인 — 8비트 핑크 픽셀 편지함 랜딩.
//   내 편지함 만들기   → /login (로그인 후 /me)
//   일회성 편지 만들기 → /one-letter
//   친구에게 편지 쓰기 → /write/id
//   받은 편지 확인하기 → /me
export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-[88vh] justify-center"
    >
      <PixelWindow title="♡ 받아줘 ♡">
        <div className="flex flex-col items-center text-center">
          <PixelCat state="heart-hug" px={6} />

          <h1
            className="mt-4 text-[18px] font-bold leading-relaxed"
            style={{ color: 'var(--px-text)' }}
          >
            말하기 어려웠던 마음을
            <br />
            작은 픽셀 편지에 담아 보내요.
          </h1>
          <p
            className="mt-2 text-[12px] leading-relaxed"
            style={{ color: 'var(--px-deep)' }}
          >
            익명으로도, 이름을 적어서도
            <br />
            고마움과 응원, 사과와 칭찬을
            <br />
            조심히 전할 수 있어요.
          </p>

          <hr className="px-hr w-full" />

          <div className="w-full space-y-3">
            <PixelButton
              variant="deep"
              onClick={() => navigate(user?.username ? '/me' : '/login')}
            >
              {user?.username ? `♥ @${user.username} 편지함으로` : '♥ 내 편지함 만들기'}
            </PixelButton>
            <PixelButton onClick={() => navigate('/one-letter')}>
              일회성 편지 만들기
            </PixelButton>
            <PixelButton variant="cream" onClick={() => navigate('/write/id')}>
              친구에게 편지 쓰기
            </PixelButton>
            <PixelButton variant="surface" onClick={() => navigate('/me')}>
              받은 편지 확인하기
            </PixelButton>
          </div>
        </div>
      </PixelWindow>

      <p
        className="mt-5 text-[11px] text-center leading-relaxed"
        style={{ color: 'var(--px-deep)' }}
      >
        로그인 없이도 편지를 보낼 수 있어요. 이름을 적지 않으면 익명으로 전달돼요.
        <br />
        <Link
          to="/privacy"
          className="underline"
          style={{ color: 'var(--px-text)', textUnderlineOffset: 3 }}
        >
          개인정보 처리방침
        </Link>
      </p>
    </motion.div>
  )
}
