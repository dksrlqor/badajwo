import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getUserByUsername,
  saveLetter
} from '../utils/storage'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import { OrnamentLine } from '../components/VintageMail'
import ProfileAvatar from '../components/ProfileAvatar'

const BODY_MAX = 1600
const NAME_MAX = 20

// /u/:username
// URL 의 username 으로 receiver 를 조회. 받는 사람은 절대 currentUser 로 바뀌면 안 됨.
export default function UserWrite({ readOnly = false } = {}) {
  const { username } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: currentUser } = useAuth()

  // 받는 사람 = URL username 조회 결과. 절대 currentUser 가 아님.
  const receiver = useMemo(() => getUserByUsername(username), [username])

  const [body, setBody] = useState('')
  // 작성자 mode — anonymous (기본) | name | user (로그인 사용자 본인일 때만)
  const [senderMode, setSenderMode] = useState('anonymous')
  const [senderName, setSenderName] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', show: false })
  const [sent, setSent] = useState(null) // letter | null

  // 본인이 자기 링크를 미리 보러 온 경우 → 안내 + 'user' 모드 비활성화
  const isOwnLink =
    currentUser && receiver && currentUser.id === receiver.id

  // ── receiver 가 없으면 안내 ─────────────────────────────
  if (!receiver) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-12 text-center"
      >
        <div className="text-5xl mb-4">📭</div>
        <h1
          className="text-[18px] font-bold mb-2"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          앗, 이 편지함을 찾을 수 없어요.
        </h1>
        <p className="text-[12px] mb-8 px-4" style={{ color: '#86705E' }}>
          다시 한 번 아이디를 확인해주세요.
          <br />
          <span style={{ color: '#B3987B' }}>/u/{username}</span>
        </p>
        <MotionButton variant="soft" onClick={() => navigate('/write')}>
          다른 아이디로 찾아보기
        </MotionButton>
      </motion.div>
    )
  }

  // ── 본인이 자기 링크 + 미리보기 강제 ───────────────────
  // /me 에서 "친구가 보는 화면 미리보기" 를 누르면 ?preview=1 로 들어오게 만들어둠.
  const previewMode = readOnly || new URLSearchParams(location.search).get('preview') === '1'

  // ── 전송 처리 ──────────────────────────────────────────
  const submit = () => {
    if (previewMode) {
      setToast({
        message: '미리보기에서는 편지를 보낼 수 없어요.',
        show: true
      })
      setTimeout(() => setToast({ message: '', show: false }), 1800)
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
    // sender 정보 준비 — receiver 와는 완전히 분리.
    let input = {
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
    const letter = saveLetter(input)
    if (!letter) {
      setError('편지를 보내지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    setSent(letter)
  }

  // ── 전송 후 성공 화면 ──────────────────────────────────
  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pt-8 text-center"
      >
        <div className="text-5xl mb-4">📨</div>
        <h1
          className="text-[20px] font-bold mb-2"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          편지가 조심히 도착했어요.
        </h1>
        <div className="flex justify-center mt-2 mb-3">
          <OrnamentLine width={110} color="#86705E" />
        </div>
        <p
          className="text-[12px] leading-relaxed mb-8"
          style={{ color: '#86705E' }}
        >
          당신의 편지가 <b>@{receiver.username}</b> 님의 편지함에 도착했어요.
          <br />
          {sent.senderMode === 'anonymous'
            ? '익명으로 전달됐어요.'
            : sent.senderMode === 'name'
            ? `이름 "${sent.senderName}" 로 전달됐어요.`
            : `@${sent.senderUsername} 으로 전달됐어요.`}
        </p>

        <div className="space-y-3">
          <MotionButton
            variant="primary"
            onClick={() => {
              setSent(null)
              setBody('')
              setError('')
            }}
          >
            또 한 통 쓰기
          </MotionButton>
          <MotionButton variant="soft" onClick={() => navigate('/')}>
            받아줘 둘러보기
          </MotionButton>
          {!currentUser && (
            <MotionButton variant="ghost" onClick={() => navigate('/login')}>
              내 편지함도 만들기
            </MotionButton>
          )}
        </div>
      </motion.div>
    )
  }

  // ── 작성 화면 ──────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-4"
    >
      {previewMode && (
        <div
          className="mx-1 mb-5 px-3 py-3 text-[12px] leading-relaxed"
          style={{
            background: '#FCF096',
            color: '#3D2E22',
            borderRadius: '4px 6px 5px 7px',
            boxShadow: '0 1px 3px rgba(92,62,40,0.18)',
            transform: 'rotate(-0.6deg)',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          <b>친구가 보게 될 화면 미리보기</b>
          <br />
          미리보기에서는 편지를 보낼 수 없어요. 실제 친구는 공유된 프로필 링크에서
          편지를 작성하게 됩니다.
        </div>
      )}

      {/* 받는 사람 프로필 카드 — receiver 는 절대 currentUser 가 아님 */}
      <ReceiverHeader receiver={receiver} />

      {/* 편지지 — 줄있는 종이 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mx-1 mt-6 mb-5 relative paper-noise"
        style={{
          background: '#FDF8EE',
          padding: '24px 20px 22px',
          borderRadius: '10px 7px 12px 8px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.14)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-orange"
          style={{
            width: 80,
            height: 18,
            top: -9,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        />

        <div
          className="text-[12px] mb-2"
          style={{ color: '#86705E', letterSpacing: '0.18em' }}
        >
          TO. <b style={{ color: '#3D2E22' }}>@{receiver.username}</b> 에게
        </div>
        <textarea
          className="paper-textarea lined-paper w-full min-h-[260px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="오늘 전하고 싶은 말을 적어주세요."
          disabled={previewMode}
          style={{
            background: 'transparent',
            fontSize: 15,
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
            color: '#3D2E22'
          }}
        />
        <div className="text-right text-[11px] mt-1" style={{ color: '#86705E' }}>
          {body.length} / {BODY_MAX}
        </div>
      </motion.div>

      {/* 보내는 사람 선택 */}
      <div className="mx-1 mb-4">
        <div
          className="text-[11px] mb-2"
          style={{ color: '#5A4538', letterSpacing: '0.16em' }}
        >
          FROM.
        </div>

        <div className="space-y-2">
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
              className="paper-input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="받는 사람에게 보일 이름"
              maxLength={NAME_MAX}
              disabled={previewMode}
              style={{ fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}
            />
          )}
          <SenderOption
            checked={senderMode === 'user'}
            onClick={() => {
              if (!currentUser?.username) {
                navigate(
                  '/login?next=' + encodeURIComponent(location.pathname)
                )
                return
              }
              if (isOwnLink) return
              setSenderMode('user')
            }}
            title={
              currentUser?.username
                ? isOwnLink
                  ? '내 계정 (본인 편지함이라 불가)'
                  : `내 Google 계정으로 보내기 — @${currentUser.username}`
                : '내 Google 계정으로 보내기 (로그인 필요)'
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
      </div>

      {/* 안내 */}
      <div
        className="text-[11px] leading-relaxed mx-2 mb-5"
        style={{ color: '#86705E' }}
      >
        익명으로 보낸 편지는 작성자 정보가 받는 사람에게 공개되지 않아요. 자세한 내용은{' '}
        <button
          onClick={() => navigate('/privacy')}
          className="underline"
          style={{ color: '#5A4538', textUnderlineOffset: 3 }}
        >
          개인정보 처리방침
        </button>{' '}
        에서.
      </div>

      {error && (
        <div className="text-[12px] text-center mb-3" style={{ color: '#C7443E' }}>
          {error}
        </div>
      )}

      <MotionButton variant="primary" onClick={submit} disabled={previewMode}>
        편지 보내기
      </MotionButton>

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

// ── 받는 사람 프로필 헤더 — 받는 사람이 누구인지 분명히 보여준다 ──
function ReceiverHeader({ receiver }) {
  return (
    <div
      className="paper-noise relative mx-1 px-5 py-5 flex items-center gap-4"
      style={{
        background: '#FBF0DC',
        borderRadius: '8px 6px 10px 7px',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 8px 22px rgba(92,62,40,0.10)',
        transform: 'rotate(-0.4deg)'
      }}
    >
      <div
        aria-hidden
        className="masking-tape tape-sage"
        style={{
          width: 64,
          height: 14,
          top: -7,
          left: 30,
          transform: 'rotate(-10deg)'
        }}
      />
      <ProfileAvatar user={receiver} size={56} />
      <div className="flex-1 min-w-0">
        <div className="text-[11px]" style={{ color: '#86705E' }}>
          이 편지함의 주인
        </div>
        <div
          className="text-[18px] font-bold truncate"
          style={{
            color: '#3D2E22',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic'
          }}
        >
          @{receiver.username}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: '#5A4538' }}>
          이 편지는 <b>@{receiver.username}</b> 님의 받은 편지함으로 도착해요.
        </div>
      </div>
    </div>
  )
}

function SenderOption({ checked, onClick, title, sub, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full text-left flex items-start gap-3 px-3 py-2.5 transition"
      style={{
        background: checked ? '#FBF0DC' : 'transparent',
        border: `1.5px ${checked ? 'solid' : 'dashed'} rgba(92,62,40,${checked ? 0.42 : 0.22})`,
        borderRadius: '5px 7px 4px 6px',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      <span
        aria-hidden
        className="mt-1 inline-block flex-shrink-0"
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: checked ? '#3D2E22' : 'transparent',
          border: '1.5px solid #3D2E22',
          boxShadow: checked
            ? 'inset 0 0 0 2px #FDF8EE'
            : undefined
        }}
      />
      <span className="flex-1 min-w-0">
        <span
          className="block text-[13px] font-semibold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          {title}
        </span>
        {sub && (
          <span
            className="block text-[11px] mt-0.5 leading-relaxed"
            style={{ color: '#86705E' }}
          >
            {sub}
          </span>
        )}
      </span>
    </button>
  )
}
