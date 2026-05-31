import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import { saveAskRequest } from '../utils/storage'
import { createId } from '../utils/createId'
import { OrnamentLine, PaperStamp } from '../components/VintageMail'

// "나한테 편지 써줘" 시작 — 받을 이름만 적는 초대장 한 장.
// 책상 위에 놓인 작은 초대 카드 같은 느낌.
export default function AskSetup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    const n = name.trim()
    if (n.length < 1 || n.length > 12) {
      setError('이름은 1~12자로 적어주세요.')
      return
    }
    const id = createId()
    const ok = saveAskRequest({ id, receiverName: n, createdAt: Date.now() })
    if (!ok) {
      setError('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    navigate(`/ask/${id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
    >
      {/* 상단 — 작은 종이 탭 형태의 뒤로 */}
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
        <div className="flex-1" />
      </div>

      {/* 초대 카드 — 종이 위에 손글씨 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="relative mx-1 mb-7 paper-noise"
        style={{
          background: '#FDF8EE',
          padding: '34px 22px 28px',
          borderRadius: '10px 7px 12px 8px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(92,62,40,0.10), 0 18px 38px rgba(92,62,40,0.14)',
          transform: 'rotate(-0.5deg)'
        }}
      >
        {/* 마스킹테이프 — 상단 */}
        <div
          aria-hidden
          className="masking-tape tape-sage"
          style={{
            width: 90,
            height: 20,
            top: -10,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        />
        {/* 우상단 작은 우표 */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <PaperStamp variant="flower" size={44} rotation={6} />
        </div>

        <div className="text-center mb-6">
          <h2
            className="text-[22px] font-bold"
            style={{
              color: '#3D2E22',
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              fontStyle: 'italic'
            }}
          >
            나한테 편지 써줘
          </h2>
          <div className="flex justify-center mt-2 mb-2">
            <OrnamentLine width={100} color="#86705E" />
          </div>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: '#86705E' }}
          >
            친구가 너에게 편지를 써줄 수 있는
            <br />
            작은 초대장을 만들어요.
          </p>
        </div>

        {/* 받을 이름 입력 — 편지 양식 To. ___ */}
        <div className="mb-1">
          <div
            className="text-[11px] mb-1.5"
            style={{ color: '#5A4538', letterSpacing: '0.18em' }}
          >
            TO.
          </div>
          <input
            className="paper-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="내 이름이나 별명"
            maxLength={12}
            autoFocus
            style={{ fontSize: 17, fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}
          />
        </div>
        <div className="text-[11px] mt-2" style={{ color: '#86705E' }}>
          친구의 편지 화면에 To. 가 미리 채워져요.
        </div>
      </motion.div>

      {error && (
        <div className="text-sm text-center mb-4" style={{ color: '#C7443E' }}>
          {error}
        </div>
      )}

      <MotionButton variant="primary" onClick={submit}>
        스토리에 올릴 링크 만들기
      </MotionButton>
    </motion.div>
  )
}
