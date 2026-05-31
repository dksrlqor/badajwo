import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'
import StepIndicator from '../components/StepIndicator'
import { saveItem } from '../utils/storage'
import { createId } from '../utils/createId'
import { useAuth } from '../context/AuthContext'

const stepVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
}

const SENDER_MODES = ['닉네임', '익명']

const newPage = () => ({ date: '', title: '', body: '', imageUrl: '' })

export default function CreateDiary() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    title: '',
    receiverName: '',
    senderMode: '닉네임',
    senderName: '',
    subtitle: '',
    pages: [newPage()]
  })

  const update = (key, value) => {
    setError('')
    setData((d) => ({ ...d, [key]: value }))
  }

  const updatePage = (i, key, value) => {
    setError('')
    setData((d) => {
      const pages = d.pages.map((p, idx) =>
        idx === i ? { ...p, [key]: value } : p
      )
      return { ...d, pages }
    })
  }

  const addPage = () =>
    setData((d) => ({ ...d, pages: [...d.pages, newPage()] }))

  const removePage = (i) => {
    setData((d) => {
      if (d.pages.length <= 1) return d
      return { ...d, pages: d.pages.filter((_, idx) => idx !== i) }
    })
  }

  const validateStep = () => {
    if (step === 1) {
      if (!data.title.trim()) return '다이어리 제목을 입력해주세요.'
      if (!data.receiverName.trim()) return '받는 사람 이름을 입력해주세요.'
      if (data.senderMode !== '익명' && !data.senderName.trim())
        return '작성자 이름을 입력해주세요.'
    }
    if (step === 2) {
      if (data.pages.length === 0) return '추억 페이지가 한 개 이상 필요해요.'
      const idx = data.pages.findIndex(
        (p) => !p.title.trim() && !p.body.trim()
      )
      if (idx !== -1)
        return `${idx + 1}번째 추억 페이지에 제목이나 내용을 채워주세요.`
    }
    return ''
  }

  const next = () => {
    const e = validateStep()
    if (e) {
      setError(e)
      return
    }
    setError('')
    setStep((s) => Math.min(3, s + 1))
  }
  const prev = () => {
    setError('')
    setStep((s) => Math.max(1, s - 1))
  }

  const submit = () => {
    const e = validateStep()
    if (e) {
      setError(e)
      return
    }
    const id = createId()
    const item = {
      id,
      type: 'diary',
      receiverName: data.receiverName.trim(),
      senderMode: data.senderMode,
      senderName: data.senderMode === '익명' ? '' : data.senderName.trim(),
      // 로그인 사용자가 작성한 경우만 senderUserId 저장.
      senderUserId: user?.id || null,
      isAnonymous: data.senderMode === '익명',
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      pages: data.pages.map((p) => ({
        date: p.date,
        title: p.title.trim(),
        body: p.body.trim(),
        imageUrl: p.imageUrl.trim()
      })),
      createdAt: Date.now()
    }
    const ok = saveItem(item)
    if (!ok) {
      setError('저장에 실패했어요. 브라우저 저장 공간을 확인해주세요.')
      return
    }
    navigate(`/complete/${id}`)
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
          onClick={() => (step === 1 ? navigate('/') : prev())}
          className="text-ink-700 text-sm px-2 py-1 -ml-2 hover:text-ink-900"
        >
          ← 뒤로
        </button>
        <div className="flex-1 text-center text-sm font-medium text-ink-700">
          다이어리 만들기
        </div>
        <div className="w-12" />
      </div>

      <StepIndicator current={step} total={3} />

      <SoftCard className="mb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 mb-1">
                  기본 정보
                </h2>
                <p className="text-xs text-ink-500 mb-5">
                  다이어리의 분위기를 정해보세요.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="label">다이어리 제목</label>
                    <input
                      className="field"
                      value={data.title}
                      onChange={(e) => update('title', e.target.value)}
                      placeholder="우리의 작은 기록"
                    />
                  </div>
                  <div>
                    <label className="label">받는 사람 이름</label>
                    <input
                      className="field"
                      value={data.receiverName}
                      onChange={(e) => update('receiverName', e.target.value)}
                      placeholder="예) 지수"
                    />
                  </div>
                  <div>
                    <label className="label">작성자 표시 방식</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SENDER_MODES.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => update('senderMode', mode)}
                          className={`py-3 rounded-2xl text-sm font-medium transition-colors ${
                            data.senderMode === mode
                              ? 'bg-accent-pinkDeep text-white'
                              : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                      익명으로 보내면 받는 사람에게는 "익명의 마음으로부터" 로 보여요.
                    </p>
                  </div>
                  <AnimatePresence initial={false}>
                    {data.senderMode !== '익명' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <label className="label">닉네임</label>
                        <input
                          className="field"
                          value={data.senderName}
                          onChange={(e) => update('senderName', e.target.value)}
                          placeholder="닉네임을 입력해주세요"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <label className="label">대표 문구</label>
                    <input
                      className="field"
                      value={data.subtitle}
                      onChange={(e) => update('subtitle', e.target.value)}
                      placeholder="한 줄로 다이어리를 소개해보세요"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 mb-1">
                  추억 페이지
                </h2>
                <p className="text-xs text-ink-500 mb-5">
                  하나하나 천천히 적어보세요. 페이지는 마음껏 추가할 수 있어요.
                </p>
                <div className="space-y-4">
                  {data.pages.map((page, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-cream-200 bg-cream-50 p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm font-semibold text-ink-700">
                          페이지 {i + 1}
                        </div>
                        {data.pages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePage(i)}
                            className="text-xs text-accent-pinkDeep hover:underline"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="date"
                          className="field"
                          value={page.date}
                          onChange={(e) =>
                            updatePage(i, 'date', e.target.value)
                          }
                        />
                        <input
                          className="field"
                          value={page.title}
                          onChange={(e) =>
                            updatePage(i, 'title', e.target.value)
                          }
                          placeholder="페이지 제목"
                        />
                        <textarea
                          className="field min-h-[110px] resize-none leading-relaxed"
                          value={page.body}
                          onChange={(e) =>
                            updatePage(i, 'body', e.target.value)
                          }
                          placeholder="기억하고 싶은 순간을 적어보세요"
                        />
                        <input
                          className="field"
                          value={page.imageUrl}
                          onChange={(e) =>
                            updatePage(i, 'imageUrl', e.target.value)
                          }
                          placeholder="이미지 URL (선택)"
                        />
                      </div>
                    </motion.div>
                  ))}
                  <MotionButton variant="soft" onClick={addPage}>
                    + 페이지 추가
                  </MotionButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 mb-1">
                  미리보기
                </h2>
                <p className="text-xs text-ink-500 mb-5">
                  받는 사람에게는 이렇게 보여요.
                </p>
                <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
                  <div className="text-xs text-ink-500 mb-2">
                    To. {data.receiverName || '받는 사람'}
                  </div>
                  <div className="text-xl font-bold text-ink-900">
                    {data.title || '다이어리 제목'}
                  </div>
                  {data.subtitle && (
                    <div className="text-sm text-accent-pinkDeep mt-1 mb-3">
                      {data.subtitle}
                    </div>
                  )}
                  <div className="text-xs text-ink-500 mt-4">
                    추억 페이지 {data.pages.length}개
                  </div>
                  <div className="text-xs text-ink-500 mt-3 text-right">
                    {data.senderMode === '익명'
                      ? '익명의 마음으로부터'
                      : `From. ${data.senderName || '보내는 사람'}`}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </SoftCard>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-accent-pinkDeep text-center mb-4"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {step < 3 && (
          <MotionButton variant="primary" onClick={next}>
            다음
          </MotionButton>
        )}
        {step === 3 && (
          <MotionButton variant="accent" onClick={submit}>
            링크 만들기
          </MotionButton>
        )}
        {step > 1 && (
          <MotionButton variant="ghost" onClick={prev}>
            이전 단계
          </MotionButton>
        )}
      </div>
    </motion.div>
  )
}
