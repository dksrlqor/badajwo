import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  getQuickLinkByCode,
  addQuickMessage,
  listQuickMessagesByLink
} from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import { OrnamentLine } from '../components/VintageMail'

// /quick/:code — 간단 편지 링크 접속 화면.
// 메시지 데이터는 quickMessages 에만 저장. 일반 letters / user inbox 와 섞이지 않음.
// 익명/이름 선택 — 익명 보내기는 senderDisplayName 무조건 '익명' 으로 저장 (Google 정보 0).
// ?preview=1 면 작성 비활성화.
const BODY_MAX = 1600
const NAME_MAX = 20

export default function QuickView() {
  const { code } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const link = useMemo(() => getQuickLinkByCode(code), [code])
  const previewMode =
    new URLSearchParams(location.search).get('preview') === '1'

  const [body, setBody] = useState('')
  const [senderMode, setSenderMode] = useState('anonymous')
  const [senderName, setSenderName] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', show: false })
  // 보낸 후 상태 — link owner 가 볼 때는 받은 메시지 목록도 같이 표시
  const [messages, setMessages] = useState(() =>
    link ? listQuickMessagesByLink(link.id) : []
  )
  const [justSent, setJustSent] = useState(false)

  if (!link) {
    return (
      <div className="pt-12 text-center px-4">
        <div className="text-5xl mb-3">📭</div>
        <h1
          className="text-[18px] font-bold mb-2"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          이 링크를 찾을 수 없어요.
        </h1>
        <p className="text-[12px] mb-6" style={{ color: '#86705E' }}>
          링크가 만료되었거나 잘못된 주소일 수 있어요.
        </p>
        <MotionButton variant="soft" onClick={() => navigate('/')}>
          홈으로
        </MotionButton>
      </div>
    )
  }

  const isOwner = !!user && user.id === link.createdByUserId
  const showToast = (m) => {
    setToast({ message: m, show: true })
    setTimeout(() => setToast({ message: '', show: false }), 2000)
  }

  const submit = () => {
    if (previewMode) {
      showToast('미리보기에서는 편지를 보낼 수 없어요.')
      return
    }
    const content = body.trim()
    if (!content) {
      setError('짧아도 괜찮아요. 한 줄이라도 적어주세요.')
      return
    }
    if (content.length > BODY_MAX) {
      setError(`메시지는 ${BODY_MAX}자까지 적을 수 있어요.`)
      return
    }
    const input = {
      quickLinkId: link.id,
      senderMode,
      content
    }
    if (senderMode === 'name') {
      const n = senderName.trim()
      if (!n) {
        setError('이름을 적거나 익명을 선택해주세요.')
        return
      }
      input.senderName = n
    }
    const m = addQuickMessage(input)
    if (!m) {
      setError('남기는 중에 문제가 생겼어요. 다시 시도해주세요.')
      return
    }
    setMessages(listQuickMessagesByLink(link.id))
    setJustSent(true)
    setBody('')
    setSenderName('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-4"
    >
      {previewMode && (
        <motion.div
          initial={{ opacity: 0, y: -6, rotate: -0.6 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6 }}
          className="mx-1 mb-5 px-4 py-3 text-[12px] leading-relaxed"
          style={{
            background: '#FCF096',
            color: '#3D2E22',
            borderRadius: '4px 6px 5px 7px',
            boxShadow: '0 1px 3px rgba(92,62,40,0.18)',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          <b>미리보기</b>
          <br />
          친구들이 보게 될 화면을 미리 확인하는 용도예요. 이 화면에서는 실제 편지를 보낼
          수 없어요.
        </motion.div>
      )}

      <div className="text-center mb-5">
        <h1
          className="text-[20px] font-bold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          도착한 편지 링크
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={110} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          이 링크 안에서 간단하게 마음을 남길 수 있어요.
          <br />
          <span style={{ color: '#B3987B' }}>
            코드: {String(link.code).toUpperCase()}
          </span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!justSent ? (
          <motion.section
            key="compose"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {/* 편지지 */}
            <div
              className="paper-noise relative mx-1 mb-5"
              style={{
                background: '#FDF8EE',
                padding: '22px 20px 18px',
                borderRadius: '10px 7px 12px 8px',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.14)'
              }}
            >
              <div
                aria-hidden
                className="masking-tape tape-orange"
                style={{
                  width: 80,
                  height: 18,
                  top: -9,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-2deg)'
                }}
              />

              <textarea
                className="paper-textarea lined-paper w-full min-h-[200px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="짧아도 괜찮아요. 지금 떠오르는 마음을 적어보세요."
                disabled={previewMode}
                style={{
                  background: 'transparent',
                  fontSize: 15,
                  fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
                  color: '#3D2E22'
                }}
              />
              <div className="text-right text-[11px] mt-1" style={{ color: '#86705E' }}>
                {body.length} / {BODY_MAX}
              </div>
            </div>

            {/* 작성자 선택 */}
            <div className="mx-1 mb-4 space-y-2">
              <SenderOption
                checked={senderMode === 'anonymous'}
                onClick={() => setSenderMode('anonymous')}
                title="익명으로 남기기"
                sub="작성자의 이름이나 계정 정보가 노출되지 않아요."
                disabled={previewMode}
              />
              <SenderOption
                checked={senderMode === 'name'}
                onClick={() => setSenderMode('name')}
                title="이름 적기"
                sub="이름을 비워두면 익명으로 전달돼요."
                disabled={previewMode}
              />
              {senderMode === 'name' && (
                <input
                  className="paper-input"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="예: 민지"
                  maxLength={NAME_MAX}
                  disabled={previewMode}
                  style={{ fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}
                />
              )}
            </div>

            <p
              className="text-[11px] leading-relaxed mx-2 mb-4"
              style={{ color: '#86705E' }}
            >
              간단 링크 메시지는 받은 편지함과는 별도로 보관돼요. 익명을 선택하면 Google
              계정 정보·이메일·이름은 절대 노출되지 않아요.
            </p>

            {error && (
              <div className="text-[12px] text-center mb-3" style={{ color: '#C7443E' }}>
                {error}
              </div>
            )}

            <MotionButton variant="primary" onClick={submit} disabled={previewMode}>
              {previewMode ? '미리보기에서는 보낼 수 없어요' : '남기기'}
            </MotionButton>
          </motion.section>
        ) : (
          <motion.section
            key="sent"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center"
          >
            <div className="text-5xl mb-3">📨</div>
            <h2
              className="text-[18px] font-bold mb-1"
              style={{
                color: '#3D2E22',
                fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
              }}
            >
              마음이 남겨졌어요.
            </h2>
            <p
              className="text-[12px] leading-relaxed mb-7"
              style={{ color: '#86705E' }}
            >
              이 링크의 주인이 곧 메시지를 확인하게 돼요.
            </p>

            <div className="space-y-3">
              <MotionButton
                variant="primary"
                onClick={() => setJustSent(false)}
              >
                또 한 통 남기기
              </MotionButton>
              <MotionButton variant="soft" onClick={() => navigate('/')}>
                받아줘 둘러보기
              </MotionButton>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 링크 주인 — 받은 메시지 목록 노출 */}
      {isOwner && messages.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-8 mx-1"
        >
          <div
            className="text-[12px] mb-2"
            style={{ color: '#5A4538', letterSpacing: '0.16em' }}
          >
            이 링크에 도착한 메시지
            <span style={{ color: '#86705E' }}> · {messages.length}</span>
          </div>

          <ul className="space-y-2.5">
            {messages.map((m) => (
              <li
                key={m.id}
                className="px-4 py-3"
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
                    className="text-[13px] font-semibold"
                    style={{
                      color: '#3D2E22',
                      fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
                    }}
                  >
                    {m.senderDisplayName}
                  </span>
                  <span className="text-[10px]" style={{ color: '#86705E' }}>
                    {formatDate(m.createdAt)}
                  </span>
                </div>
                <div
                  className="text-[13px] mt-1 leading-relaxed whitespace-pre-wrap"
                  style={{ color: '#5A4538' }}
                >
                  {m.content}
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

function SenderOption({ checked, onClick, title, sub, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full text-left flex items-start gap-3 px-3 py-2.5 transition"
      style={{
        background: checked ? '#FBF0DC' : 'transparent',
        border: `1.5px ${checked ? 'solid' : 'dashed'} rgba(92,62,40,${checked ? 0.42 : 0.22})`,
        borderRadius: '5px 7px 4px 6px',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      <span
        aria-hidden
        className="mt-1 inline-block flex-shrink-0"
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: checked ? '#3D2E22' : 'transparent',
          border: '1.5px solid #3D2E22',
          boxShadow: checked ? 'inset 0 0 0 2px #FDF8EE' : undefined
        }}
      />
      <span className="flex-1 min-w-0">
        <span
          className="block text-[13px] font-semibold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          {title}
        </span>
        {sub && (
          <span
            className="block text-[11px] mt-0.5 leading-relaxed"
            style={{ color: '#86705E' }}
          >
            {sub}
          </span>
        )}
      </span>
    </button>
  )
}

function formatDate(ts) {
  const d = new Date(ts)
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${m}.${day}`
}
