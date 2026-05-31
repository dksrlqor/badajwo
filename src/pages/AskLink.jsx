import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'
import Toast from '../components/Toast'
import { getAskRequest } from '../utils/storage'

// askRequest 가 만들어진 직후 보이는 화면.
// 친구에게 보낼 /write-to/:askId 링크를 노출 + 복사.
export default function AskLink() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [toastMsg, setToastMsg] = useState('')
  const [show, setShow] = useState(false)
  const req = getAskRequest(id)

  if (!req) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-20 text-center"
      >
        <div className="text-5xl mb-4">🕯️</div>
        <h1 className="text-lg font-bold text-ink-900 mb-2">
          요청 링크를 찾지 못했어요.
        </h1>
        <p className="text-sm text-ink-500 mb-8 px-4">
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
      showToast('링크를 복사했어요')
    } catch {
      showToast('복사에 실패했어요. 직접 선택해주세요.')
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
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 16 }}
        className="text-center mb-7"
      >
        <div className="text-5xl mb-3">📮</div>
        <h1 className="text-xl font-bold text-ink-900">
          {req.receiverName} 의 편지함이 열렸어요
        </h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          이 링크를 친구에게 보내면,
          <br />
          친구가 편지를 적어 다시 보낼 수 있어요.
        </p>
      </motion.div>

      <SoftCard className="mb-5">
        <div className="text-xs text-ink-500 mb-2">친구에게 보낼 링크</div>
        <div className="text-sm text-ink-900 break-all bg-cream-50 rounded-2xl p-3 border border-cream-200 select-all">
          {link}
        </div>
      </SoftCard>

      <div className="space-y-3">
        <MotionButton variant="primary" onClick={copy}>
          링크 복사하기
        </MotionButton>
        <MotionButton
          variant="soft"
          onClick={() => navigate(`/write-to/${id}`)}
        >
          친구가 보는 화면 미리보기
        </MotionButton>
        <MotionButton variant="ghost" onClick={() => navigate('/')}>
          홈으로
        </MotionButton>
      </div>

      <Toast message={toastMsg} show={show} />
    </motion.div>
  )
}
