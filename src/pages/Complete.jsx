import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import { AirmailBorder, PaperStamp, Postmark, OrnamentLine } from '../components/VintageMail'
import { getItem } from '../utils/storage'
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

// 편지 링크가 만들어진 직후 — 봉투에 담긴 편지가 책상 위에 놓인 화면.
// airmail 봉투 + 우표 + 우편 소인 + 마스킹테이프로 "이제 보낼 준비가 됐다" 느낌.
export default function Complete() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [toast, setToast] = useState('')
  const [show, setShow] = useState(false)
  const [sharing, setSharing] = useState(false)
  const item = getItem(id)

  const link = `${window.location.origin}/view/${id}`

  const showToast = (msg) => {
    setToast(msg)
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
        if (!ok) throw new Error('execCommand copy failed')
      }
      showToast('복사됐어요. 이제 마음을 보내면 돼요.')
    } catch (e) {
      showToast('복사에 실패했어요. 링크를 직접 선택해주세요.')
    }
  }

  const share = async () => {
    if (sharing) return
    setSharing(true)
    try {
      const blob = await buildStoryImage({
        type: 'sent',
        receiverName: item?.receiverName || '받는 이에게',
        url: link
      })
      const res = await shareToInstagramStory({
        blob,
        url: link,
        fileName: `badajwo-letter.png`
      })
      if (res.aborted) {
        // 취소
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
      className="pt-6"
    >
      {/* 헤더 — 손글씨 + ornament */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 18 }}
        className="text-center mb-6"
      >
        <h1
          className="text-[22px] font-bold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
            letterSpacing: '0.01em'
          }}
        >
          편지가 봉투에 담겼어요
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={110} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          이 링크를 복사해서 상대에게 보내주세요.
        </p>
      </motion.div>

      {/* 봉투 (airmail border 안쪽에 우표 + 소인 + To. 라벨) */}
      <motion.div
        initial={{ opacity: 0, y: 12, rotate: -1.2 }}
        animate={{ opacity: 1, y: 0, rotate: -1.2 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mb-7 relative"
        style={{ transformOrigin: 'center' }}
      >
        {/* 봉투 위 마스킹테이프 */}
        <div
          aria-hidden
          className="masking-tape tape-kraft"
          style={{
            width: 70,
            height: 18,
            top: -10,
            left: '12%',
            transform: 'rotate(-12deg)'
          }}
        />
        <div
          aria-hidden
          className="masking-tape tape-sage"
          style={{
            width: 60,
            height: 16,
            top: -8,
            right: '14%',
            transform: 'rotate(10deg)'
          }}
        />

        <AirmailBorder borderWidth={9} innerPadding={20} background="#FCF6E6">
          <div className="relative" style={{ minHeight: 130 }}>
            {/* 우상단 우표 */}
            <div style={{ position: 'absolute', top: -4, right: -4 }}>
              <PaperStamp variant="leaf" size={56} rotation={4} />
            </div>
            {/* 우상단 소인 — 우표 위로 살짝 겹침 */}
            <div style={{ position: 'absolute', top: 18, right: 40 }}>
              <Postmark size={70} rotation={-14} city="SEOUL" />
            </div>

            {/* To. 받는 사람 라벨 위치 (실제 받는 이름은 노출 안 함 — 봉투 미감만) */}
            <div style={{ position: 'absolute', left: 4, top: 14 }}>
              <span
                className="paper-label"
                style={{ background: '#F8EFD8', fontSize: 10 }}
              >
                AIR MAIL · PAR AVION
              </span>
            </div>

            {/* 봉투 중앙 — 손글씨 To. */}
            <div
              style={{
                position: 'absolute',
                left: 8,
                bottom: 6,
                color: '#3D2E22',
                fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#86705E',
                  letterSpacing: '0.18em'
                }}
              >
                TO.
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginTop: 2,
                  borderBottom: '1px solid rgba(92,62,40,0.4)',
                  paddingBottom: 2,
                  minWidth: 140,
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic'
                }}
              >
                받는 사람에게
              </div>
            </div>
          </div>
        </AirmailBorder>
      </motion.div>

      {/* 링크 — 작은 메모 종이 위에 적힌 듯 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative mx-1 mb-6"
        style={{
          background: '#FBF0DC',
          padding: '14px 14px 12px',
          borderRadius: '4px 6px 5px 7px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 4px rgba(92,62,40,0.10), 0 8px 18px rgba(92,62,40,0.10)',
          transform: 'rotate(0.6deg)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-blue"
          style={{
            width: 50,
            height: 14,
            top: -6,
            left: 14,
            transform: 'rotate(-8deg)'
          }}
        />
        <div
          className="text-[10px] mb-2"
          style={{ color: '#86705E', letterSpacing: '0.18em' }}
        >
          편지 링크
        </div>
        <div
          className="text-[13px] break-all select-all"
          onClick={(e) => {
            const range = document.createRange()
            range.selectNodeContents(e.currentTarget)
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
          }}
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

      {/* 버튼 */}
      <div className="space-y-3">
        <MotionButton variant="accent" onClick={share} disabled={sharing}>
          <span className="inline-flex items-center gap-2">
            <InstagramGlyph size={18} />
            {sharing ? '스토리 이미지 만드는 중…' : '인스타 스토리에 공유'}
          </span>
        </MotionButton>
        <MotionButton variant="primary" onClick={copy}>
          편지 링크 복사하기
        </MotionButton>
        <MotionButton variant="soft" onClick={() => navigate(`/view/${id}?preview=1`)}>
          미리보기로 보기
        </MotionButton>
        <MotionButton variant="ghost" onClick={() => navigate('/')}>
          홈으로
        </MotionButton>
      </div>

      <Toast message={toast} show={show} />
    </motion.div>
  )
}
