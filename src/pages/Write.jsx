import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getUserByUsername, validateUsername } from '../utils/storage'
import MotionButton from '../components/MotionButton'
import { OrnamentLine } from '../components/VintageMail'

// /write — username 입력하면 /u/:username 으로 이동.
// receiver 는 URL 또는 검색 결과로만 결정한다 (로그인 사용자와 무관).
export default function Write() {
  const navigate = useNavigate()
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')

  const go = () => {
    setError('')
    const v = validateUsername(raw)
    if (!v.ok) {
      setError(v.reason)
      return
    }
    const u = getUserByUsername(v.normalized)
    if (!u) {
      setError('앗, 이 편지함을 찾을 수 없어요. 다시 한 번 아이디를 확인해주세요.')
      return
    }
    navigate('/u/' + v.normalized)
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
          누구에게 편지를 쓸까요?
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={120} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          받는 사람의 받아줘 아이디를 적어주세요.
          <br />
          링크가 있다면 그대로 들어가도 돼요.
        </p>
      </div>

      <div
        className="paper-noise relative mx-1 mb-5"
        style={{
          background: '#FDF8EE',
          padding: '28px 22px 22px',
          borderRadius: '8px 6px 10px 7px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.12)',
          transform: 'rotate(-0.5deg)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-orange"
          style={{
            width: 86,
            height: 18,
            top: -9,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        />

        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[22px] font-bold"
            style={{ color: '#86705E', fontFamily: 'Georgia, serif' }}
          >
            @
          </span>
          <input
            className="paper-input flex-1"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value.toLowerCase())
              setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') go()
            }}
            placeholder="받는 사람 아이디"
            maxLength={20}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            style={{ fontSize: 20, fontFamily: 'Georgia, serif' }}
          />
        </div>
        {error && (
          <p className="text-[11px] mt-3" style={{ color: '#C7443E' }}>
            {error}
          </p>
        )}
      </div>

      <MotionButton variant="primary" onClick={go} disabled={!raw}>
        편지 쓰러 가기
      </MotionButton>
    </motion.div>
  )
}
