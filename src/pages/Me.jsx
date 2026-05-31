import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listInboxFor, listArchiveFor, listPublicFor, presentSender } from '../utils/storage'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import ProfileAvatar from '../components/ProfileAvatar'
import { OrnamentLine, PaperStamp } from '../components/VintageMail'
import { buildStoryImage, shareToInstagramStory } from '../utils/storyImage'

function InstagramGlyph({ size = 18, color = '#3D2E22' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
    </svg>
  )
}

const TABS = [
  { key: 'inbox', label: '받은 편지' },
  { key: 'public', label: '공개' },
  { key: 'archive', label: '보관함' }
]

export default function Me() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState('inbox')
  const [toast, setToast] = useState({ message: '', show: false })
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
    else if (!user.username) navigate('/onboarding', { replace: true })
  }, [user, navigate])

  const link = useMemo(
    () => (user?.username ? `${window.location.origin}/u/${user.username}` : ''),
    [user?.username]
  )

  const inbox = useMemo(() => (user ? listInboxFor(user.id) : []), [user])
  const archive = useMemo(() => (user ? listArchiveFor(user.id) : []), [user])
  const publicLetters = useMemo(() => (user ? listPublicFor(user.id) : []), [user])

  const showToast = (message) => {
    setToast({ message, show: true })
    setTimeout(() => setToast({ message: '', show: false }), 2200)
  }

  const copyLink = async () => {
    if (!link) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link)
      } else {
        const t = document.createElement('textarea')
        t.value = link
        t.style.position = 'fixed'
        t.style.opacity = '0'
        document.body.appendChild(t)
        t.focus()
        t.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(t)
        if (!ok) throw new Error('copy failed')
      }
      showToast('내 편지함 링크가 복사되었어요.')
    } catch {
      showToast('복사에 실패했어요. 직접 선택해주세요.')
    }
  }

  const share = async () => {
    if (sharing || !user?.username) return
    setSharing(true)
    try {
      const blob = await buildStoryImage({
        type: 'ask',
        receiverName: '@' + user.username,
        url: link
      })
      const res = await shareToInstagramStory({
        blob,
        url: link,
        fileName: `badajwo-${user.username}.png`
      })
      if (res.aborted) {
        // ignore
      } else if (res.method === 'webshare') {
        showToast('공유 시트에서 인스타그램 → 스토리에 추가를 선택하세요.')
      } else {
        showToast('이미지를 저장했어요. 인스타에서 스토리에 추가하세요.')
      }
    } catch {
      showToast('이미지 만들기에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setSharing(false)
    }
  }

  if (!user || !user.username) return null

  const tabData =
    tab === 'inbox' ? inbox : tab === 'public' ? publicLetters : archive

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-4"
    >
      {/* 프로필 카드 */}
      <div
        className="paper-noise relative mx-1 mb-5 px-5 py-5"
        style={{
          background: '#FDF8EE',
          borderRadius: '10px 7px 12px 8px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.14)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-kraft"
          style={{
            width: 90,
            height: 18,
            top: -9,
            left: 24,
            transform: 'rotate(-6deg)'
          }}
        />

        <div className="flex items-center gap-4">
          <ProfileAvatar user={user} size={64} />
          <div className="flex-1 min-w-0">
            <div
              className="text-[18px] font-bold truncate"
              style={{
                color: '#3D2E22',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic'
              }}
            >
              @{user.username}
            </div>
            <div
              className="text-[11px] mt-0.5 truncate"
              style={{ color: '#86705E' }}
            >
              {user.displayName || '받아줘 사용자'}
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-[11px] px-2 py-1"
            style={{
              color: '#86705E',
              textDecoration: 'underline dashed rgba(92,62,40,0.32)',
              textUnderlineOffset: 3
            }}
          >
            로그아웃
          </button>
        </div>

        {/* 내 편지함 링크 */}
        <div className="mt-5">
          <div
            className="text-[10px] mb-1"
            style={{ color: '#86705E', letterSpacing: '0.18em' }}
          >
            내 편지함 링크
          </div>
          <div
            className="text-[13px] break-all select-all"
            style={{
              color: '#3D2E22',
              fontFamily: 'Georgia, serif',
              borderBottom: '1px dashed rgba(92,62,40,0.32)',
              paddingBottom: 6
            }}
          >
            {link}
          </div>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#86705E' }}>
            이 링크를 인스타 스토리나 프로필에 올리면 사람들이 나에게 편지를 보낼 수 있어요.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <MotionButton variant="accent" onClick={share} disabled={sharing}>
            <span className="inline-flex items-center gap-2">
              <InstagramGlyph size={18} />
              {sharing ? '스토리 이미지 만드는 중…' : '인스타 스토리에 공유'}
            </span>
          </MotionButton>
          <MotionButton variant="primary" onClick={copyLink}>
            링크 복사
          </MotionButton>
          <MotionButton
            variant="ghost"
            onClick={() => navigate(`/u/${user.username}?preview=1`)}
          >
            친구가 보는 화면 미리보기
          </MotionButton>
        </div>
      </div>

      {/* 받은 편지 / 공개 / 보관함 탭 */}
      <div
        className="flex gap-2 mx-1 mb-3"
        role="tablist"
        aria-label="편지함 탭"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className="paper-tab text-[12px]"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '8px 12px',
              background: tab === t.key ? '#FBF0DC' : '#FDF8EE',
              fontWeight: tab === t.key ? 700 : 500
            }}
          >
            {t.label}
            {(t.key === 'inbox' ? inbox : t.key === 'public' ? publicLetters : archive).length > 0 && (
              <span className="ml-1" style={{ color: '#86705E' }}>
                · {(t.key === 'inbox' ? inbox : t.key === 'public' ? publicLetters : archive).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 편지 목록 */}
      {tabData.length === 0 ? (
        <div
          className="mx-1 mt-2 mb-4 px-4 py-8 text-center text-[12px]"
          style={{
            color: '#86705E',
            background: 'rgba(255, 252, 245, 0.5)',
            border: '1px dashed rgba(92,62,40,0.18)',
            borderRadius: '6px 8px 7px 5px'
          }}
        >
          {tab === 'inbox' &&
            '아직 도착한 편지가 없어요.\n내 편지함 링크를 친구들에게 공유해보세요.'}
          {tab === 'public' && '아직 공개한 편지가 없어요.'}
          {tab === 'archive' && '보관함이 비어 있어요.'}
        </div>
      ) : (
        <ul className="mx-1 space-y-2.5 mb-6">
          {tabData.map((l) => (
            <LetterListItem
              key={l.id}
              letter={l}
              onClick={() => navigate('/letter/' + l.id)}
            />
          ))}
        </ul>
      )}

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

function LetterListItem({ letter, onClick }) {
  const sender = presentSender(letter)
  const preview = (letter.content || '').slice(0, 80)
  const date = new Date(letter.createdAt)
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left px-4 py-3 transition"
        style={{
          background: '#FDF8EE',
          border: '1px solid rgba(92,62,40,0.14)',
          borderRadius: '6px 8px 7px 5px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.55) inset, 0 1px 2px rgba(92,62,40,0.08)'
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-[13px] font-semibold truncate"
            style={{
              color: '#3D2E22',
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
            }}
          >
            {sender.label}
          </span>
          <span className="text-[10px]" style={{ color: '#86705E' }}>
            {m}.{d}
          </span>
        </div>
        <div
          className="text-[12px] mt-1 leading-relaxed line-clamp-2"
          style={{ color: '#5A4538' }}
        >
          {preview}
          {letter.content.length > 80 && '…'}
        </div>
        {(letter.isPublic || letter.isArchived) && (
          <div className="mt-1.5 text-[10px]" style={{ color: '#86705E' }}>
            {letter.isPublic && <span className="mr-2">· 공개됨</span>}
            {letter.isArchived && <span>· 보관됨</span>}
          </div>
        )}
      </button>
    </li>
  )
}
