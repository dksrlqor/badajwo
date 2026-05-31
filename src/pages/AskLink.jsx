import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import { getAskRequest } from '../utils/storage'
import { AirmailBorder, PaperStamp, Postmark, OrnamentLine } from '../components/VintageMail'
import { buildStoryImage, shareToInstagramStory } from '../utils/storyImage'

// 작은 인스타 글리프 (camera frame + dot)
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

// askRequest 가 만들어진 직후 — 스토리에 올릴 작은 "초대장" 카드.
// "친구가 너에게 편지를 써줄 수 있는 링크" 가 책상 위 초대장처럼 놓여 있다.
export default function AskLink() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [toastMsg, setToastMsg] = useState('')
  const [show, setShow] = useState(false)
  const [sharing, setSharing] = useState(false)
  const req = getAskRequest(id)

  if (!req) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-20 text-center"
      >
        <div className="text-5xl mb-4">🕯️</div>
        <h1 className="text-lg font-bold text-ink-900 mb-2" style={{ color: '#3D2E22' }}>
          요청 링크를 찾지 못했어요.
        </h1>
        <p className="text-sm mb-8 px-4" style={{ color: '#86705E' }}>
          만든 링크가 이 브라우저에만 저장돼서 그래요.
        </p>
        <MotionButton variant="soft" onClick={() => navigate('/')}>
          홈으로
        </MotionButton>
      </motion.div>
    )
  }

  const link = `${window.location.origin}/write-to/${id}`

  const showToast = (msg) => {
    setToastMsg(msg)
    setShow(true)
    window.setTimeout(() => setShow(false), 1800)
  }

  const copy = async () => {
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
      showToast('복사됐어요. 스토리에 붙여보세요.')
    } catch {
      showToast('복사에 실패했어요. 직접 선택해주세요.')
    }
  }

  const share = async () => {
    if (sharing) return
    setSharing(true)
    try {
      const blob = await buildStoryImage({
        type: 'ask',
        receiverName: req.receiverName,
        url: link
      })
      const res = await shareToInstagramStory({
        blob,
        url: link,
        fileName: `badajwo-${req.receiverName}-ask.png`
      })
      if (res.aborted) {
        // 사용자가 공유를 취소했을 뿐
      } else if (res.method === 'webshare') {
        showToast('공유 시트에서 인스타그램 → 스토리에 추가를 선택하세요.')
      } else {
        showToast('이미지를 저장했어요. 인스타에서 스토리에 추가하세요.')
      }
    } catch (e) {
      showToast('이미지 만들기에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45 }}
      className="pt-4"
    >
      {/* 헤더 */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 18 }}
        className="text-center mb-5"
      >
        <h1
          className="text-[20px] font-bold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          요청 링크가 만들어졌어요
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={100} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          이 링크를 인스타 스토리에 붙여보세요.
        </p>
      </motion.div>

      {/* 초대장 — airmail border 안에 손글씨 To. */}
      <motion.div
        initial={{ opacity: 0, y: 12, rotate: 1.2 }}
        animate={{ opacity: 1, y: 0, rotate: 1.2 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-7 relative"
      >
        <div
          aria-hidden
          className="masking-tape tape-mint"
          style={{
            width: 70,
            height: 18,
            top: -10,
            right: '14%',
            transform: 'rotate(8deg)'
          }}
        />

        <AirmailBorder borderWidth={9} innerPadding={22} background="#FCF6E6">
          <div className="relative" style={{ minHeight: 150 }}>
            {/* 우표 */}
            <div style={{ position: 'absolute', top: -2, right: -2 }}>
              <PaperStamp variant="flower" size={56} rotation={-6} />
            </div>
            {/* 소인 */}
            <div style={{ position: 'absolute', top: 24, right: 42 }}>
              <Postmark size={64} rotation={10} city="LETTER" date={new Date()} />
            </div>

            <div style={{ position: 'absolute', left: 0, top: 10 }}>
              <span
                className="paper-label"
                style={{ background: '#F8EFD8', fontSize: 10 }}
              >
                나한테 편지 써줘
              </span>
            </div>

            {/* 본문 — 받을 이름 */}
            <div
              style={{
                position: 'absolute',
                left: 4,
                bottom: 14,
                color: '#3D2E22',
                fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
              }}
            >
              <div style={{ fontSize: 11, color: '#86705E', letterSpacing: '0.18em' }}>
                TO.
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  marginTop: 4,
                  borderBottom: '1.5px solid rgba(92,62,40,0.5)',
                  paddingBottom: 4,
                  minWidth: 140,
                  fontStyle: 'italic'
                }}
              >
                {req.receiverName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#86705E',
                  marginTop: 8,
                  fontStyle: 'italic'
                }}
              >
                — 친구야, 편지 한 통 써줄래?
              </div>
            </div>
          </div>
        </AirmailBorder>
      </motion.div>

      {/* 링크 메모 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="relative mx-1 mb-6"
        style={{
          background: '#FBF0DC',
          padding: '14px 14px 12px',
          borderRadius: '4px 6px 5px 7px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 4px rgba(92,62,40,0.10), 0 8px 18px rgba(92,62,40,0.10)',
          transform: 'rotate(-0.6deg)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-orange"
          style={{
            width: 54,
            height: 14,
            top: -6,
            right: 18,
            transform: 'rotate(10deg)'
          }}
        />
        <div
          className="text-[10px] mb-2"
          style={{ color: '#86705E', letterSpacing: '0.18em' }}
        >
          스토리에 올릴 링크
        </div>
        <div
          className="text-[13px] break-all select-all"
          style={{
            color: '#3D2E22',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.5,
            borderBottom: '1px dashed rgba(92,62,40,0.32)',
            paddingBottom: 6
          }}
        >
          {link}
        </div>
      </motion.div>

      <div className="space-y-3">
        <MotionButton variant="accent" onClick={share} disabled={sharing}>
          <span className="inline-flex items-center gap-2">
            <InstagramGlyph size={18} />
            {sharing ? '스토리 이미지 만드는 중…' : '인스타 스토리에 공유'}
          </span>
        </MotionButton>
        <MotionButton variant="primary" onClick={copy}>
          링크 복사하기
        </MotionButton>
        <MotionButton variant="soft" onClick={() => navigate(`/write-to/${id}`)}>
          친구가 보는 화면 미리보기
        </MotionButton>
        <MotionButton variant="ghost" onClick={() => navigate('/')}>
          홈으로
        </MotionButton>
      </div>

      {/* 안내 — 공유 동작 설명 */}
      <div
        className="mt-5 mx-2 text-[11px] leading-relaxed"
        style={{
          color: '#86705E',
          padding: '10px 12px',
          background: 'rgba(255, 252, 245, 0.6)',
          borderRadius: '4px 6px 5px 7px',
          border: '1px dashed rgba(92, 62, 40, 0.20)'
        }}
      >
        모바일에서 "인스타 스토리에 공유" 를 누르면 빈티지 봉투 이미지가 만들어지고
        OS 공유 시트가 열려요. 거기서 인스타그램 → <b>스토리에 추가</b> 를 선택하면
        그 이미지가 그대로 스토리 배경이 돼요. 링크는 이미지 안에 적혀 있고, 원하면
        인스타 스티커로 링크를 따로 붙여도 좋아요.
      </div>

      <Toast message={toastMsg} show={show} />
    </motion.div>
  )
}
