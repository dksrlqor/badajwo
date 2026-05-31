import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const handle = async (provider) => {
    if (loading) return
    setLoading(provider)
    setError('')
    try {
      const result = await login(provider)
      if (result.status === 'pending-setup') {
        navigate('/setup', { replace: true })
      } else {
        navigate('/me', { replace: true })
      }
    } catch (e) {
      setError('로그인에 실패했어요. 잠시 후 다시 시도해주세요.')
      setLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-[85vh]"
    >
      <div className="flex items-center mb-2">
        <button
          onClick={() => navigate('/')}
          className="text-ink-700 text-sm px-2 py-1 -ml-2 hover:text-ink-900"
        >
          ← 뒤로
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center pt-4 pb-10">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl mb-6"
        >
          💌
        </motion.div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">받아줘에 로그인</h1>
        <p className="text-sm text-ink-500 leading-relaxed mb-10 px-4">
          내 받은 편지를 어디서든 다시 볼 수 있어요.
          <br />
          편지를 그냥 만들고 보내는 건 로그인 없이도 가능해요.
        </p>

        <div className="w-full space-y-3">
          <ProviderButton
            provider="google"
            onClick={() => handle('google')}
            loading={loading === 'google'}
            disabled={!!loading && loading !== 'google'}
          />
          <ProviderButton
            provider="apple"
            onClick={() => handle('apple')}
            loading={loading === 'apple'}
            disabled={!!loading && loading !== 'apple'}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-accent-pinkDeep mt-4"
          >
            {error}
          </motion.div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-10 text-xs text-ink-500 underline underline-offset-4 hover:text-ink-700"
        >
          로그인 없이 편지 만들기
        </button>
      </div>
    </motion.div>
  )
}

function ProviderButton({ provider, onClick, loading, disabled }) {
  if (provider === 'google') {
    return (
      <motion.button
        whileTap={disabled ? undefined : { scale: 0.96 }}
        whileHover={disabled ? undefined : { y: -1 }}
        onClick={onClick}
        disabled={loading || disabled}
        className="w-full flex items-center justify-center gap-3 bg-white border border-cream-300 rounded-2xl py-4 text-base font-medium text-ink-900 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        <span>{loading ? '로그인 중...' : 'Google로 계속하기'}</span>
      </motion.button>
    )
  }
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { y: -1 }}
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-3 bg-ink-900 rounded-2xl py-4 text-base font-medium text-white shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <AppleIcon />
      <span>{loading ? '로그인 중...' : 'Apple로 계속하기'}</span>
    </motion.button>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.3 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 12.04c0-2.8 2.28-4.13 2.39-4.2-1.31-1.91-3.34-2.17-4.06-2.2-1.72-.17-3.36 1.01-4.23 1.01-.88 0-2.22-.99-3.66-.96-1.88.03-3.62 1.1-4.59 2.78-1.97 3.4-.5 8.43 1.41 11.2.93 1.36 2.04 2.88 3.49 2.83 1.42-.06 1.95-.91 3.66-.91 1.7 0 2.19.91 3.68.88 1.52-.03 2.49-1.39 3.41-2.75 1.08-1.58 1.52-3.11 1.54-3.19-.04-.02-2.95-1.13-2.94-4.49zm-2.78-8.27c.78-.94 1.3-2.25 1.16-3.55-1.12.05-2.47.74-3.27 1.68-.72.83-1.35 2.16-1.18 3.43 1.25.1 2.51-.62 3.29-1.56z" />
    </svg>
  )
}
