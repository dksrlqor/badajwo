import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import { OrnamentLine } from '../components/VintageMail'
import {
  validateUsername,
  isUsernameAvailable,
  suggestRandomUsername,
  PLACEHOLDER_USERNAMES
} from '../utils/storage'

// 받아줘 — 첫 로그인 후 username 정하기.
// 핵심: placeholder / 추천 / 예시 어디에도 user.displayName / email / googleSub 가 새지 않는다.
// 모든 예시는 PLACEHOLDER_USERNAMES + suggestRandomUsername() 만 사용.
export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setUsername, status, signOut } = useAuth()
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const [available, setAvailable] = useState(null) // null|true|false
  const [toast, setToast] = useState({ message: '', show: false })
  // placeholder 는 입력하지 않은 동안 회전. 절대 사용자 정보 미참조.
  const [placeholderIdx, setPlaceholderIdx] = useState(() =>
    Math.floor(Math.random() * PLACEHOLDER_USERNAMES.length)
  )

  useEffect(() => {
    if (status === 'guest') navigate('/login', { replace: true })
    if (status === 'authed') navigate('/me', { replace: true })
  }, [status, navigate])

  useEffect(() => {
    if (raw) return
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_USERNAMES.length)
    }, 2200)
    return () => clearInterval(t)
  }, [raw])

  useEffect(() => {
    setError('')
    const v = validateUsername(raw)
    if (!v.ok || !raw) {
      setAvailable(null)
      return
    }
    setAvailable(isUsernameAvailable(v.normalized))
  }, [raw])

  const placeholder = PLACEHOLDER_USERNAMES[placeholderIdx]

  // 미리보기에 표시할 username — validated 가 아니어도 raw 그대로 보여주되 lowercase 만 적용.
  const previewName = useMemo(() => {
    if (!raw) return '아이디'
    const v = validateUsername(raw)
    return v.ok ? v.normalized : raw.toLowerCase()
  }, [raw])

  const onSubmit = () => {
    const v = validateUsername(raw)
    if (!v.ok) {
      setError(v.reason)
      return
    }
    const res = setUsername(v.normalized)
    if (!res.ok) {
      setError(res.reason || '아이디를 만들지 못했어요.')
      return
    }
    setToast({ message: `@${v.normalized} 으로 시작할게요.`, show: true })
    setTimeout(() => {
      setToast({ message: '', show: false })
      navigate('/me', { replace: true })
    }, 900)
  }

  const onSuggest = () => {
    // 사용자 정보 0 — 순수 단어 조합으로만 생성
    const s = suggestRandomUsername()
    setRaw(s)
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-6"
    >
      <div className="text-center mb-6">
        <h1
          className="text-[22px] font-bold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          나만의 편지 주소를 만들어주세요
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={120} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          이 아이디는 사람들이 당신에게 편지를 보낼 때 사용하는 주소가 돼요.
          <br />
          주소 예시: takemyletter.site/u/
          <AnimatePresence mode="wait">
            <motion.b
              key={previewName}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
              style={{ color: '#3D2E22', display: 'inline-block' }}
            >
              {previewName}
            </motion.b>
          </AnimatePresence>
        </p>
      </div>

      {/* 종이 카드 — 입력 + 추천 */}
      <div
        className="paper-noise relative mx-1 mb-5"
        style={{
          background: '#FDF8EE',
          padding: '28px 22px 24px',
          borderRadius: '8px 6px 10px 7px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.12)',
          transform: 'rotate(-0.5deg)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-sage"
          style={{
            width: 90,
            height: 18,
            top: -9,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        />

        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[24px] font-bold"
            style={{ color: '#86705E', fontFamily: 'Georgia, serif' }}
          >
            @
          </span>
          <input
            className="paper-input flex-1"
            value={raw}
            onChange={(e) => setRaw(e.target.value.toLowerCase())}
            placeholder={`예: ${placeholder}`}
            maxLength={20}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="text"
            style={{ fontSize: 22, fontFamily: 'Georgia, serif' }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 gap-2">
          <p className="text-[11px] leading-relaxed" style={{ color: '#86705E' }}>
            영어 소문자와 숫자만 / 3~20자 / 중복 불가
          </p>
          <button
            type="button"
            onClick={onSuggest}
            className="paper-tab text-[11px]"
            style={{ padding: '6px 10px' }}
          >
            🎲 추천 받기
          </button>
        </div>

        <AnimatePresence>
          {raw && available === true && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] mt-2"
              style={{ color: '#7A9272' }}
            >
              ✓ 사용 가능한 아이디예요.
            </motion.p>
          )}
          {raw && available === false && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] mt-2"
              style={{ color: '#C7443E' }}
            >
              이미 사용 중인 아이디예요.
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] mt-2"
              style={{ color: '#C7443E' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <MotionButton
          variant="primary"
          onClick={onSubmit}
          disabled={!raw || available === false}
        >
          아이디 만들기
        </MotionButton>
        <MotionButton variant="ghost" onClick={signOut}>
          로그아웃
        </MotionButton>
      </div>

      <p
        className="text-[11px] text-center mt-6 leading-relaxed"
        style={{ color: '#86705E' }}
      >
        예시는 무작위로 생성된 단어이며 당신의 Google 이름·이메일과 무관해요.
      </p>

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}
