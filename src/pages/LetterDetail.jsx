import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLetterFor, updateLetterFor, presentSender, canViewLetter } from '../utils/storage'
import Toast from '../components/Toast'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'
import PixelEnvelope from '../components/pixel/PixelEnvelope'
import HeartBurst from '../components/pixel/HeartBurst'

// /letter/:id — 받은 편지 상세. receiver 본인 또는 isPublic 만 열람.
// 봉투 클릭 → 픽셀 창 안에 편지 내용 + 답장/공개/보관/삭제.
export default function LetterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [letterState, setLetterState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('envelope') // envelope | opening | content
  const [burst, setBurst] = useState(0)
  const [replyDraft, setReplyDraft] = useState('')
  const [toast, setToast] = useState({ message: '', show: false })
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getLetterFor(id, user)
      .then((l) => {
        if (cancelled) return
        setLetterState(l)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLetterState(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, user?.id])

  useEffect(() => {
    setReplyDraft(letterState?.reply || '')
  }, [letterState?.id])

  const sender = useMemo(() => presentSender(letterState), [letterState])

  const showToast = (m) => {
    setToast({ message: m, show: true })
    setTimeout(() => setToast({ message: '', show: false }), 2200)
  }

  if (loading) {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="wait" px={6} />
            <p className="mt-4 text-[13px]" style={{ color: 'var(--px-deep)' }}>
              편지를 불러오는 중...
            </p>
          </div>
        </PixelWindow>
      </div>
    )
  }

  if (!letterState) {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <p className="mt-4 mb-5 text-[13px]" style={{ color: 'var(--px-text)' }}>
              이 편지를 찾을 수 없어요.
            </p>
            <PixelButton variant="cream" onClick={() => navigate('/me')}>
              내 편지함으로
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
    )
  }

  const allowed = canViewLetter(letterState, user?.id)
  if (!allowed) {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <p className="mt-4 text-[13px] font-bold" style={{ color: 'var(--px-text)' }}>
              이 편지는 받은 사람만 볼 수 있어요.
            </p>
            <p className="mt-1 mb-5 text-[11px]" style={{ color: 'var(--px-deep)' }}>
              @{letterState.receiverUsername} 님의 편지함에 도착한 편지예요.
            </p>
            <PixelButton variant="cream" onClick={() => navigate('/')}>
              홈으로
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
    )
  }

  const isOwner = user?.id === letterState.receiverId

  const openEnvelope = () => {
    if (phase !== 'envelope') return
    setBurst(Date.now())
    setPhase('opening')
    window.setTimeout(() => setPhase('content'), 950)
  }

  const togglePublic = async () => {
    if (!isOwner) return
    const np = !letterState.isPublic
    const ok = await updateLetterFor(letterState.id, user, { isPublic: np })
    if (!ok) {
      showToast('변경하지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    setLetterState({ ...letterState, isPublic: np })
    showToast(np ? '편지를 공개했어요.' : '편지를 비공개로 돌렸어요.')
  }
  const toggleArchive = async () => {
    if (!isOwner) return
    const na = !letterState.isArchived
    const ok = await updateLetterFor(letterState.id, user, { isArchived: na })
    if (!ok) {
      showToast('변경하지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    setLetterState({ ...letterState, isArchived: na })
    showToast(na ? '보관함으로 옮겼어요.' : '받은 편지함으로 되돌렸어요.')
  }
  const saveReply = async () => {
    if (!isOwner) return
    const ok = await updateLetterFor(letterState.id, user, { reply: replyDraft })
    if (!ok) {
      showToast('답장을 저장하지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    setLetterState({ ...letterState, reply: replyDraft })
    showToast('답장을 저장했어요 ♡')
  }
  const remove = async () => {
    if (!isOwner) return
    const ok = await updateLetterFor(letterState.id, user, { isDeleted: true })
    if (!ok) {
      showToast('삭제하지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    showToast('편지를 삭제했어요.')
    setTimeout(() => navigate('/me'), 800)
  }

  const date = new Date(letterState.createdAt)
  const dateLabel = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="px-btn px-btn-ghost px-btn-sm" style={{ width: 'auto' }}>
          ← 뒤로
        </button>
      </div>

      {(phase === 'envelope' || phase === 'opening') && (
        <div className="pt-6 text-center">
          <p className="text-[13px] mb-1" style={{ color: 'var(--px-text)' }}>
            {sender.label} 님으로부터
          </p>
          <p className="text-[11px] mb-7" style={{ color: 'var(--px-deep)' }}>
            한 통의 편지가 도착했어요
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
          <PixelWindow title="♡ LETTER ♡" pop={false}>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <span className="px-label">from {sender.label}</span>
              <span className="text-[10px]" style={{ color: 'var(--px-deep)' }}>
                {dateLabel}
              </span>
            </div>

            <p
              className="text-[14px]"
              style={{
                color: 'var(--px-text)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '26px',
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0 25px, rgba(201,111,127,0.16) 25px 26px)',
                backgroundPosition: '0 6px',
                padding: '4px 2px',
                minHeight: 140
              }}
            >
              {letterState.content}
            </p>

            <div className="mt-3 text-right text-[12px]" style={{ color: 'var(--px-deep)' }}>
              to. @{letterState.receiverUsername}
            </div>
          </PixelWindow>

          {isOwner && (
            <>
              {/* 답장 메모 */}
              <div
                className="mt-5 p-4"
                style={{ background: 'var(--px-surface)', border: '3px solid var(--px-border)' }}
              >
                <div className="text-[12px] font-bold mb-2" style={{ color: 'var(--px-text)' }}>
                  ♥ 내 답장 메모
                </div>
                <textarea
                  className="px-textarea min-h-[110px]"
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="이 편지에 답장처럼 메모를 남겨둘 수 있어요."
                />
                <div className="text-right mt-2">
                  <PixelButton variant="deep" size="sm" onClick={saveReply}>
                    답장 저장
                  </PixelButton>
                </div>
              </div>

              {/* 액션들 */}
              <div className="mt-4 space-y-2.5">
                <PixelButton variant="cream" onClick={togglePublic}>
                  {letterState.isPublic ? '비공개로 돌리기' : '공개하기'}
                </PixelButton>
                {!letterState.isPublic && (
                  <p className="text-[11px] px-1" style={{ color: 'var(--px-deep)' }}>
                    공개하기를 누르기 전까지 이 편지는 나만 볼 수 있어요. 공개하면 링크를
                    아는 누구나 볼 수 있고, 내용 속 개인정보도 함께 노출될 수 있어요.
                  </p>
                )}
                <PixelButton variant="cream" onClick={toggleArchive}>
                  {letterState.isArchived ? '받은 편지함으로 되돌리기' : '보관함으로 옮기기'}
                </PixelButton>
                {!confirmDelete ? (
                  <PixelButton variant="danger" onClick={() => setConfirmDelete(true)}>
                    삭제하기
                  </PixelButton>
                ) : (
                  <div
                    className="p-3 text-center"
                    style={{ background: 'var(--px-cream)', border: '3px dashed #b0413e' }}
                  >
                    <p className="text-[12px] mb-2" style={{ color: 'var(--px-text)' }}>
                      정말 삭제할까요? 되돌릴 수 없어요.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <PixelButton variant="danger" size="sm" onClick={remove}>
                        삭제
                      </PixelButton>
                      <PixelButton variant="cream" size="sm" onClick={() => setConfirmDelete(false)}>
                        취소
                      </PixelButton>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}
