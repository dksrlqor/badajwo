import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'
import { saveAskRequest } from '../utils/storage'
import { createId } from '../utils/createId'

// 받아줘 — "나한테 편지 써줘" 시작 페이지.
// 1) 사용자가 받을 이름을 적는다.
// 2) askRequest 가 만들어지고 /ask/:id 로 이동, 거기서 링크 복사.
// 3) 친구가 그 링크(/write-to/:askId) 로 들어오면 To. 가 자동으로 채워진 채로
//    편지 작성을 한다.
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
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-ink-700 text-sm px-2 py-1 -ml-2 hover:text-ink-900"
        >
          ← 뒤로
        </button>
        <div className="flex-1 text-center text-sm font-medium text-ink-700">
          나한테 편지 써줘
        </div>
        <div className="w-12" />
      </div>

      <SoftCard className="mb-5">
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">💌</div>
          <h2 className="text-lg font-bold text-ink-900 mb-1">
            친구가 보낼 편지를 받아볼까요?
          </h2>
          <p className="text-xs text-ink-500 leading-relaxed mt-2">
            받을 이름을 적어두면, 링크를 받은 친구가
            <br />
            <span className="text-ink-700">To. 너에게</span> 가 미리 채워진
            편지지를 만나요.
          </p>
        </div>
        <div>
          <label className="label">받을 이름</label>
          <input
            className="field"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="내 이름이나 별명 (예: 기백)"
            maxLength={12}
            autoFocus
          />
        </div>
      </SoftCard>

      {error && (
        <div className="text-sm text-accent-pinkDeep text-center mb-4">
          {error}
        </div>
      )}

      <MotionButton variant="primary" onClick={submit}>
        편지 받을 링크 만들기
      </MotionButton>
    </motion.div>
  )
}
