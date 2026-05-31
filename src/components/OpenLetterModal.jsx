import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from './MotionButton'

// "/view/<id>" 또는 "#/view/<id>" 모두 지원.
const ID_RE = /\/view\/([a-z0-9]+)/i

export default function OpenLetterModal({ onClose }) {
  const navigate = useNavigate()
  const [link, setLink] = useState('')
  const [error, setError] = useState('')

  const open = () => {
    const v = link.trim()
    if (!v) {
      setError('편지 링크를 붙여넣어주세요.')
      return
    }
    const m = v.match(ID_RE)
    const id = m ? m[1] : v.match(/^[a-z0-9]+$/i)?.[0]
    if (!id) {
      setError('받아줘 편지 링크를 찾지 못했어요.')
      return
    }
    navigate(`/view/${id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="bg-cream-50 rounded-3xl p-6 w-full max-w-sm shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="text-3xl mb-3">📬</div>
          <h2 className="text-base font-bold text-ink-900 mb-1">
            받은 편지 열기
          </h2>
          <p className="text-xs text-ink-500">
            전달받은 편지 링크를 붙여넣어주세요.
          </p>
        </div>
        <input
          className="field mb-2"
          value={link}
          onChange={(e) => {
            setLink(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') open()
          }}
          placeholder="https://.../view/..."
          autoFocus
        />
        {error && (
          <p className="text-xs text-accent-pinkDeep mb-2">{error}</p>
        )}
        <div className="space-y-2 mt-3">
          <MotionButton variant="primary" onClick={open}>
            편지 열어보기
          </MotionButton>
          <MotionButton variant="ghost" onClick={onClose}>
            취소
          </MotionButton>
        </div>
      </motion.div>
    </motion.div>
  )
}
