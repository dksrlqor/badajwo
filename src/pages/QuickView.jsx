import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  getSimpleLetterByCode,
  incrementSimpleLetterView
} from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import LetterTemplateRenderer from '../components/letterTemplates/LetterTemplateRenderer'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'
import PixelEnvelope from '../components/pixel/PixelEnvelope'
import HeartBurst from '../components/pixel/HeartBurst'

// /l/:code (+ 옛 /quick/:code 호환) — 일회성 픽셀 편지 열람.
// 봉투 클릭 → 흔들림 + 하트 + 플랩 열림 → 편지 내용.
// ?preview=1 — 봉투 단계 스킵 (작성자 미리보기).

export default function QuickView() {
  const { code } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const previewMode =
    new URLSearchParams(location.search).get('preview') === '1'

  const [letter, setLetter] = useState(null)
  const [loading, setLoading] = useState(true)
  // phase: envelope → opening → content
  const [phase, setPhase] = useState(previewMode ? 'content' : 'envelope')
  const [burst, setBurst] = useState(0)
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getSimpleLetterByCode(code).then((l) => {
      if (!mounted) return
      setLetter(l)
      setLoading(false)
      if (!l || previewMode) return
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

  const openEnvelope = () => {
    if (phase !== 'envelope') return
    setBurst(Date.now())
    if (reduceMotion) {
      setPhase('content')
      return
    }
    setPhase('opening')
    window.setTimeout(() => setPhase('content'), 950)
  }

  if (loading) {
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

  if (!letter) {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
              이 편지를 찾을 수 없어요.
            </h1>
            <p className="mt-1 mb-5 text-[12px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
              링크가 만료되었거나 잘못된 주소일 수 있어요.
              <br />
              보낸 사람에게 다시 확인해보세요.
            </p>
            <PixelButton variant="cream" onClick={() => navigate('/')}>
              홈으로
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
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

      {(phase === 'envelope' || phase === 'opening') && (
        <div className="pt-8 text-center">
          <h1 className="text-[18px] font-bold mb-1" style={{ color: 'var(--px-heart)' }}>
            ♡ Letter For You ♡
          </h1>
          <p className="text-[12px] mb-8" style={{ color: 'var(--px-deep)' }}>
            편지를 열어보세요
          </p>

          <button
            type="button"
            onClick={openEnvelope}
            aria-label="편지 열기"
            className={phase === 'envelope' ? 'px-shake-hover' : 'px-shake'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: phase === 'envelope' ? 'pointer' : 'wait',
              position: 'relative',
              display: 'inline-block'
            }}
          >
            <PixelEnvelope open={phase === 'opening'} px={8} />
            <HeartBurst trigger={burst} px={5} />
          </button>

          <div className="mt-6 flex justify-center">
            <PixelCat state={phase === 'opening' ? 'heart-hug' : 'wait'} px={5} />
          </div>

          <p className="mt-4 text-[11px]" style={{ color: 'var(--px-deep)' }}>
            {phase === 'opening' ? '편지를 펼치는 중...' : 'click to open'}
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
            이 편지는 받아줘에서 만들어진 일회성 픽셀 편지예요. 같은 링크로 다시 열어볼
            수 있어요.
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
