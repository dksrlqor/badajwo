import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'
import Toast from '../components/Toast'

export default function Complete() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [toast, setToast] = useState('')
  const [show, setShow] = useState(false)

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
      showToast('링크를 복사했어요')
    } catch (e) {
      showToast('복사에 실패했어요. 링크를 직접 선택해주세요.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-10"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 16 }}
        className="text-center mb-7"
      >
        <div className="text-5xl mb-3">💌</div>
        <h1 className="text-xl font-bold text-ink-900">
          링크가 만들어졌어요.
        </h1>
        <p className="text-sm text-ink-500 mt-2">
          받는 사람에게 이 링크를 전해주세요.
        </p>
      </motion.div>

      <SoftCard className="mb-5">
        <div className="text-xs text-ink-500 mb-2">생성된 링크</div>
        <div
          className="text-sm text-ink-900 break-all bg-cream-50 rounded-2xl p-3 border border-cream-200 select-all"
          onClick={(e) => {
            const range = document.createRange()
            range.selectNodeContents(e.currentTarget)
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
          }}
        >
          {link}
        </div>
      </SoftCard>

      <div className="space-y-3">
        <MotionButton variant="primary" onClick={copy}>
          링크 복사하기
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
