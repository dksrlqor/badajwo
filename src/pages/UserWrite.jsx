import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserByUsername, saveLetter } from '../utils/storage'
import Toast from '../components/Toast'
import ProfileAvatar from '../components/ProfileAvatar'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'
import HeartBurst from '../components/pixel/HeartBurst'

const BODY_MAX = 1600
const NAME_MAX = 20

// /u/:username/write
// 규칙(절대 불변): receiver = URL username 조회 결과. 로그인 사용자로 절대 안 바뀜.
// 친구는 로그인 없이 익명/이름/계정 모드로 편지를 보낼 수 있다.
export default function UserWrite({ readOnly = false } = {}) {
  const { username } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: currentUser } = useAuth()

  // 받는 사람 = URL username. 절대 currentUser 가 아님.
  const receiver = useMemo(() => getUserByUsername(username), [username])

  const [body, setBody] = useState('')
  const [senderMode, setSenderMode] = useState('anonymous')
  const [senderName, setSenderName] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', show: false })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(null)
  const [burst, setBurst] = useState(0)

  const isOwnLink = currentUser && receiver && currentUser.id === receiver.id
  const previewMode =
    readOnly || new URLSearchParams(location.search).get('preview') === '1'

  if (!receiver) {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
              이 편지함을 찾을 수 없어요.
            </h1>
            <p className="mt-1 mb-5 text-[12px]" style={{ color: 'var(--px-deep)' }}>
              아이디를 다시 확인해주세요. /u/{username}
            </p>
            <PixelButton variant="cream" onClick={() => navigate('/write/id')}>
              다른 아이디로 찾아보기
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
    )
  }

  const showToast = (m) => {
    setToast({ message: m, show: true })
    window.setTimeout(() => setToast({ message: '', show: false }), 2200)
  }

  const submit = () => {
    if (previewMode) {
      showToast('미리보기에서는 편지를 보낼 수 없어요.')
      return
    }
    const content = body.trim()
    if (!content) {
      setError('마음을 적어주세요.')
      return
    }
    if (content.length > BODY_MAX) {
      setError(`편지는 ${BODY_MAX}자까지 담을 수 있어요.`)
      return
    }
    const input = {
      receiverId: receiver.id,
      receiverUsername: receiver.username,
      senderMode,
      content
    }
    if (senderMode === 'name') {
      const n = senderName.trim()
      if (!n) {
        setError('이름을 적거나 익명을 선택해주세요.')
        return
      }
      input.senderName = n
    }
    if (senderMode === 'user') {
      if (!currentUser?.username) {
        setError('내 계정으로 보내려면 로그인이 필요해요.')
        return
      }
      input.senderUserId = currentUser.id
      input.senderUsername = currentUser.username
    }

    // 고양이 배달 모션 — 짧게 보여주고 저장
    setSending(true)
    setError('')
    window.setTimeout(() => {
      const letter = saveLetter(input)
      setSending(false)
      if (!letter) {
        setError('편지를 보내지 못했어요. 잠시 후 다시 시도해주세요.')
        return
      }
      setSent(letter)
      setBurst(Date.now())
    }, 900)
  }

  // ── 배달 중 ──
  if (sending) {
    return (
      <div className="pt-16 text-center">
        <PixelWindow title={`♡ LETTER FOR @${receiver.username} ♡`}>
          <div className="flex flex-col items-center py-6">
            <PixelCat state="envelope" px={6} />
            <p className="mt-5 text-[13px]" style={{ color: 'var(--px-text)' }}>
              고양이가 편지를 배달 중이에요...
            </p>
          </div>
        </PixelWindow>
      </div>
    )
  }

  // ── 전송 성공 ──
  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-10"
      >
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="relative flex flex-col items-center text-center py-2">
            <div className="relative">
              <PixelCat state="heart-hug" px={6} />
              <HeartBurst trigger={burst} />
            </div>
            <h1 className="mt-4 text-[16px] font-bold" style={{ color: 'var(--px-text)' }}>
              편지가 조심히 도착했어요 ♡
            </h1>
            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
              @{receiver.username} 님의 편지함에
              <br />
              작은 마음이 도착했어요.
              <br />
              {sent.senderMode === 'anonymous'
                ? '익명으로 전달됐어요.'
                : sent.senderMode === 'name'
                ? `이름 "${sent.senderName}" 로 전달됐어요.`
                : `@${sent.senderUsername} 으로 전달됐어요.`}
            </p>

            <div className="w-full mt-5 space-y-3">
              <PixelButton
                variant="deep"
                onClick={() => {
                  setSent(null)
                  setBody('')
                  setError('')
                }}
              >
                다른 편지도 보내기
              </PixelButton>
              {!currentUser && (
                <PixelButton variant="cream" onClick={() => navigate('/login')}>
                  내 편지함 만들기
                </PixelButton>
              )}
              <PixelButton variant="ghost" onClick={() => navigate('/')}>
                받아줘 둘러보기
              </PixelButton>
            </div>
          </div>
        </PixelWindow>
      </motion.div>
    )
  }

  // ── 작성 화면 ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      {previewMode && (
        <div className="px-label mb-4" role="note">
          이 화면은 친구가 보게 될 미리보기입니다
        </div>
      )}

      <PixelWindow title={`♡ LETTER FOR @${receiver.username} ♡`}>
        {/* 받는 사람 — URL 기준 고정, 수정 불가 */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 mb-4"
          style={{ background: 'var(--px-surface)', border: '3px solid var(--px-border)' }}
        >
          <ProfileAvatar user={receiver} size={44} />
          <div className="flex-1 min-w-0">
            <div className="text-[11px]" style={{ color: 'var(--px-deep)' }}>
              To.
            </div>
            <div className="text-[15px] font-bold truncate" style={{ color: 'var(--px-text)' }}>
              @{receiver.username}
            </div>
          </div>
          <PixelCat state="idle" px={3} />
        </div>

        <textarea
          className="px-textarea min-h-[220px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="여기에 마음을 조심히 적어주세요..."
          disabled={previewMode}
        />
        <div className="text-right text-[11px] mt-1 mb-4" style={{ color: 'var(--px-deep)' }}>
          {body.length} / {BODY_MAX}
        </div>

        {/* 보내는 사람 선택 */}
        <div className="text-[12px] font-bold mb-2" style={{ color: 'var(--px-text)' }}>
          From.
        </div>
        <div className="space-y-2 mb-4">
          <SenderOption
            checked={senderMode === 'anonymous'}
            onClick={() => setSenderMode('anonymous')}
            title="익명으로 보내기"
            sub="작성자 정보가 받는 사람에게 공개되지 않아요."
            disabled={previewMode}
          />
          <SenderOption
            checked={senderMode === 'name'}
            onClick={() => setSenderMode('name')}
            title="이름 적기"
            sub="이름을 비워두면 익명으로 전달돼요."
            disabled={previewMode}
          />
          {senderMode === 'name' && (
            <input
              className="px-input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="받는 사람에게 보일 이름"
              maxLength={NAME_MAX}
              disabled={previewMode}
            />
          )}
          <SenderOption
            checked={senderMode === 'user'}
            onClick={() => {
              if (!currentUser?.username) {
                navigate('/login?next=' + encodeURIComponent(location.pathname))
                return
              }
              if (isOwnLink) return
              setSenderMode('user')
            }}
            title={
              currentUser?.username
                ? isOwnLink
                  ? '내 계정 (본인 편지함이라 불가)'
                  : `내 계정으로 보내기 — @${currentUser.username}`
                : '내 계정으로 보내기 (로그인 필요)'
            }
            sub={
              isOwnLink
                ? '본인 편지함에 본인 계정으로는 보낼 수 없어요.'
                : currentUser?.username
                ? '받는 사람에게 @' + currentUser.username + ' 으로 표시돼요.'
                : '로그인하면 내 아이디로 표시돼요.'
            }
            disabled={previewMode || isOwnLink}
          />
        </div>

        {error && (
          <div className="text-[12px] text-center mb-3" style={{ color: '#b0413e' }}>
            {error}
          </div>
        )}

        <PixelButton variant="deep" onClick={submit} disabled={previewMode}>
          ♥ 편지 보내기
        </PixelButton>

        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
          익명으로 보낸 편지는 작성자 정보가 받는 사람에게 공개되지 않아요.
        </p>
      </PixelWindow>

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

function SenderOption({ checked, onClick, title, sub, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-checked={checked}
      className="px-option"
    >
      <span aria-hidden className="px-dot" />
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-bold" style={{ color: 'var(--px-text)' }}>
          {title}
        </span>
        {sub && (
          <span className="block text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--px-deep)' }}>
            {sub}
          </span>
        )}
      </span>
    </button>
  )
}
