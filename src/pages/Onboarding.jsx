import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'
import {
  validateUsername,
  isUsernameAvailable,
  suggestRandomUsername,
  PLACEHOLDER_USERNAMES
} from '../utils/storage'

// 첫 로그인 후 username 정하기.
// 핵심 불변: placeholder/추천/예시 어디에도 사용자 개인정보(displayName/email)가 새지 않는다.
export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setUsername, status, signOut } = useAuth()
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const [available, setAvailable] = useState(null)
  const [toast, setToast] = useState({ message: '', show: false })
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
    setToast({ message: `@${v.normalized} 으로 시작할게요 ♡`, show: true })
    setTimeout(() => {
      setToast({ message: '', show: false })
      navigate('/me', { replace: true })
    }, 900)
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <PixelWindow title="♡ 내 편지 주소 만들기 ♡">
        <div className="flex justify-center mb-3">
          <PixelCat state="idle" px={5} />
        </div>
        <p className="text-[12px] text-center leading-relaxed mb-4" style={{ color: 'var(--px-deep)' }}>
          이 아이디는 사람들이 당신에게
          <br />
          편지를 보낼 때 쓰는 주소가 돼요.
          <br />
          <span style={{ color: 'var(--px-text)' }}>
            takemyletter.site/u/<b>{previewName}</b>
          </span>
        </p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[20px] font-bold" style={{ color: 'var(--px-deep)' }}>
            @
          </span>
          <input
            className="px-input flex-1"
            value={raw}
            onChange={(e) => setRaw(e.target.value.toLowerCase())}
            placeholder={`예: ${placeholder}`}
            maxLength={20}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[11px]" style={{ color: 'var(--px-deep)' }}>
            영어 소문자·숫자 / 3~20자 / 중복 불가
          </p>
          <PixelButton variant="cream" size="sm" onClick={() => setRaw(suggestRandomUsername())}>
            🎲 추천
          </PixelButton>
        </div>

        {raw && available === true && (
          <p className="text-[11px] mb-2" style={{ color: '#5f8a5f' }}>
            ✓ 사용 가능한 아이디예요.
          </p>
        )}
        {raw && available === false && (
          <p className="text-[11px] mb-2" style={{ color: '#b0413e' }}>
            이미 사용 중인 아이디예요.
          </p>
        )}
        {error && (
          <p className="text-[11px] mb-2" style={{ color: '#b0413e' }}>
            {error}
          </p>
        )}

        <div className="space-y-3 mt-3">
          <PixelButton variant="deep" onClick={onSubmit} disabled={!raw || available === false}>
            ♥ 아이디 만들기
          </PixelButton>
          <PixelButton variant="ghost" onClick={signOut}>
            로그아웃
          </PixelButton>
        </div>

        <p className="mt-3 text-[10px] text-center leading-relaxed" style={{ color: 'var(--px-deep)' }}>
          예시는 무작위 단어이며 당신의 Google 이름·이메일과 무관해요.
        </p>
      </PixelWindow>

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}
