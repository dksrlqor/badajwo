import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAdminStats } from '../utils/storage'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'

// /admin — 관리자 통계. 로그인한 관리자(profiles.is_admin) 계정에서만 숫자가 보인다.
// 권한은 서버(get_admin_stats RPC)가 inbox_token 으로 판단한다.
export default function Admin() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | ready | forbidden | error
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // 개발 전용 데모 — 프로덕션 빌드(import.meta.env.DEV=false)에선 절대 노출되지 않음.
    if (import.meta.env.DEV && searchParams.get('demo') === '1') {
      setStats({ signups: 128, named: 97, inboxLetters: 342, simpleLetters: 86 })
      setStatus('ready')
      return
    }
    if (!user) {
      setStatus('forbidden')
      return
    }
    let cancelled = false
    setStatus('loading')
    getAdminStats(user)
      .then((s) => {
        if (cancelled) return
        if (s) {
          setStats(s)
          setStatus('ready')
        } else {
          setStatus('forbidden')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [user, searchParams])

  if (status === 'loading') {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ ADMIN ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="wait" px={6} />
            <p className="mt-4 text-[13px]" style={{ color: 'var(--px-deep)' }}>
              통계를 불러오는 중...
            </p>
          </div>
        </PixelWindow>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ ADMIN ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
              통계를 불러오지 못했어요.
            </h1>
            <p className="mt-1 mb-5 text-[12px]" style={{ color: 'var(--px-deep)' }}>
              admin_stats.sql 적용 여부와 네트워크를 확인해주세요.
            </p>
            <PixelButton variant="deep" onClick={() => window.location.reload()}>
              다시 시도
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
    )
  }

  if (status === 'forbidden') {
    return (
      <div className="pt-12 text-center">
        <PixelWindow title="♡ ADMIN ♡">
          <div className="flex flex-col items-center py-4">
            <PixelCat state="tilt" px={6} animate={false} />
            <h1 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
              관리자만 볼 수 있어요.
            </h1>
            <p className="mt-1 mb-5 text-[12px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
              관리자 계정으로 로그인했는지 확인해주세요.
            </p>
            <PixelButton variant="cream" onClick={() => navigate('/')}>
              홈으로
            </PixelButton>
          </div>
        </PixelWindow>
      </div>
    )
  }

  const total = (stats?.inboxLetters || 0) + (stats?.simpleLetters || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <PixelWindow title="♡ ADMIN · 통계 ♡">
        <div className="flex items-center gap-3 mb-4">
          <PixelCat state="heart-sit" px={3} />
          <div>
            <div className="text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
              받아줘 현황
            </div>
            <div className="text-[11px]" style={{ color: 'var(--px-deep)' }}>
              지금까지 쌓인 숫자예요
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="누적 가입" value={stats.signups} />
          <StatCard label="아이디 설정 완료" value={stats.named} />
          <StatCard label="받은 편지함 편지" value={stats.inboxLetters} />
          <StatCard label="일회성 편지" value={stats.simpleLetters} />
        </div>

        {/* 총 편지 — 강조 */}
        <div
          className="mt-3 px-4 py-4 text-center"
          style={{
            background: 'var(--px-deep)',
            border: '3px solid var(--px-border)',
            boxShadow: '4px 4px 0 var(--px-shadow)'
          }}
        >
          <div className="text-[11px] font-bold" style={{ color: 'var(--px-cream)' }}>
            지금까지 오간 편지
          </div>
          <div className="text-[30px] font-bold leading-tight" style={{ color: 'var(--px-cream)' }}>
            {total.toLocaleString()}
            <span className="text-[14px]"> 통</span>
          </div>
        </div>

        <div className="mt-5">
          <PixelButton variant="cream" onClick={() => navigate('/me')}>
            내 편지함으로
          </PixelButton>
        </div>
      </PixelWindow>
    </motion.div>
  )
}

function StatCard({ label, value }) {
  return (
    <div
      className="px-3 py-4 text-center"
      style={{
        background: 'var(--px-surface)',
        border: '3px solid var(--px-border)',
        boxShadow: '4px 4px 0 var(--px-shadow)'
      }}
    >
      <div className="text-[26px] font-bold leading-tight" style={{ color: 'var(--px-text)' }}>
        {Number(value || 0).toLocaleString()}
      </div>
      <div className="mt-1 text-[11px]" style={{ color: 'var(--px-deep)' }}>
        {label}
      </div>
    </div>
  )
}
