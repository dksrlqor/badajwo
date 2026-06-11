import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getUserByUsername, validateUsername } from '../utils/storage'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'

// /write/id — 받는 사람 받아줘 아이디 입력 → /u/:username/write.
// receiver 는 URL/검색 결과로만 결정 (로그인 사용자와 무관).
export default function WriteId() {
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
      setError('존재하지 않는 아이디예요. 아이디를 다시 확인해주세요.')
      return
    }
    navigate('/u/' + v.normalized + '/write')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <div className="flex items-center mb-4">
        <button onClick={() => navigate('/')} className="px-btn px-btn-ghost px-btn-sm" style={{ width: 'auto' }}>
          ← 뒤로
        </button>
      </div>

      <PixelWindow title="♡ 누구에게 보낼까요? ♡">
        <div className="flex justify-center mb-4">
          <PixelCat state="idle" px={5} />
        </div>
        <p className="text-[12px] text-center leading-relaxed mb-4" style={{ color: 'var(--px-deep)' }}>
          친구의 받아줘 아이디를 입력하면
          <br />
          그 친구에게 바로 편지를 쓸 수 있어요.
        </p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[20px] font-bold" style={{ color: 'var(--px-deep)' }}>
            @
          </span>
          <input
            className="px-input flex-1"
            value={raw}
            onChange={(e) => setRaw(e.target.value.toLowerCase())}
            placeholder="친구의 아이디"
            maxLength={20}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            onKeyDown={(e) => {
              if (e.key === 'Enter') go()
            }}
          />
        </div>

        {error && (
          <div className="text-[12px] text-center mb-3" style={{ color: '#b0413e' }}>
            {error}
          </div>
        )}

        <PixelButton variant="deep" onClick={go}>
          편지 쓰러 가기
        </PixelButton>
      </PixelWindow>
    </motion.div>
  )
}
