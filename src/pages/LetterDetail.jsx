import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getLetter,
  canViewLetter,
  presentSender,
  setLetterReply,
  setLetterPublic,
  setLetterArchived,
  softDeleteLetter
} from '../utils/storage'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import LetterEnvelopeCard from '../components/LetterEnvelopeCard'

// /letter/:id
// 받은 편지 상세 — receiver 본인 또는 isPublic 일 때만 본문 노출.
// 봉투 → 편지 펼치는 모션은 EnvelopeReveal 사용.
export default function LetterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [letterState, setLetterState] = useState(() => getLetter(id))
  const [opened, setOpened] = useState(false)
  const [replyDraft, setReplyDraft] = useState('')
  const [toast, setToast] = useState({ message: '', show: false })
  const [confirmDelete, setConfirmDelete] = useState(false)

  // letterState 가 바뀔 때 reply draft 동기화
  useEffect(() => {
    setReplyDraft(letterState?.reply || '')
  }, [letterState?.id])

  const sender = useMemo(
    () => presentSender(letterState),
    [letterState]
  )

  const showToast = (m) => {
    setToast({ message: m, show: true })
    setTimeout(() => setToast({ message: '', show: false }), 2000)
  }

  if (!letterState) {
    return (
      <div className="pt-12 text-center">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-[14px]" style={{ color: '#3D2E22' }}>
          이 편지를 찾을 수 없어요.
        </p>
        <div className="mt-6">
          <MotionButton variant="soft" onClick={() => navigate('/me')}>
            내 편지함으로
          </MotionButton>
        </div>
      </div>
    )
  }

  // 권한 체크 — receiver 본인 또는 isPublic
  const allowed = canViewLetter(letterState, user?.id)
  if (!allowed) {
    return (
      <div className="pt-12 text-center px-4">
        <div className="text-5xl mb-3">🔒</div>
        <p
          className="text-[14px] mb-2"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          이 편지는 받은 사람만 볼 수 있어요.
        </p>
        <p className="text-[12px] mb-6" style={{ color: '#86705E' }}>
          @{letterState.receiverUsername} 님의 편지함에 도착한 편지예요.
        </p>
        <MotionButton variant="soft" onClick={() => navigate('/')}>
          홈으로
        </MotionButton>
      </div>
    )
  }

  const isOwner = user?.id === letterState.receiverId

  const togglePublic = () => {
    if (!isOwner) return
    const next = setLetterPublic(letterState.id, !letterState.isPublic)
    setLetterState(next)
    showToast(next.isPublic ? '편지를 공개했어요.' : '편지를 비공개로 돌렸어요.')
  }
  const toggleArchive = () => {
    if (!isOwner) return
    const next = setLetterArchived(letterState.id, !letterState.isArchived)
    setLetterState(next)
    showToast(next.isArchived ? '보관함으로 옮겼어요.' : '받은 편지함으로 되돌렸어요.')
  }
  const saveReply = () => {
    if (!isOwner) return
    const next = setLetterReply(letterState.id, replyDraft)
    setLetterState(next)
    showToast('답장을 저장했어요.')
  }
  const remove = () => {
    if (!isOwner) return
    softDeleteLetter(letterState.id)
    showToast('편지를 삭제했어요.')
    setTimeout(() => navigate('/me'), 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-4"
    >
      <div className="flex items-center mb-5">
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-2 py-1 -ml-2"
          style={{
            color: '#5A4538',
            textDecoration: 'underline dashed rgba(92,62,40,0.32)',
            textUnderlineOffset: 4
          }}
        >
          ← 뒤로
        </button>
      </div>

      {!opened ? (
        <div className="text-center py-8">
          <p
            className="text-[14px] mb-1"
            style={{
              color: '#3D2E22',
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
            }}
          >
            {sender.label} 님으로부터
          </p>
          <p className="text-[11px] mb-6" style={{ color: '#86705E' }}>
            한 통의 편지가 도착했어요.
          </p>
          <EnvelopeOpener onOpened={() => setOpened(true)} />
        </div>
      ) : (
        <>
          {/* 항공우편 봉투 카드 */}
          <div className="mb-6">
            <LetterEnvelopeCard
              letter={letterState}
              senderLabel={sender.label}
              isAnonymous={!!sender.isAnonymous}
            />
          </div>

          {isOwner && (
            <>
              {/* 답장 */}
              <div
                className="paper-noise relative mx-1 mb-5"
                style={{
                  background: '#FCF6E6',
                  padding: '20px 18px 18px',
                  borderRadius: '8px 6px 10px 7px',
                  boxShadow:
                    '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 4px rgba(92,62,40,0.10), 0 8px 18px rgba(92,62,40,0.10)'
                }}
              >
                <div
                  aria-hidden
                  className="masking-tape tape-mint"
                  style={{
                    width: 70,
                    height: 14,
                    top: -7,
                    right: 24,
                    transform: 'rotate(8deg)'
                  }}
                />
                <div
                  className="text-[11px] mb-2"
                  style={{ color: '#86705E', letterSpacing: '0.18em' }}
                >
                  내 답장 메모
                </div>
                <textarea
                  className="paper-textarea lined-paper w-full min-h-[120px]"
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="이 편지에 답장처럼 메모를 남겨둘 수 있어요."
                  style={{
                    background: 'transparent',
                    fontSize: 14,
                    fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
                    color: '#3D2E22'
                  }}
                />
                <div className="text-right mt-2">
                  <button
                    onClick={saveReply}
                    className="stationery-button"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    답장 저장
                  </button>
                </div>
                <p
                  className="text-[10px] mt-2"
                  style={{ color: '#86705E' }}
                >
                  답장은 나중에 다시 열어볼 수 있도록 내 편지함 안에 저장돼요.
                </p>
              </div>

              {/* 액션들 */}
              <div className="space-y-2 mx-1 mb-5">
                <button
                  onClick={togglePublic}
                  className="stationery-button w-full"
                  style={{ padding: '12px 18px', fontSize: 13 }}
                >
                  {letterState.isPublic ? '비공개로 돌리기' : '공개하기'}
                </button>
                {!letterState.isPublic && (
                  <p
                    className="text-[11px] mx-1"
                    style={{ color: '#86705E' }}
                  >
                    공개하기를 누르기 전까지 이 편지는 나만 볼 수 있어요.
                  </p>
                )}
                <button
                  onClick={toggleArchive}
                  className="stationery-button w-full"
                  style={{ padding: '12px 18px', fontSize: 13 }}
                >
                  {letterState.isArchived ? '받은 편지함으로 되돌리기' : '보관함으로 옮기기'}
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="stationery-button w-full"
                    style={{
                      padding: '12px 18px',
                      fontSize: 13,
                      color: '#C7443E'
                    }}
                  >
                    삭제하기
                  </button>
                ) : (
                  <div
                    className="px-3 py-3 text-center"
                    style={{
                      background: '#FBF0DC',
                      border: '1px dashed rgba(199, 68, 62, 0.4)',
                      borderRadius: '4px 6px 5px 7px'
                    }}
                  >
                    <p
                      className="text-[12px] mb-2"
                      style={{ color: '#3D2E22' }}
                    >
                      정말 삭제할까요? 되돌릴 수 없어요.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={remove}
                        className="stationery-button"
                        style={{
                          padding: '8px 14px',
                          fontSize: 12,
                          color: '#C7443E'
                        }}
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="stationery-button"
                        style={{ padding: '8px 14px', fontSize: 12 }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

// 봉투 열기 — 간단한 봉투 SVG + 클릭 시 열림 모션 → onOpened
function EnvelopeOpener({ onOpened }) {
  const [pressed, setPressed] = useState(false)
  const [flap, setFlap] = useState(false)

  const onClick = () => {
    setPressed(true)
    setTimeout(() => setFlap(true), 160)
    setTimeout(() => onOpened?.(), 1000)
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        animate={{ scale: pressed ? 0.97 : 1 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className="cursor-pointer relative"
        style={{
          width: 280,
          height: 180,
          perspective: '700px'
        }}
      >
        {/* 봉투 뒷판 (편지가 그 안에 있음) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: '#F8EFD8',
            borderRadius: 6,
            boxShadow:
              '0 2px 6px rgba(92,62,40,0.18), 0 18px 40px rgba(92,62,40,0.22)'
          }}
        />
        {/* 봉투 앞판 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FCF6E6',
            borderRadius: 6,
            // airmail 사선
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent 0 14px, transparent 14px 28px), linear-gradient(#FCF6E6, #FCF6E6)',
            zIndex: 2
          }}
        />
        {/* airmail 외곽 띠 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 6,
            padding: 6,
            background:
              'repeating-linear-gradient(45deg, #C7443E 0 6px, #FCF6E6 6px 12px, #4E6B8A 12px 18px, #FCF6E6 18px 24px)',
            WebkitMask:
              'linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            zIndex: 3,
            pointerEvents: 'none'
          }}
        />
        {/* 봉투 플랩 */}
        <motion.div
          aria-hidden
          animate={{ rotateX: flap ? -160 : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 90,
            background: '#F2DCB8',
            transformOrigin: 'top center',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            zIndex: 4,
            boxShadow: 'inset 0 -1px 0 rgba(92,62,40,0.16)'
          }}
        />
        {/* 받아줘 우편 도장 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: 18,
            top: 20,
            zIndex: 5
          }}
        >
          <Postmark size={56} rotation={-12} city="받아줘" />
        </div>
      </motion.div>

      <p className="text-[12px] mt-5" style={{ color: '#86705E' }}>
        봉투를 눌러 편지를 열어보세요.
      </p>
    </div>
  )
}
