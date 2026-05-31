import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'
import EnvelopeReveal from '../components/EnvelopeReveal'
import LetterPaper from '../components/LetterPaper'
import PolaroidPhotoCard from '../components/PolaroidPhotoCard'
import ScratchPhotoReveal from '../components/ScratchPhotoReveal'
import PostItNote from '../components/PostItNote'
import RecordPlayer from '../components/RecordPlayer'
import StickerDecoration from '../components/StickerDecoration'
import { getItem } from '../utils/storage'

export default function ViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // ?preview=1 로 들어오면 받아보기·비밀번호 단계 건너뛰고 바로 본문.
  // (작성자가 Complete 페이지에서 자기 편지를 확인할 때 사용)
  const isPreview = searchParams.get('preview') === '1'
  const shouldReduceMotion = useReducedMotion()

  const [item, setItem] = useState(() => getItem(id))
  const [opened, setOpened] = useState(isPreview)
  const [unlocked, setUnlocked] = useState(isPreview)
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    setItem(getItem(id))
    setOpened(isPreview)
    setUnlocked(isPreview)
    setPassword('')
    setPwError('')
  }, [id, isPreview])

  if (item === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-20 text-center"
      >
        <div className="text-5xl mb-4">🕯️</div>
        <h1 className="text-lg font-bold text-ink-900 mb-2">
          존재하지 않는 페이지입니다.
        </h1>
        <p className="text-sm text-ink-500 mb-8 px-4">
          링크가 만료되었거나, 주소가 잘못되었어요.
          <br />이 데모는 같은 브라우저에서만 열람할 수 있어요.
        </p>
        <MotionButton variant="soft" onClick={() => navigate('/')}>
          홈으로
        </MotionButton>
      </motion.div>
    )
  }

  const tryPassword = () => {
    // NOTE: 실서비스에서는 hash 비교가 필요함.
    const expected = item.passwordAnswer ?? item.password
    if (password === expected) {
      setUnlocked(true)
      setPwError('')
    } else {
      setShake(true)
      setPwError('비밀번호가 달라요.')
      window.setTimeout(() => setShake(false), 500)
    }
  }

  const needsPassword = item.passwordEnabled && !unlocked
  const phase = !opened ? 'invite' : needsPassword ? 'password' : 'content'
  const hint = item.passwordHint || item.passwordQuestion

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-6"
    >
      {phase === 'invite' && (
        <EnvelopeReveal
          reduceMotion={shouldReduceMotion}
          onRevealed={() => setOpened(true)}
        />
      )}

      {phase === 'password' && (
        <motion.div
          key="password"
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: 1,
            y: 0,
            x: shake ? [0, -10, 10, -8, 8, -4, 4, 0] : 0
          }}
          transition={shake ? { duration: 0.5 } : { duration: 0.35 }}
        >
          <SoftCard className="text-center">
            <motion.div
              animate={{ rotate: shake ? [0, -8, 8, -8, 0] : 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl mb-3"
            >
              🔒
            </motion.div>
            <h2 className="text-base font-bold text-ink-900 mb-2">
              이 편지에는 잠금이 있어요
            </h2>
            {hint && (
              <p className="text-xs text-ink-500 mb-5">힌트: {hint}</p>
            )}
            <input
              type="password"
              className="field text-center mb-2"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPwError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') tryPassword()
              }}
              placeholder="비밀번호 입력"
              autoFocus
            />
            <AnimatePresence>
              {pwError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-accent-pinkDeep mb-3"
                >
                  {pwError}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-3">
              <MotionButton variant="primary" onClick={tryPassword}>
                열어보기
              </MotionButton>
            </div>
          </SoftCard>
        </motion.div>
      )}

      {phase === 'content' && (
        <motion.div
          key="content"
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : 16,
            scale: shouldReduceMotion ? 1 : 0.98
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.9,
            ease: [0.22, 0.61, 0.36, 1]
          }}
        >
          {isPreview && (
            <div className="flex items-center justify-between mb-4 -mt-2">
              <button
                onClick={() => navigate(`/complete/${id}`)}
                className="text-ink-700 text-sm px-2 py-1 -ml-2 hover:text-ink-900"
              >
                ← 링크 복사로 돌아가기
              </button>
              <div className="text-[11px] text-ink-500 bg-white/70 rounded-full px-3 py-1 border border-cream-200">
                미리보기
              </div>
            </div>
          )}
          {item.passwordEnabled && !isPreview && (
            <motion.div
              initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="text-4xl text-center mb-4"
            >
              🔓
            </motion.div>
          )}
          {item.type === 'letter' ? (
            <LetterView item={item} />
          ) : (
            <DiaryView item={item} />
          )}

          {isPreview ? (
            <div className="mt-6">
              <MotionButton
                variant="ghost"
                onClick={() => navigate(`/complete/${id}`)}
              >
                ← 링크 복사로 돌아가기
              </MotionButton>
            </div>
          ) : (
            <WriteMyOwnTab />
          )}
        </motion.div>
      )}

      {phase === 'invite' && !isPreview && <WriteMyOwnTab />}
      {phase === 'password' && !isPreview && <WriteMyOwnTab />}
    </motion.div>
  )
}

// 수신 화면 하단의 작고 조용한 "나도 편지쓰기" 종이 탭.
// 일반 CTA 처럼 크면 안 됨 — 편지보다 눈에 띄지 않게.
function WriteMyOwnTab() {
  const navigate = useNavigate()
  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="paper-tab"
        aria-label="나도 편지쓰기"
      >
        <span className="text-[13px]">✍️</span>
        <span>나도 편지쓰기</span>
      </button>
    </div>
  )
}

// ─── Letter view ─────────────────────────────────────────
function LetterView({ item }) {
  const isAnon = item.isAnonymous || item.senderMode === '익명'
  const senderLabel = isAnon
    ? '익명의 마음으로부터'
    : item.senderName || '보내는 사람'

  // 호환성: content / body 양쪽 지원
  const body = item.content || item.body || ''
  const postItText = item.postItText || item.postIt?.text || ''
  const paperColor = item.paperColor || 'ivory'
  const photo = item.photo || null
  const music =
    item.music && item.music.src
      ? item.music
      : item.musicUrl
      ? { src: item.musicUrl, title: '', isEnabled: true }
      : null

  return (
    <div className="space-y-5">
      {music && music.isEnabled !== false && music.src && (
        <RecordPlayer music={music} />
      )}

      {photo && photo.src && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex justify-center py-2"
        >
          <PolaroidPhotoCard
            photo={photo}
            rotation={-2.5}
            withTape={true}
            tapeColor="pink"
          >
            {photo.displayMode === 'scratch' && (
              <ScratchPhotoReveal src={photo.src} hint="살짝 긁어보세요" />
            )}
          </PolaroidPhotoCard>
        </motion.div>
      )}

      <div>
        {postItText && (
          <motion.div
            initial={{ y: -8, opacity: 0, rotate: 0 }}
            animate={{ y: 0, opacity: 1, rotate: 4 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 18 }}
            className="relative z-10 flex justify-end pr-3 -mb-5"
          >
            <PostItNote text={postItText} rotation={0} width={170} />
          </motion.div>
        )}
        <LetterPaper colorKey={paperColor}>
          <div className="pl-3 relative">
            <div className="text-xs mb-2 opacity-70">
              To. {item.receiverName}
            </div>
            <h1 className="text-2xl font-bold mb-1 leading-snug">
              {item.title}
            </h1>
            {item.subtitle && (
              <p className="text-sm mb-4 opacity-80">{item.subtitle}</p>
            )}
            <div className="text-[15px] whitespace-pre-line leading-[28px] mt-3">
              {body}
            </div>
            <div className="text-xs text-right mt-8 opacity-70">
              {isAnon ? senderLabel : `From. ${senderLabel}`}
            </div>
          </div>
          <StickerDecoration count={2} size={20} />
        </LetterPaper>
      </div>

      <p className="text-center text-xs text-ink-500 mt-6 pb-2">
        조심스럽게 보낸 마음이에요. 천천히 읽어주세요.
      </p>
    </div>
  )
}

// ─── Diary view (unchanged) ─────────────────────────────
const pageVariants = {
  enter: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 }
}

function DiaryView({ item }) {
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const total = item.pages.length
  const isAnon = item.senderMode === '익명' || item.isAnonymous
  const senderLabel = isAnon
    ? '익명의 마음으로부터'
    : item.senderName || '보내는 사람'

  const go = (delta) => {
    const target = page + delta
    if (target < 0 || target >= total) return
    setDir(delta)
    setPage(target)
  }

  const current = item.pages[page]

  return (
    <div>
      <SoftCard className="mb-4">
        <div className="text-xs text-ink-500 mb-1">To. {item.receiverName}</div>
        <h1 className="text-xl font-bold text-ink-900">{item.title}</h1>
        {item.subtitle && (
          <p className="text-sm text-accent-pinkDeep mt-1">{item.subtitle}</p>
        )}
        <div className="text-xs text-ink-500 text-right mt-3">
          {isAnon ? senderLabel : `From. ${senderLabel}`}
        </div>
      </SoftCard>

      <SoftCard className="mb-4 overflow-hidden">
        <motion.div
          key={page}
          custom={dir}
          variants={pageVariants}
          initial="enter"
          animate="center"
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {current.imageUrl ? (
            <img
              src={current.imageUrl}
              alt=""
              className="w-full h-48 object-cover rounded-2xl mb-4 bg-cream-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-cream-100 via-accent-pink/30 to-accent-lavender/40 mb-4 flex items-center justify-center text-ink-500 text-xs tracking-wide">
              기억의 한 페이지
            </div>
          )}
          {current.date && (
            <div className="text-xs text-ink-500 mb-1">{current.date}</div>
          )}
          <h2 className="text-lg font-bold text-ink-900 mb-2">
            {current.title || '제목 없음'}
          </h2>
          <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">
            {current.body}
          </p>
        </motion.div>
      </SoftCard>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => go(-1)}
          disabled={page === 0}
          className="flex-1 py-3 rounded-2xl bg-white text-ink-700 border border-cream-200 disabled:opacity-40 transition-colors hover:bg-cream-50"
        >
          이전
        </button>
        <div className="text-xs text-ink-500 px-2 tabular-nums">
          {page + 1} / {total}
        </div>
        <button
          onClick={() => go(1)}
          disabled={page === total - 1}
          className="flex-1 py-3 rounded-2xl bg-white text-ink-700 border border-cream-200 disabled:opacity-40 transition-colors hover:bg-cream-50"
        >
          다음
        </button>
      </div>
    </div>
  )
}
