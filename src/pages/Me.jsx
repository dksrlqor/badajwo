import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listInbox, presentSender } from '../utils/storage'
import Toast from '../components/Toast'
import ProfileAvatar from '../components/ProfileAvatar'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'
import PixelEnvelope from '../components/pixel/PixelEnvelope'
import { buildStoryImage, shareToInstagramStory } from '../utils/storyImage'

const TABS = [
  { key: 'inbox', label: '받은 편지' },
  { key: 'public', label: '공개' },
  { key: 'archive', label: '보관함' }
]

// /me — My Letter Box 대시보드. 로그인 필요.
export default function Me() {
  const navigate = useNavigate()
  const { user, signOut, deleteAccount } = useAuth()
  const [tab, setTab] = useState('inbox')
  const [toast, setToast] = useState({ message: '', show: false })
  const [sharing, setSharing] = useState(false)
  const [deleteStage, setDeleteStage] = useState('closed')

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
    else if (!user.username) navigate('/onboarding', { replace: true })
  }, [user, navigate])

  const link = useMemo(
    () => (user?.username ? `${window.location.origin}/u/${user.username}` : ''),
    [user?.username]
  )

  const [inbox, setInbox] = useState([])
  const [archive, setArchive] = useState([])
  const [publicLetters, setPublicLetters] = useState([])
  const [lettersLoading, setLettersLoading] = useState(true)

  useEffect(() => {
    if (!user?.username) return
    let cancelled = false
    setLettersLoading(true)
    Promise.all([
      listInbox(user, 'inbox'),
      listInbox(user, 'public'),
      listInbox(user, 'archive')
    ])
      .then(([i, p, a]) => {
        if (cancelled) return
        setInbox(i)
        setPublicLetters(p)
        setArchive(a)
        setLettersLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLettersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id, user?.username])

  const showToast = (message) => {
    setToast({ message, show: true })
    setTimeout(() => setToast({ message: '', show: false }), 2400)
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
      showToast('내 편지함 링크가 복사되었어요 ♡')
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
        // 사용자 취소
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

  const tabData = tab === 'inbox' ? inbox : tab === 'public' ? publicLetters : archive

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <PixelWindow title="♡ MY LETTER BOX ♡">
        {/* 프로필 */}
        <div className="flex items-center gap-3">
          <ProfileAvatar user={user} size={56} />
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-bold truncate" style={{ color: 'var(--px-text)' }}>
              @{user.username}
            </div>
            <div className="text-[11px] truncate" style={{ color: 'var(--px-deep)' }}>
              {user.displayName || '받아줘 사용자'}
            </div>
          </div>
          <PixelCat state="heart-sit" px={3} />
        </div>

        <hr className="px-hr" />

        {/* 내 편지함 링크 */}
        <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--px-deep)' }}>
          내 편지함 링크
        </div>
        <div
          className="text-[12px] break-all select-all px-3 py-2.5 mb-3"
          style={{
            background: 'var(--px-cream)',
            border: '3px solid var(--px-border)',
            boxShadow: 'inset 3px 3px 0 rgba(158,92,100,0.10)',
            color: 'var(--px-text)'
          }}
        >
          {link}
        </div>

        <div className="space-y-2.5">
          <PixelButton variant="deep" onClick={copyLink}>
            ♥ 링크 복사
          </PixelButton>
          <PixelButton onClick={share} disabled={sharing}>
            {sharing ? '스토리 이미지 만드는 중...' : '인스타 스토리에 공유'}
          </PixelButton>
          <PixelButton
            variant="cream"
            onClick={() => navigate(`/u/${user.username}?preview=1`)}
          >
            친구가 보는 화면 미리보기
          </PixelButton>
          <PixelButton variant="ghost" onClick={signOut}>
            로그아웃
          </PixelButton>
        </div>
      </PixelWindow>

      {/* 탭 */}
      <div className="flex gap-2 mt-6 mb-3" role="tablist" aria-label="편지함 탭">
        {TABS.map((t) => {
          const count = (t.key === 'inbox' ? inbox : t.key === 'public' ? publicLetters : archive).length
          const active = tab === t.key
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className="flex-1 px-2 py-2 text-[12px] font-bold"
              style={{
                background: active ? 'var(--px-pink)' : 'var(--px-cream)',
                border: '3px solid var(--px-border)',
                boxShadow: active ? 'inset 3px 3px 0 rgba(158,92,100,0.18)' : '0 3px 0 var(--px-border)',
                color: 'var(--px-text)',
                cursor: 'pointer'
              }}
            >
              {t.label}
              {count > 0 && <span style={{ color: 'var(--px-deep)' }}> {count}</span>}
            </button>
          )
        })}
      </div>

      {/* 편지 목록 — 픽셀 봉투 카드 */}
      {lettersLoading ? (
        <div
          className="px-4 py-8 text-center text-[12px]"
          style={{
            color: 'var(--px-deep)',
            background: 'var(--px-cream)',
            border: '3px dashed var(--px-border)'
          }}
        >
          편지함을 불러오는 중...
        </div>
      ) : tabData.length === 0 ? (
        <div
          className="px-4 py-8 text-center text-[12px] leading-relaxed"
          style={{
            color: 'var(--px-deep)',
            background: 'var(--px-cream)',
            border: '3px dashed var(--px-border)'
          }}
        >
          {tab === 'inbox' && (
            <>
              아직 도착한 편지가 없어요.
              <br />내 편지함 링크를 친구들에게 공유해보세요.
            </>
          )}
          {tab === 'public' && '아직 공개한 편지가 없어요.'}
          {tab === 'archive' && '보관함이 비어 있어요.'}
        </div>
      ) : (
        <ul className="space-y-3 mb-6">
          {tabData.map((l) => (
            <EnvelopeListItem key={l.id} letter={l} onClick={() => navigate('/letter/' + l.id)} />
          ))}
        </ul>
      )}

      {/* 계정 삭제 */}
      <DangerZone
        deleteStage={deleteStage}
        onOpen={() => setDeleteStage('confirming')}
        onCancel={() => setDeleteStage('closed')}
        onConfirm={() => {
          if (deleteStage !== 'confirming') return
          setDeleteStage('deleting')
          window.setTimeout(async () => {
            const res = await deleteAccount()
            if (!res?.ok) {
              showToast(res?.reason || '삭제하지 못했어요. 잠시 후 다시 시도해주세요.')
              setDeleteStage('closed')
              return
            }
            showToast('계정이 삭제되었어요. 안녕히 가세요.')
            window.setTimeout(() => navigate('/', { replace: true }), 1100)
          }, 380)
        }}
      />

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

// 픽셀 봉투 카드 — 받은 편지 한 통
function EnvelopeListItem({ letter, onClick }) {
  const sender = presentSender(letter)
  const preview = (letter.content || '').slice(0, 60)
  const date = new Date(letter.createdAt)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left flex items-center gap-3 px-3 py-3"
        style={{
          background: 'var(--px-cream)',
          border: '3px solid var(--px-border)',
          boxShadow: '4px 4px 0 var(--px-shadow)',
          cursor: 'pointer'
        }}
      >
        <div className="flex-shrink-0" aria-hidden>
          <PixelEnvelope px={3} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-bold truncate" style={{ color: 'var(--px-text)' }}>
              from {sender.label}
            </span>
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--px-deep)' }}>
              {m}.{d}
            </span>
          </div>
          <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--px-deep)' }}>
            {preview}
            {letter.content.length > 60 && '…'}
          </div>
          {(letter.isPublic || letter.isArchived) && (
            <div className="mt-1 text-[10px]" style={{ color: 'var(--px-heart)' }}>
              {letter.isPublic && <span className="mr-2">♥ 공개됨</span>}
              {letter.isArchived && <span>· 보관됨</span>}
            </div>
          )}
        </div>
      </button>
    </li>
  )
}

function DangerZone({ deleteStage, onOpen, onCancel, onConfirm }) {
  return (
    <section
      className="mt-8 p-4"
      style={{ background: 'var(--px-cream)', border: '3px dashed #b0413e' }}
    >
      {deleteStage === 'closed' ? (
        <>
          <h3 className="text-[13px] font-bold mb-1" style={{ color: 'var(--px-text)' }}>
            계정 삭제하기
          </h3>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--px-deep)' }}>
            받은 편지, 보관함, 만든 편지 링크가 모두 지워져요. 다른 사람에게 보낸 편지의
            내 신원은 익명으로 바뀌어요. 되돌릴 수 없어요.
          </p>
          <PixelButton variant="danger" size="sm" onClick={onOpen}>
            계정 삭제하기
          </PixelButton>
        </>
      ) : (
        <>
          <h3 className="text-[13px] font-bold mb-1" style={{ color: '#b0413e' }}>
            정말 삭제할까요?
          </h3>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--px-deep)' }}>
            모든 편지와 링크가 사라지고 되돌릴 수 없어요.
          </p>
          <div className="flex gap-2">
            <PixelButton
              variant="danger"
              size="sm"
              onClick={onConfirm}
              disabled={deleteStage === 'deleting'}
              style={{ flex: 1 }}
            >
              {deleteStage === 'deleting' ? '지우는 중...' : '네, 삭제할게요'}
            </PixelButton>
            <PixelButton
              variant="cream"
              size="sm"
              onClick={onCancel}
              disabled={deleteStage === 'deleting'}
            >
              취소
            </PixelButton>
          </div>
        </>
      )}
    </section>
  )
}
