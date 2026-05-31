import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'
import NicknameInput from '../components/NicknameInput'
import HandleInput from '../components/HandleInput'
import { validateNickname, validateHandle } from '../utils/validation'
import {
  checkNicknameDuplicate,
  checkHandleDuplicate
} from '../utils/userDirectory'

export default function SetupAccount() {
  const navigate = useNavigate()
  const { status, completeSetup } = useAuth()
  const [nickname, setNickname] = useState('')
  const [handle, setHandle] = useState('')
  const [nickValid, setNickValid] = useState(false)
  const [handleValid, setHandleValid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authed') navigate('/me', { replace: true })
    else if (status === 'guest') navigate('/login', { replace: true })
  }, [status, navigate])

  const submit = async () => {
    if (submitting) return
    const ln = validateNickname(nickname)
    if (!ln.valid) {
      setError(ln.message)
      return
    }
    const lh = validateHandle(handle)
    if (!lh.valid) {
      setError(lh.message)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const [nickDup, handleDup] = await Promise.all([
        checkNicknameDuplicate(nickname),
        checkHandleDuplicate(handle)
      ])
      if (nickDup) {
        setError('이미 사용 중인 닉네임이에요.')
        setSubmitting(false)
        return
      }
      if (handleDup) {
        setError('이미 누군가 사용 중인 아이디예요.')
        setSubmitting(false)
        return
      }
      completeSetup({ nickname, handle })
      navigate('/me', { replace: true })
    } catch {
      setError('가입 중 문제가 있었어요. 잠시 후 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  if (status !== 'pending-setup') return null

  const canSubmit = nickValid && handleValid && !submitting

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-6"
    >
      <div className="text-center mb-7 mt-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="text-5xl mb-3"
        >
          ✉️
        </motion.div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">
          받아줘에 처음 오셨네요
        </h1>
        <p className="text-sm text-ink-500">어떻게 불러드릴까요?</p>
      </div>

      <SoftCard className="mb-5">
        <div className="space-y-5">
          <NicknameInput
            value={nickname}
            onChange={(v) => {
              setNickname(v)
              setError('')
            }}
            onValidityChange={setNickValid}
          />
          <HandleInput
            value={handle}
            onChange={(v) => {
              setHandle(v)
              setError('')
            }}
            onValidityChange={setHandleValid}
          />
        </div>
      </SoftCard>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-accent-pinkDeep text-center mb-4"
        >
          {error}
        </motion.div>
      )}

      <MotionButton variant="primary" onClick={submit} disabled={!canSubmit}>
        {submitting ? '확인 중...' : '시작하기'}
      </MotionButton>
    </motion.div>
  )
}
