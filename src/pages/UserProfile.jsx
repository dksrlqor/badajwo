import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getPublicProfile, normalizeUsername } from '../utils/storage'
import ProfileAvatar from '../components/ProfileAvatar'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'

// /u/:username — 공개 편지함 입구.
// 규칙(절대 불변): URL 의 username 이 곧 receiver. 로그인 사용자와 무관.
// /me 의 미리보기는 ?preview=1.
//
// 조회 상태를 loading/found/notfound/error 로 분리한다 — 예전엔 동기 조회라
// 데이터가 도착하기 전에 곧장 "편지함 없음" 을 띄웠고, Supabase 전환 후엔 그게
// 반드시 깜빡임/오진단을 만든다.
export default function UserProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const display = normalizeUsername(username)
  const [status, setStatus] = useState('loading') // loading | found | notfound | error
  const [receiver, setReceiver] = useState(null)

  const previewMode =
    new URLSearchParams(location.search).get('preview') === '1'

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setReceiver(null)
    getPublicProfile(username)
      .then((r) => {
        if (cancelled) return
        if (r) {
          setReceiver(r)
          setStatus('found')
        } else {
          setStatus('notfound')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [username])

  if (status === 'loading') {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="wait" px={6} />
            <p className="mt-4 text-[13px]" style={{ color: 'var(--px-deep)' }}>
              편지함을 불러오는 중...
            </p>
          </div>
        </PixelWindow>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
              잠시 연결이 어려워요.
            </h1>
            <p className="mt-1 mb-5 text-[12px]" style={{ color: 'var(--px-deep)' }}>
              네트워크 상태를 확인하고 다시 시도해주세요.
            </p>
            <PixelButton variant="deep" onClick={() => window.location.reload()}>
              다시 시도
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
    )
  }

  if (status === 'notfound' || !receiver) {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ 받아줘 ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
              이 편지함을 찾을 수 없어요.
            </h1>
            <p className="mt-1 mb-5 text-[12px]" style={{ color: 'var(--px-deep)' }}>
              아이디를 다시 확인해주세요. /u/{display}
            </p>
            <PixelButton variant="cream" onClick={() => navigate('/write/id')}>
              다른 아이디로 찾아보기
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
    )
  }

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

      <PixelWindow title="♡ LOVE MAIL ♡">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <ProfileAvatar user={receiver} size={84} />
          </div>
          <div className="mt-3 text-[19px] font-bold" style={{ color: 'var(--px-text)' }}>
            @{receiver.username}
          </div>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
            이 편지함의 주인이에요.
            <br />
            보내는 편지는 모두 @{receiver.username} 님의
            <br />
            받은 편지함에 도착해요.
          </p>

          <div className="my-4">
            <PixelCat state="heart-sit" px={5} />
          </div>

          {previewMode ? (
            <PixelButton variant="deep" disabled>
              편지 쓰기 (미리보기에서는 비활성)
            </PixelButton>
          ) : (
            <PixelButton
              variant="deep"
              onClick={() => navigate(`/u/${receiver.username}/write`)}
            >
              ♥ 편지 쓰기
            </PixelButton>
          )}
        </div>
      </PixelWindow>

      <p className="mt-4 text-[11px] leading-relaxed text-center" style={{ color: 'var(--px-deep)' }}>
        로그인하지 않아도 편지를 보낼 수 있어요. 익명 편지는 작성자 정보가 공개되지 않아요.
        <br />
        <Link
          to="/privacy"
          className="underline"
          style={{ color: 'var(--px-text)', textUnderlineOffset: 3 }}
        >
          개인정보 처리방침
        </Link>
      </p>
    </motion.div>
  )
}
