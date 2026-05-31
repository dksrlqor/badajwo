import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import { OrnamentLine } from '../components/VintageMail'
import { validateUsername, isUsernameAvailable } from '../utils/storage'

// 받아줘 — 첫 로그인 후 username 정하기.
// username 이 정해지면 /me 로 이동.
export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setUsername, status, signOut } = useAuth()
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const [available, setAvailable] = useState(null) // null|true|false
  const [toast, setToast] = useState({ message: '', show: false })

  useEffect(() => {
    if (status === 'guest') navigate('/login', { replace: true })
    if (status === 'authed') navigate('/me', { replace: true })
  }, [status, navigate])

  useEffect(() => {
    setError('')
    const v = validateUsername(raw)
    if (!v.ok || !raw) {
      setAvailable(null)
      return
    }
    setAvailable(isUsernameAvailable(v.normalized))
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
          내 편지함 아이디 정하기
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={120} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          이 아이디는 내 편지함 링크에 쓰여요.
          <br />
          예: takemyletter.site/u/<b>{raw ? validateUsername(raw).normalized || '아이디' : '아이디'}</b>
        </p>
      </div>

      {/* 종이 카드 */}
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
            placeholder="예: gibaek"
            maxLength={20}
            autoFocus
            style={{ fontSize: 22, fontFamily: 'Georgia, serif' }}
          />
        </div>

        <p className="text-[11px] mt-3 leading-relaxed" style={{ color: '#86705E' }}>
          영문 소문자, 숫자, 언더바(_) 만 / 3~20자 / 중복 불가
        </p>

        {raw && available === true && (
          <p className="text-[11px] mt-2" style={{ color: '#7A9272' }}>
            ✓ 쓸 수 있는 아이디예요.
          </p>
        )}
        {raw && available === false && (
          <p className="text-[11px] mt-2" style={{ color: '#C7443E' }}>
            이미 누가 쓰고 있는 아이디예요.
          </p>
        )}
        {error && (
          <p className="text-[11px] mt-2" style={{ color: '#C7443E' }}>
            {error}
          </p>
        )}
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

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}
