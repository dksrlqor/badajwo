import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PettableCat from '../components/pixel/PettableCat'

// 받아줘 메인 — 8비트 핑크 픽셀 편지함 랜딩.
//   내 편지함 만들기   → /login (로그인 후 /me)
//   일회성 편지 만들기 → /one-letter (전용 링크, 24시간 유효)
//   친구에게 편지 쓰기 → /write/id
//   받은 편지 확인하기 → /me
// 고양이는 쓰다듬으면 하트를 보내는 이스터에그 (PettableCat).

function MenuAction({ desc, children }) {
  return (
    <div>
      {children}
      <p
        className="mt-1.5 text-[11px] leading-relaxed"
        style={{ color: 'var(--px-deep)' }}
      >
        {desc}
      </p>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-[80vh] justify-center"
    >
      <PixelWindow title="♡ 받아줘 ♡">
        <div className="flex flex-col items-center text-center">
          <PettableCat state="heart-hug" px={6} />

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

          <div className="w-full space-y-4">
            <MenuAction desc="내 링크를 만들고 계속 편지를 받을 수 있어요.">
              <PixelButton
                variant="deep"
                onClick={() => navigate(user?.username ? '/me' : '/login')}
              >
                {user?.username ? `♥ @${user.username} 편지함으로` : '♥ 내 편지함 만들기'}
              </PixelButton>
            </MenuAction>
            <MenuAction desc="편지 하나를 만들어 24시간 동안 열 수 있는 전용 링크로 보내요.">
              <PixelButton onClick={() => navigate('/one-letter')}>
                일회성 편지 만들기
              </PixelButton>
            </MenuAction>
            <MenuAction desc="상대의 아이디나 링크로 편지를 보낼 수 있어요.">
              <PixelButton variant="cream" onClick={() => navigate('/write/id')}>
                친구에게 편지 쓰기
              </PixelButton>
            </MenuAction>
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
      </p>
    </motion.div>
  )
}
