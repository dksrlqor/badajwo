import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth, hasGoogleClientId } from '../context/AuthContext'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelCat from '../components/pixel/PixelCat'

// 받아줘 — Google 로그인. 로그인 후 username 있으면 /me, 없으면 /onboarding.
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithGoogleCredential } = useAuth()
  const [error, setError] = useState('')
  const hasClient = hasGoogleClientId()

  const next = new URLSearchParams(location.search).get('next') || ''

  const afterLogin = (user) => {
    if (next) navigate(next)
    else if (!user.username) navigate('/onboarding')
    else navigate('/me')
  }

  const onCredential = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('구글 로그인 응답이 비어있어요.')
      return
    }
    setError('')
    const res = await signInWithGoogleCredential(credentialResponse.credential)
    if (!res.ok) {
      setError(res.reason || '로그인에 실패했어요.')
      return
    }
    afterLogin(res.user)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <div className="flex items-center mb-4">
        <button onClick={() => navigate('/')} className="px-btn px-btn-ghost px-btn-sm" style={{ width: 'auto' }}>
          ← 뒤로
        </button>
      </div>

      <PixelWindow title="♡ 내 편지함 열기 ♡">
        <div className="flex flex-col items-center text-center">
          <PixelCat state="heart-sit" px={5} />
          <p className="mt-3 text-[12px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
            Google 로 한 번만 로그인하면
            <br />내 편지함 링크가 만들어져요.
            <br />
            <span style={{ color: 'var(--px-text)' }}>
              편지를 쓰는 건 로그인 없이도 할 수 있어요.
            </span>
          </p>

          <hr className="px-hr w-full" />

          {hasClient ? (
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={onCredential}
                onError={() => setError('구글 로그인이 취소되었거나 실패했어요.')}
                text="signin_with"
                shape="rectangular"
                size="large"
                theme="outline"
                locale="ko"
              />
            </div>
          ) : (
            <div
              className="text-[12px] leading-relaxed p-3 w-full text-left"
              style={{
                background: 'var(--px-surface)',
                border: '2px solid var(--px-border)',
                color: 'var(--px-text)'
              }}
            >
              <b>Google OAuth client_id 미설정</b>
              <br />
              <code className="text-[11px]">.env.local</code> 에{' '}
              <code className="text-[11px]">VITE_GOOGLE_CLIENT_ID</code> 를 채워주세요.
            </div>
          )}

          {error && (
            <div className="text-[12px] mt-4" style={{ color: '#b0413e' }}>
              {error}
            </div>
          )}
        </div>
      </PixelWindow>

      <p className="mt-5 text-[11px] text-center leading-relaxed" style={{ color: 'var(--px-deep)' }}>
        로그인하면 Google 계정 식별값, 이메일, 이름, 프로필 사진을 받아 받아줘 계정을
        만들어요.
        <br />
        <Link to="/privacy" className="underline" style={{ color: 'var(--px-text)', textUnderlineOffset: 3 }}>
          개인정보 처리방침
        </Link>
      </p>
    </motion.div>
  )
}
