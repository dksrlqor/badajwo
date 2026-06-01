import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  getSimpleLetterByCode,
  incrementSimpleLetterView
} from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import EnvelopeReveal from '../components/EnvelopeReveal'
import LetterTemplateRenderer from '../components/letterTemplates/LetterTemplateRenderer'
import MotionButton from '../components/MotionButton'

// /quick/:code — 작성자가 만든 simpleLetter 를 받는 사람이 열람하는 화면.
// "친구가 나에게 메시지 남기는" 화면이 아니다 — 작성자가 이미 완성한 편지를 펼쳐 보여준다.
//
// ?preview=1 — 봉투 단계 스킵, 편지 즉시 표시 (작성자 미리보기용)

export default function QuickView() {
  const { code } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const letter = useMemo(() => getSimpleLetterByCode(code), [code])
  const previewMode =
    new URLSearchParams(location.search).get('preview') === '1'

  const [phase, setPhase] = useState(previewMode ? 'content' : 'envelope')
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 첫 열람 시 view count 증가 — 미리보기 모드는 제외, 작성자 본인도 제외.
  useEffect(() => {
    if (!letter) return
    if (previewMode) return
    if (user && user.id === letter.createdByUserId) return
    incrementSimpleLetterView(code)
    // mount 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // 검색엔진 노출 방지 — 이 페이지 동안만 noindex 메타 추가.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      try { document.head.removeChild(meta) } catch {}
    }
  }, [])

  if (!letter) {
    return <NotFoundView onHome={() => navigate('/')} />
  }

  const isOwner = !!user && user.id === letter.createdByUserId

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-4"
    >
      {previewMode && (
        <div
          className="mx-1 mb-5 px-4 py-3 text-[12px] leading-relaxed"
          style={{
            background: '#FCF096',
            color: '#3D2E22',
            borderRadius: '4px 6px 5px 7px',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
            boxShadow: '0 1px 3px rgba(92,62,40,0.16)'
          }}
        >
          <b>미리보기</b>
          <br />
          받는 사람이 보게 될 화면이에요. 봉투 단계는 건너뛰고 바로 편지가 표시돼요.
        </div>
      )}

      {phase === 'envelope' && (
        <motion.div
          key="envelope"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EnvelopeReveal
            reduceMotion={reduceMotion}
            onRevealed={() => setPhase('content')}
          />
          {letter.senderName && (
            <p
              className="text-center text-[11px] mt-6"
              style={{ color: '#86705E' }}
            >
              from. {letter.senderName}
            </p>
          )}
        </motion.div>
      )}

      {phase === 'content' && (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <LetterTemplateRenderer letter={letter} />

          {/* 발신자/수신자 안내 + 다음 액션 */}
          <div
            className="mt-8 mx-1 px-4 py-4 text-[12px] leading-relaxed"
            style={{
              background: 'rgba(253, 248, 238, 0.85)',
              color: '#5A4538',
              borderRadius: '5px 7px 4px 6px',
              border: '1px dashed rgba(92,62,40,0.22)'
            }}
          >
            이 편지는 받아줘에서 만들어진 일회성 편지 링크예요. 같은 링크로 다시 열어볼 수 있어요.
            {isOwner && (
              <>
                <br />
                <span style={{ color: '#86705E' }}>이 편지는 당신이 만든 편지예요.</span>
              </>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <MotionButton variant="soft" onClick={() => navigate('/write')}>
              나도 편지 만들어보기
            </MotionButton>
            <MotionButton variant="ghost" onClick={() => navigate('/')}>
              받아줘 둘러보기
            </MotionButton>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function NotFoundView({ onHome }) {
  return (
    <div className="pt-12 text-center px-4">
      <div className="text-5xl mb-3">📭</div>
      <h1
        className="text-[18px] font-bold mb-2"
        style={{
          color: '#3D2E22',
          fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
        }}
      >
        이 편지를 찾을 수 없어요.
      </h1>
      <p className="text-[12px] mb-6 leading-relaxed" style={{ color: '#86705E' }}>
        링크가 만료되었거나 잘못된 주소일 수 있어요.
        <br />
        보낸 사람에게 다시 확인해보세요.
      </p>
      <MotionButton variant="soft" onClick={onHome}>
        홈으로
      </MotionButton>
    </div>
  )
}
