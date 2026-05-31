import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth, hasGoogleClientId } from '../context/AuthContext'
import { OrnamentLine } from '../components/VintageMail'
import Toast from '../components/Toast'

// 받아줘 — Google 로그인.
// 로그인 후 username 있으면 /me, 없으면 /onboarding 이동.
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithGoogleCredential, signInMock } = useAuth()
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', show: false })
  const [devKey, setDevKey] = useState('')
  const hasClient = hasGoogleClientId()

  const next = new URLSearchParams(location.search).get('next') || ''

  const afterLogin = (user) => {
    if (next) navigate(next)
    else if (!user.username) navigate('/onboarding')
    else navigate('/me')
  }

  const onCredential = (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('구글 로그인 응답이 비어있어요.')
      return
    }
    const res = signInWithGoogleCredential(credentialResponse.credential)
    if (!res.ok) {
      setError(res.reason || '로그인에 실패했어요.')
      return
    }
    afterLogin(res.user)
  }

  const onMockLogin = () => {
    const k = devKey.trim().toLowerCase()
    if (!k) {
      setError('테스트용 키를 적어주세요.')
      return
    }
    const res = signInMock(k, k)
    if (!res.ok) {
      setError(res.reason || '테스트 로그인에 실패했어요.')
      return
    }
    setToast({ message: '테스트 계정으로 들어왔어요.', show: true })
    setTimeout(() => setToast({ message: '', show: false }), 1500)
    afterLogin(res.user)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-6"
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
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

      <div className="text-center mb-6">
        <h1
          className="text-[22px] font-bold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          내 편지함을 열려면
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={120} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          Google 로 한 번만 로그인하면
          <br />내 편지함 링크가 만들어져요.
        </p>
      </div>

      <div
        className="paper-noise relative mx-1 mb-5"
        style={{
          background: '#FDF8EE',
          padding: '28px 22px 24px',
          borderRadius: '8px 6px 10px 7px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.12)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-blue"
          style={{
            width: 88,
            height: 18,
            top: -9,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        />

        <p className="text-[12px] text-center leading-relaxed mb-5" style={{ color: '#5A4538' }}>
          편지를 쓰는 것은 로그인 없이도 할 수 있어요.
          <br />
          <span style={{ color: '#86705E' }}>로그인은 내 편지함을 만들 때만 필요해요.</span>
        </p>

        {hasClient ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onCredential}
              onError={() => setError('구글 로그인이 취소되었거나 실패했어요.')}
              text="signin_with"
              shape="pill"
              size="large"
              theme="outline"
              locale="ko"
            />
          </div>
        ) : (
          <div
            className="text-[12px] leading-relaxed p-3 rounded"
            style={{
              background: 'rgba(255, 252, 245, 0.7)',
              border: '1px dashed rgba(92, 62, 40, 0.25)',
              color: '#86705E'
            }}
          >
            <b style={{ color: '#3D2E22' }}>Google OAuth client_id 미설정</b>
            <br />
            <code className="text-[11px]">.env.local</code> 에{' '}
            <code className="text-[11px]">VITE_GOOGLE_CLIENT_ID</code> 를 채워주세요.
            <br />
            자세한 방법은 <code className="text-[11px]">.env.example</code> 참고.
          </div>
        )}

        {error && (
          <div
            className="text-[12px] text-center mt-4"
            style={{ color: '#C7443E' }}
          >
            {error}
          </div>
        )}
      </div>

      <details
        className="mx-1 text-[11px] mb-5"
        style={{ color: '#86705E' }}
      >
        <summary className="cursor-pointer select-none">
          OAuth client_id 가 아직 없을 때 → 테스트 모드로 들어가기
        </summary>
        <div
          className="mt-3 p-3 rounded"
          style={{
            background: 'rgba(255, 252, 245, 0.6)',
            border: '1px dashed rgba(92, 62, 40, 0.18)'
          }}
        >
          <p className="mb-2">
            아래에 임의의 키 (예: <b>gibaek</b>) 를 적고 로그인하면 그 키 기준으로 가짜
            계정이 만들어져요. 로컬 개발 / 친구 미리보기 용도로만.
          </p>
          <div className="flex gap-2">
            <input
              className="paper-input flex-1"
              value={devKey}
              onChange={(e) => setDevKey(e.target.value)}
              placeholder="예: gibaek"
              maxLength={20}
            />
            <button
              onClick={onMockLogin}
              className="stationery-button"
              style={{ padding: '8px 14px', fontSize: 12 }}
            >
              테스트 로그인
            </button>
          </div>
        </div>
      </details>

      <p
        className="text-[11px] text-center leading-relaxed"
        style={{ color: '#86705E' }}
      >
        로그인하면 Google 계정 식별값, 이메일, 이름, 프로필 사진을 받아 받아줘 계정을
        만들어요.
        <br />
        자세한 내용은{' '}
        <Link
          to="/privacy"
          className="underline"
          style={{ color: '#5A4538', textUnderlineOffset: 3 }}
        >
          개인정보 처리방침
        </Link>{' '}
        에서 확인할 수 있어요.
      </p>

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}
