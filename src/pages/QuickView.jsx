import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  getSimpleLetterWithStatus,
  incrementSimpleLetterView
} from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import LetterTemplateRenderer from '../components/letterTemplates/LetterTemplateRenderer'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'
import PixelEnvelope from '../components/pixel/PixelEnvelope'
import HeartBurst from '../components/pixel/HeartBurst'
import MailCat from '../components/pixel/MailCat'

// /l/:code (+ 옛 /quick/:code 호환) — 일회성 픽셀 편지 열람.
//
// 오픈 인터랙션: 편지를 입에 문 배달 고양이를 3번 톡톡 → 터치마다 표정이
// 점점 웃상으로 변하고(하트 이펙트), 3번째에 편지를 건네주며 봉투가
// 픽셀스럽게 열린 뒤 본문으로 이어진다. 편지를 받기 전의 작은 의식.
// ?preview=1 — 고양이/봉투 단계 스킵 (작성자 미리보기).
//
// 만료(24시간)·삭제·없음은 DB 기준 status 로 구분해 각각 다른 안내 화면을 보여준다.
// 만료된 편지는 봉투/내용이 절대 열리지 않는다 (content 는 서버에서 내려오지도 않음).

const TAPS_TO_OPEN = 3
const TAP_COOLDOWN_MS = 260

const TAP_CAPTIONS = [
  '고양이를 톡톡 눌러 편지를 열어보세요',
  '한 번 더! 고양이가 기분이 좋아지고 있어요',
  '마지막 한 번! 곧 편지를 건네줄 거예요',
  '편지를 건네주고 있어요...'
]

function NoticeScreen({ visual, title, lines, children }) {
  return (
    <div className="pt-12 text-center">
      <PixelWindow title="♡ 받아줘 ♡">
        <div className="flex flex-col items-center py-4">
          {visual}
          <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
            {title}
          </h1>
          <p
            className="mt-1 mb-5 text-[12px] leading-relaxed"
            style={{ color: 'var(--px-deep)' }}
          >
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <div className="w-full space-y-3">{children}</div>
        </div>
      </PixelWindow>
    </div>
  )
}

export default function QuickView() {
  const { code } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const previewMode =
    new URLSearchParams(location.search).get('preview') === '1'

  const [letter, setLetter] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | expired | deleted | not_found
  // phase: cat (탭 0~3) → opening (봉투 펼침) → content
  const [phase, setPhase] = useState(previewMode ? 'content' : 'cat')
  const [taps, setTaps] = useState(0)
  const [burst, setBurst] = useState(0)
  const lastTap = useRef(0)
  const timers = useRef([])
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const t = timers.current
    return () => t.forEach((id) => window.clearTimeout(id))
  }, [])

  useEffect(() => {
    let mounted = true
    setStatus('loading')
    getSimpleLetterWithStatus(code).then(({ status: s, letter: l }) => {
      if (!mounted) return
      setLetter(l)
      setStatus(s)
      if (s !== 'ok' || !l || previewMode) return
      if (user && user.id === l.createdByUserId) return
      incrementSimpleLetterView(code)
    })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // 검색엔진 노출 방지
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      try { document.head.removeChild(meta) } catch {}
    }
  }, [])

  const onCatTap = () => {
    if (phase !== 'cat' || taps >= TAPS_TO_OPEN) return
    const now = Date.now()
    if (now - lastTap.current < TAP_COOLDOWN_MS) return
    lastTap.current = now

    const next = taps + 1
    setTaps(next)
    setBurst(now) // 탭마다 작은 하트 — 단계가 오를수록 표정과 함께 보상감

    if (next < TAPS_TO_OPEN) return

    // 3번째 탭 — 활짝 웃으며 편지를 건네준 뒤 봉투가 열린다.
    if (reduceMotion) {
      timers.current.push(window.setTimeout(() => setPhase('content'), 250))
      return
    }
    timers.current.push(
      window.setTimeout(() => {
        setPhase('opening')
        setBurst(Date.now())
        timers.current.push(window.setTimeout(() => setPhase('content'), 950))
      }, 700)
    )
  }

  if (status === 'loading') {
    return (
      <div className="pt-16 text-center">
        <div className="inline-block px-bob" aria-hidden>
          <PixelEnvelope px={5} />
        </div>
        <p className="mt-4 text-[12px]" style={{ color: 'var(--px-deep)' }}>
          편지를 가져오고 있어요...
        </p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <NoticeScreen
        visual={
          <div className="flex flex-col items-center" aria-hidden>
            <PixelEnvelope px={6} />
            <div className="mt-3">
              <PixelCat state="tilt" px={5} animate={false} />
            </div>
          </div>
        }
        title="이 편지는 24시간이 지나 만료되었어요."
        lines={[
          '일회성 편지는 만들어진 후 24시간 동안만 열 수 있어요.',
          '다시 받고 싶다면 새 편지 링크를 만들어달라고 해주세요.'
        ]}
      >
        <PixelButton variant="deep" onClick={() => navigate('/one-letter')}>
          새 편지 만들기
        </PixelButton>
        <PixelButton variant="cream" onClick={() => navigate('/login')}>
          내 편지함 만들기
        </PixelButton>
        <PixelButton variant="ghost" onClick={() => navigate('/')}>
          처음으로 돌아가기
        </PixelButton>
      </NoticeScreen>
    )
  }

  if (status === 'deleted') {
    return (
      <NoticeScreen
        visual={<PixelCat state="tilt" px={6} animate={false} />}
        title="삭제된 편지예요."
        lines={['보낸 사람이 이 편지를 거두어 갔어요.']}
      >
        <PixelButton variant="deep" onClick={() => navigate('/one-letter')}>
          새 편지 만들기
        </PixelButton>
        <PixelButton variant="ghost" onClick={() => navigate('/')}>
          처음으로 돌아가기
        </PixelButton>
      </NoticeScreen>
    )
  }

  if (status !== 'ok' || !letter) {
    return (
      <NoticeScreen
        visual={<PixelCat state="tilt" px={6} animate={false} />}
        title="존재하지 않는 편지예요."
        lines={['주소가 잘못되었을 수 있어요.', '보낸 사람에게 다시 확인해보세요.']}
      >
        <PixelButton variant="deep" onClick={() => navigate('/one-letter')}>
          새 편지 만들기
        </PixelButton>
        <PixelButton variant="ghost" onClick={() => navigate('/')}>
          처음으로 돌아가기
        </PixelButton>
      </NoticeScreen>
    )
  }

  const isOwner = !!user && user.id === letter.createdByUserId

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      {previewMode && (
        <div className="px-label mb-4" role="note">
          미리보기 — 받는 사람이 보게 될 화면이에요
        </div>
      )}

      {phase === 'cat' && (
        <div className="pt-8 text-center">
          <h1 className="text-[18px] font-bold mb-1" style={{ color: 'var(--px-heart)' }}>
            ♡ Letter For You ♡
          </h1>
          <p className="text-[12px] mb-6" style={{ color: 'var(--px-deep)' }}>
            고양이가 편지를 배달하러 왔어요
          </p>

          <button
            type="button"
            onClick={onCatTap}
            aria-label={`고양이를 눌러 편지 받기 — ${Math.min(taps, TAPS_TO_OPEN)} / ${TAPS_TO_OPEN}`}
            className="px-pet-btn"
            style={{ position: 'relative', display: 'inline-block' }}
          >
            {/* key 로 탭마다 점프 모션 재생 */}
            <span key={taps} className={taps > 0 ? 'px-cat-jump' : ''} style={{ display: 'inline-block' }}>
              <MailCat stage={taps} px={10} animate={!reduceMotion} />
            </span>
            <HeartBurst trigger={burst} px={taps >= 2 ? 5 : 4} />
          </button>

          <div className="mt-5 flex justify-center" aria-hidden>
            <span className="px-tap-hearts">
              {Array.from({ length: TAPS_TO_OPEN }, (_, i) => (
                <i key={i} data-on={taps > i}>
                  {taps > i ? '♥' : '♡'}
                </i>
              ))}
            </span>
          </div>

          <p
            className="mt-3 text-[12px] leading-relaxed"
            style={{ color: 'var(--px-deep)' }}
            role="status"
            aria-live="polite"
          >
            {TAP_CAPTIONS[Math.min(taps, TAPS_TO_OPEN)]}
          </p>
        </div>
      )}

      {phase === 'opening' && (
        <div className="pt-8 text-center">
          <h1 className="text-[18px] font-bold mb-1" style={{ color: 'var(--px-heart)' }}>
            ♡ Letter For You ♡
          </h1>
          <p className="text-[12px] mb-8" style={{ color: 'var(--px-deep)' }}>
            고양이가 편지를 건네줬어요
          </p>

          <div className="px-pop" style={{ position: 'relative', display: 'inline-block' }}>
            <PixelEnvelope open px={8} />
            <HeartBurst trigger={burst} px={5} />
          </div>

          <div className="mt-6 flex justify-center">
            <PixelCat state="heart-hug" px={5} />
          </div>

          <p className="mt-4 text-[11px]" style={{ color: 'var(--px-deep)' }}>
            편지를 펼치는 중...
          </p>
        </div>
      )}

      {phase === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <LetterTemplateRenderer letter={letter} />

          <div
            className="mt-5 px-3 py-3 text-[11px] leading-relaxed"
            style={{
              background: 'var(--px-cream)',
              border: '2px solid var(--px-border)',
              color: 'var(--px-deep)'
            }}
          >
            이 편지는 받아줘에서 만들어진 일회성 픽셀 편지예요.{' '}
            {letter.expiresAt
              ? '만들어진 후 24시간 동안만 같은 링크로 열어볼 수 있어요.'
              : '같은 링크로 다시 열어볼 수 있어요.'}
            {isOwner && ' · 당신이 만든 편지예요.'}
          </div>

          <div className="mt-4 space-y-3">
            <PixelButton variant="deep" onClick={() => navigate('/one-letter')}>
              나도 편지 만들어보기
            </PixelButton>
            <PixelButton variant="ghost" onClick={() => navigate('/')}>
              받아줘 둘러보기
            </PixelButton>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
