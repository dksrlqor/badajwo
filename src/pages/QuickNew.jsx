import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createQuickLink } from '../utils/storage'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import {
  AirmailBorder,
  PaperStamp,
  Postmark,
  OrnamentLine
} from '../components/VintageMail'
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

// /quick/new — 아이디 없이 간단 편지 링크 만들기.
// 만든 링크는 quickLinks 에만 저장되고, 일반 letters / user inbox 와 완전히 분리.
export default function QuickNew() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [link, setLink] = useState(null)
  const [creating, setCreating] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [toast, setToast] = useState({ message: '', show: false })

  const showToast = (m) => {
    setToast({ message: m, show: true })
    setTimeout(() => setToast({ message: '', show: false }), 2200)
  }

  const create = async () => {
    if (creating) return
    setCreating(true)
    // 살짝 모션을 주기 위한 미니 딜레이 (사용자 체감용)
    await new Promise((r) => setTimeout(r, 380))
    const newLink = createQuickLink({ createdByUserId: user?.id || null })
    setLink(newLink)
    setCreating(false)
  }

  const fullUrl = link
    ? `${window.location.origin}/quick/${link.code}`
    : ''

  const copy = async () => {
    if (!fullUrl) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl)
      } else {
        const t = document.createElement('textarea')
        t.value = fullUrl
        t.style.position = 'fixed'
        t.style.opacity = '0'
        document.body.appendChild(t)
        t.focus()
        t.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(t)
        if (!ok) throw new Error('copy failed')
      }
      showToast('링크가 복사되었어요.')
    } catch {
      showToast('복사에 실패했어요. 직접 선택해주세요.')
    }
  }

  const share = async () => {
    if (!link || sharing) return
    setSharing(true)
    try {
      const blob = await buildStoryImage({
        type: 'ask',
        receiverName: '편지 한 통',
        url: fullUrl
      })
      const res = await shareToInstagramStory({
        blob,
        url: fullUrl,
        fileName: `badajwo-quick-${link.code}.png`
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
          onClick={() => navigate('/write')}
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

      <AnimatePresence mode="wait">
        {!link ? (
          <motion.section
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-6">
              <h1
                className="text-[22px] font-bold"
                style={{
                  color: '#3D2E22',
                  fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
                }}
              >
                간단 편지 링크 만들기
              </h1>
              <div className="flex justify-center mt-2 mb-2">
                <OrnamentLine width={120} color="#86705E" />
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
                아이디를 몰라도 괜찮아요.
                <br />
                편지 링크를 만들어 친구에게 보내면,
                <br />
                그 링크 안에서 간단하게 마음을 주고받을 수 있어요.
              </p>
            </div>

            {/* 봉투 일러스트 카드 — 만들기 전 미리보기 */}
            <motion.div
              initial={{ opacity: 0, y: 12, rotate: -0.6 }}
              animate={{ opacity: 1, y: 0, rotate: -0.6 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="relative mx-1 mb-7"
            >
              <div
                aria-hidden
                className="masking-tape tape-kraft"
                style={{
                  width: 80,
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
                  width: 70,
                  height: 16,
                  top: -8,
                  right: '14%',
                  transform: 'rotate(10deg)'
                }}
              />
              <AirmailBorder borderWidth={9} innerPadding={22} background="#FCF6E6">
                <div className="relative" style={{ minHeight: 130 }}>
                  <div style={{ position: 'absolute', top: -4, right: -4 }}>
                    <PaperStamp variant="airmail" size={56} rotation={5} />
                  </div>
                  <div style={{ position: 'absolute', top: 18, right: 42 }}>
                    <Postmark size={66} rotation={-12} city="LETTER" />
                  </div>

                  <div style={{ position: 'absolute', left: 0, top: 8 }}>
                    <span
                      className="paper-label"
                      style={{ background: '#F8EFD8', fontSize: 10 }}
                    >
                      간단 편지 링크
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      left: 4,
                      bottom: 4,
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
                        marginTop: 2,
                        borderBottom: '1.5px solid rgba(92,62,40,0.5)',
                        paddingBottom: 4,
                        minWidth: 150,
                        fontStyle: 'italic'
                      }}
                    >
                      누구든
                    </div>
                  </div>
                </div>
              </AirmailBorder>
            </motion.div>

            <MotionButton
              variant="primary"
              onClick={create}
              disabled={creating}
            >
              {creating ? '링크 만드는 중…' : '새 편지 링크 만들기'}
            </MotionButton>

            <p
              className="text-[11px] text-center mt-5 leading-relaxed"
              style={{ color: '#86705E' }}
            >
              이 링크는 받아줘 아이디 없이도 만들 수 있어요. 받은 메시지는 링크 안에서만
              주고받아져요.
            </p>
          </motion.section>
        ) : (
          <motion.section
            key="created"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="text-center mb-6">
              <h1
                className="text-[22px] font-bold"
                style={{
                  color: '#3D2E22',
                  fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
                }}
              >
                편지 링크가 만들어졌어요
              </h1>
              <div className="flex justify-center mt-2 mb-2">
                <OrnamentLine width={120} color="#86705E" />
              </div>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: '#86705E' }}
              >
                이 링크를 친구에게 보내보세요.
                <br />
                친구가 링크에 들어오면 편지를 남길 수 있어요.
              </p>
            </div>

            {/* 봉투 (받아본 링크 미리보기) */}
            <motion.div
              initial={{ opacity: 0, y: 14, rotate: 1.4 }}
              animate={{ opacity: 1, y: 0, rotate: 1.4 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="mb-6 relative"
            >
              <AirmailBorder borderWidth={9} innerPadding={20} background="#FCF6E6">
                <div className="relative" style={{ minHeight: 120 }}>
                  <div style={{ position: 'absolute', top: -4, right: -4 }}>
                    <PaperStamp variant="airmail" size={54} rotation={6} />
                  </div>
                  <div style={{ position: 'absolute', top: 16, right: 42 }}>
                    <Postmark size={62} rotation={-12} city="LETTER" />
                  </div>

                  <div style={{ position: 'absolute', left: 0, top: 10 }}>
                    <span
                      className="paper-label"
                      style={{ background: '#F8EFD8', fontSize: 10 }}
                    >
                      간단 편지 링크
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      left: 4,
                      bottom: 4,
                      color: '#3D2E22',
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: '#86705E',
                        letterSpacing: '0.18em',
                        fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
                      }}
                    >
                      CODE
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        marginTop: 2,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase'
                      }}
                    >
                      {link.code}
                    </div>
                  </div>
                </div>
              </AirmailBorder>
            </motion.div>

            {/* 링크 메모 종이 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
              className="relative mx-1 mb-5"
              style={{
                background: '#FBF0DC',
                padding: '14px 14px 12px',
                borderRadius: '4px 6px 5px 7px',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 4px rgba(92,62,40,0.10), 0 8px 18px rgba(92,62,40,0.10)',
                transform: 'rotate(-0.5deg)'
              }}
            >
              <div
                aria-hidden
                className="masking-tape tape-blue"
                style={{
                  width: 50,
                  height: 14,
                  top: -6,
                  left: 16,
                  transform: 'rotate(-8deg)'
                }}
              />
              <div
                className="text-[10px] mb-1"
                style={{ color: '#86705E', letterSpacing: '0.18em' }}
              >
                공유할 링크
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
                {fullUrl}
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
              <MotionButton
                variant="soft"
                onClick={() => navigate(`/quick/${link.code}?preview=1`)}
              >
                친구가 보는 화면 미리보기
              </MotionButton>
              <MotionButton variant="ghost" onClick={() => setLink(null)}>
                또 만들기
              </MotionButton>
            </div>

            <p
              className="text-[11px] text-center mt-5 leading-relaxed"
              style={{ color: '#86705E' }}
            >
              간단 링크에서 받은 메시지는{' '}
              <span style={{ color: '#5A4538' }}>내 받은 편지함</span> 과는 별도로 보관돼요.
              <br />
              <Link
                to={`/quick/${link.code}`}
                className="underline mt-1 inline-block"
                style={{
                  color: '#5A4538',
                  textUnderlineOffset: 3,
                  textDecorationStyle: 'dashed'
                }}
              >
                지금 바로 링크 열어보기
              </Link>
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}
