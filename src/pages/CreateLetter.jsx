import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MotionButton from '../components/MotionButton'
import SoftCard from '../components/SoftCard'
import StepIndicator from '../components/StepIndicator'
import CharCounter from '../components/CharCounter'
import LetterPaper from '../components/LetterPaper'
import PaperColorPicker from '../components/PaperColorPicker'
import PolaroidPhotoCard from '../components/PolaroidPhotoCard'
import PhotoAdjustmentModal from '../components/PhotoAdjustmentModal'
import PostItNote from '../components/PostItNote'
import RecordPlayer from '../components/RecordPlayer'
import StickerDecoration from '../components/StickerDecoration'
import { saveItem } from '../utils/storage'
import { createId } from '../utils/createId'
import { loadAndDownscale } from '../utils/imageFile'
import { useAuth } from '../context/AuthContext'

const TITLE_MAX = 40
const BODY_MAX = 1600
const BODY_SOFT = 1400
const POSTIT_MAX = 80
const CAPTION_MAX = 30

const SENDER_MODES = ['닉네임', '익명']

const stepVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
}

const emptyPhoto = () => ({
  src: '',
  caption: '',
  displayMode: 'normal', // 'normal' | 'scratch'
  scale: 1,
  offsetX: 0,
  offsetY: 0
})

export default function CreateLetter() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    // step 1
    receiverName: '',
    senderMode: '닉네임',
    senderName: '',
    // step 2
    title: '',
    subtitle: '',
    paperColor: 'ivory',
    body: '',
    postItText: '',
    // step 3
    photo: emptyPhoto(),
    // step 4
    musicUrl: '',
    musicTitle: '',
    passwordEnabled: false,
    password: '',
    passwordHint: ''
  })
  const [showAdjust, setShowAdjust] = useState(false)
  const [processingPhoto, setProcessingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  const update = (key, value) => {
    setError('')
    setData((d) => ({ ...d, [key]: value }))
  }
  const updatePhoto = (partial) => {
    setData((d) => ({ ...d, photo: { ...d.photo, ...partial } }))
  }

  const validateStep = () => {
    if (step === 1) {
      if (!data.receiverName.trim()) return '받는 사람 이름을 입력해주세요.'
      if (data.senderMode !== '익명' && !data.senderName.trim())
        return '작성자 이름을 입력해주세요.'
    }
    if (step === 2) {
      if (!data.title.trim()) return '편지 제목을 입력해주세요.'
      if (data.title.length > TITLE_MAX)
        return `제목은 ${TITLE_MAX}자까지만 담을 수 있어요.`
      if (!data.body.trim()) return '편지 내용을 입력해주세요.'
      if (data.body.length > BODY_MAX)
        return '편지는 1600자까지만 담을 수 있어요.'
      if (data.postItText.length > POSTIT_MAX)
        return `포스트잇은 ${POSTIT_MAX}자까지만 담을 수 있어요.`
    }
    if (step === 3) {
      if (data.photo.caption.length > CAPTION_MAX)
        return `캡션은 ${CAPTION_MAX}자까지만 담을 수 있어요.`
    }
    if (step === 4) {
      if (data.passwordEnabled && !data.password.trim())
        return '비밀번호를 입력해주세요.'
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
    setStep((s) => Math.min(5, s + 1))
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
    const hasPhoto = !!data.photo.src
    const item = {
      id,
      type: 'letter',
      receiverName: data.receiverName.trim(),
      senderMode: data.senderMode,
      senderName: data.senderMode === '익명' ? '' : data.senderName.trim(),
      senderUserId: user?.id || null,
      isAnonymous: data.senderMode === '익명',
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      // 본문: 새 이름(content) 과 기존 이름(body) 둘 다 저장 → 이전 ViewPage 호환
      body: data.body,
      content: data.body,
      paperColor: data.paperColor,
      postItText: data.postItText.trim(),
      postIt: data.postItText.trim() ? { text: data.postItText.trim() } : null,
      photo: hasPhoto
        ? {
            src: data.photo.src,
            caption: data.photo.caption.trim(),
            displayMode: data.photo.displayMode,
            scale: data.photo.scale,
            offsetX: data.photo.offsetX,
            offsetY: data.photo.offsetY
          }
        : null,
      musicUrl: data.musicUrl.trim(),
      music: data.musicUrl.trim()
        ? {
            src: data.musicUrl.trim(),
            title: data.musicTitle.trim(),
            isEnabled: true
          }
        : null,
      passwordEnabled: data.passwordEnabled,
      // NOTE: 실서비스에서는 password hash 처리가 필요함.
      password: data.passwordEnabled ? data.password : '',
      passwordAnswer: data.passwordEnabled ? data.password : '',
      passwordHint: data.passwordEnabled ? data.passwordHint.trim() : '',
      passwordQuestion: data.passwordEnabled ? data.passwordHint.trim() : '',
      createdAt: Date.now()
    }
    const ok = saveItem(item)
    if (!ok) {
      setError('저장에 실패했어요. 사진이 너무 크거나 저장 공간이 부족할 수 있어요.')
      return
    }
    navigate(`/complete/${id}`)
  }

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 첨부할 수 있어요.')
      e.target.value = ''
      return
    }
    try {
      setProcessingPhoto(true)
      setError('')
      const dataUrl = await loadAndDownscale(file)
      setData((d) => ({
        ...d,
        photo: {
          ...emptyPhoto(),
          src: dataUrl
        }
      }))
    } catch {
      setError('사진을 불러오는 중 문제가 있었어요.')
    } finally {
      setProcessingPhoto(false)
      e.target.value = ''
    }
  }

  const removePhoto = () => {
    setData((d) => ({ ...d, photo: emptyPhoto() }))
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
          편지 만들기
        </div>
        <div className="w-12" />
      </div>

      <StepIndicator current={step} total={5} />

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
              <Step1
                data={data}
                update={update}
              />
            )}
            {step === 2 && (
              <Step2 data={data} update={update} />
            )}
            {step === 3 && (
              <Step3
                data={data}
                updatePhoto={updatePhoto}
                onPick={() => fileInputRef.current?.click()}
                onRemove={removePhoto}
                onAdjust={() => setShowAdjust(true)}
                processing={processingPhoto}
              />
            )}
            {step === 4 && (
              <Step4 data={data} update={update} />
            )}
            {step === 5 && (
              <Step5 data={data} />
            )}
          </motion.div>
        </AnimatePresence>
      </SoftCard>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickPhoto}
      />

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
        {step < 5 && (
          <MotionButton variant="primary" onClick={next}>
            다음
          </MotionButton>
        )}
        {step === 5 && (
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

      <AnimatePresence>
        {showAdjust && data.photo.src && (
          <PhotoAdjustmentModal
            photo={data.photo}
            onApply={(partial) => {
              updatePhoto(partial)
              setShowAdjust(false)
            }}
            onCancel={() => setShowAdjust(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Step 1 ──────────────────────────────────────────────
function Step1({ data, update }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink-900 mb-1">받는 사람</h2>
      <p className="text-xs text-ink-500 mb-5">
        누구에게, 어떤 이름으로 보낼지 정해주세요.
      </p>
      <div className="space-y-4">
        <div>
          <label className="label">받는 사람 이름</label>
          <input
            className="field"
            value={data.receiverName}
            onChange={(e) => update('receiverName', e.target.value)}
            placeholder="예) 지수"
            maxLength={20}
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
                maxLength={20}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Step 2 ──────────────────────────────────────────────
function Step2({ data, update }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink-900 mb-1">편지지</h2>
      <p className="text-xs text-ink-500 mb-5">
        편지지를 고르고, 천천히 마음을 적어보세요.
      </p>

      <div className="space-y-5">
        <div>
          <label className="label">제목</label>
          <input
            className="field"
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="편지 제목"
            maxLength={TITLE_MAX}
          />
          <CharCounter value={data.title} max={TITLE_MAX} />
        </div>

        <div>
          <label className="label">대표 문구 (선택)</label>
          <input
            className="field"
            value={data.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="한 줄로 마음을 담아보세요"
            maxLength={60}
          />
        </div>

        <div>
          <label className="label">편지지 색</label>
          <PaperColorPicker
            value={data.paperColor}
            onChange={(v) => update('paperColor', v)}
          />
        </div>

        <div>
          <label className="label">편지 본문</label>
          <textarea
            className="field min-h-[220px] resize-none leading-[28px]"
            value={data.body}
            onChange={(e) => update('body', e.target.value)}
            placeholder="전하고 싶은 말을 자유롭게 적어보세요."
          />
          <CharCounter
            value={data.body}
            max={BODY_MAX}
            softWarnAt={BODY_SOFT}
            softMessage="마음이 많이 담겼네요. 조금만 더 다듬으면 더 편하게 읽힐 거예요."
            hardMessage="편지는 1600자까지만 담을 수 있어요."
          />
        </div>

        <div>
          <label className="label">포스트잇 메모 (선택)</label>
          <textarea
            className="field min-h-[70px] resize-none"
            value={data.postItText}
            onChange={(e) => update('postItText', e.target.value)}
            placeholder="예) PS. 고마웠어"
            maxLength={POSTIT_MAX}
          />
          <CharCounter value={data.postItText} max={POSTIT_MAX} />
          {data.postItText.trim() && (
            <div className="mt-3 flex justify-center">
              <PostItNote text={data.postItText} rotation={-3} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 3 ──────────────────────────────────────────────
function Step3({ data, updatePhoto, onPick, onRemove, onAdjust, processing }) {
  const hasPhoto = !!data.photo.src
  return (
    <div>
      <h2 className="text-lg font-bold text-ink-900 mb-1">폴라로이드 사진</h2>
      <p className="text-xs text-ink-500 mb-5">
        편지에 함께 보낼 사진을 한 장 골라보세요. 없어도 괜찮아요.
      </p>

      {!hasPhoto ? (
        <div className="text-center py-2">
          <button
            type="button"
            onClick={onPick}
            disabled={processing}
            className="w-full py-12 rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 text-ink-500 text-sm hover:bg-cream-100 transition disabled:opacity-60"
          >
            {processing ? '사진을 다듬는 중...' : '+ 갤러리에서 사진 추가'}
          </button>
          <p className="text-xs text-ink-500 mt-3 leading-relaxed">
            기기 갤러리에서 사진을 골라주세요.
            <br />
            폴라로이드 프레임에 자동으로 담겨요.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-center py-2">
            <PolaroidPhotoCard
              photo={data.photo}
              rotation={0}
              onClick={onAdjust}
            />
          </div>
          <p className="text-xs text-ink-500 text-center -mt-2">
            폴라로이드를 탭하면 사진 위치·크기를 조절할 수 있어요.
          </p>

          <div>
            <label className="label">폴라로이드 캡션</label>
            <input
              className="field"
              value={data.photo.caption}
              onChange={(e) => updatePhoto({ caption: e.target.value })}
              placeholder="예) 그날의 햇살"
              maxLength={CAPTION_MAX}
            />
            <CharCounter value={data.photo.caption} max={CAPTION_MAX} />
          </div>

          <div>
            <label className="label">표시 방식</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'normal', label: '일반 표시', desc: '바로 보여요' },
                { key: 'scratch', label: '스크래치 공개', desc: '긁어야 보여요' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => updatePhoto({ displayMode: opt.key })}
                  className={`py-3 px-3 rounded-2xl text-left transition-colors ${
                    data.photo.displayMode === opt.key
                      ? 'bg-accent-pinkDeep text-white'
                      : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                  }`}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      data.photo.displayMode === opt.key
                        ? 'text-white/80'
                        : 'text-ink-500'
                    }`}
                  >
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onAdjust}
              className="py-3 rounded-2xl bg-white border border-cream-200 text-ink-700 text-sm"
            >
              위치 조절
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="py-3 rounded-2xl bg-white border border-cream-200 text-accent-pinkDeep text-sm"
            >
              사진 지우기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 4 ──────────────────────────────────────────────
function Step4({ data, update }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink-900 mb-1">음악과 잠금</h2>
      <p className="text-xs text-ink-500 mb-5">
        받는 사람이 음악과 함께 편지를 읽을 수 있어요.
      </p>

      <div className="space-y-5">
        <div>
          <label className="label">음악 링크 (선택)</label>
          <input
            className="field"
            value={data.musicUrl}
            onChange={(e) => update('musicUrl', e.target.value)}
            placeholder="YouTube / Spotify / mp3 링크"
          />
          <p className="text-xs text-ink-500 mt-2 leading-relaxed">
            mp3 같은 오디오 파일 링크는 레코드판에서 바로 재생돼요.
            <br />
            YouTube · Spotify 링크는 '링크로 듣기' 버튼으로 열려요.
          </p>
        </div>

        <div>
          <label className="label">음악 제목 (선택)</label>
          <input
            className="field"
            value={data.musicTitle}
            onChange={(e) => update('musicTitle', e.target.value)}
            placeholder="예) 우리의 노래"
            maxLength={40}
          />
        </div>

        {data.musicUrl && (
          <div>
            <div className="text-xs text-ink-500 mb-2">미리보기</div>
            <RecordPlayer
              music={{
                src: data.musicUrl,
                title: data.musicTitle,
                isEnabled: true
              }}
            />
          </div>
        )}

        <div className="pt-3 border-t border-cream-200">
          <button
            type="button"
            onClick={() => update('passwordEnabled', !data.passwordEnabled)}
            className="w-full flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3"
          >
            <span className="text-sm font-medium text-ink-700">비밀번호 사용</span>
            <span
              className={`relative w-11 h-6 rounded-full transition-colors ${
                data.passwordEnabled ? 'bg-accent-pinkDeep' : 'bg-cream-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  data.passwordEnabled ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {data.passwordEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 overflow-hidden mt-4"
              >
                <div>
                  <label className="label">비밀번호</label>
                  <input
                    className="field"
                    type="password"
                    value={data.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="우리만 아는 단어"
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="label">비밀번호 힌트</label>
                  <input
                    className="field"
                    value={data.passwordHint}
                    onChange={(e) => update('passwordHint', e.target.value)}
                    placeholder="예) 우리가 처음 만난 카페 이름"
                    maxLength={60}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs text-ink-500 leading-relaxed bg-cream-100 rounded-2xl px-4 py-3 mt-3">
            비밀번호는 보안 기능이 아니라, 우리만 아는 기억으로 편지를 여는 감성 장치예요.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Step 5: Preview ─────────────────────────────────────
function Step5({ data }) {
  const isAnon = data.senderMode === '익명'
  const senderLabel = isAnon
    ? '익명의 마음으로부터'
    : data.senderName || '보내는 사람'
  const hasPhoto = !!data.photo.src
  const hasMusic = !!data.musicUrl

  return (
    <div>
      <h2 className="text-lg font-bold text-ink-900 mb-1">미리보기</h2>
      <p className="text-xs text-ink-500 mb-5">
        받는 사람에게는 이렇게 보여요.
      </p>

      <div className="space-y-4">
        {hasMusic && (
          <RecordPlayer
            music={{
              src: data.musicUrl,
              title: data.musicTitle,
              isEnabled: true
            }}
          />
        )}

        {hasPhoto && (
          <div className="flex justify-center py-2">
            <PolaroidPhotoCard
              photo={{ ...data.photo, caption: data.photo.caption.trim() }}
              rotation={-2.5}
            />
          </div>
        )}

        {hasPhoto && data.photo.displayMode === 'scratch' && (
          <div className="text-[11px] text-ink-500 text-center -mt-2">
            받은 사람에게는 사진이 가려진 상태로 보여요. 긁어서 공개해요.
          </div>
        )}

        <div>
          {data.postItText.trim() && (
            <div className="relative z-10 flex justify-end pr-3 -mb-5">
              <PostItNote
                text={data.postItText}
                rotation={4}
                width={170}
              />
            </div>
          )}
          <LetterPaper colorKey={data.paperColor}>
            <div className="pl-3 relative">
              <div className="text-xs mb-2 opacity-70">
                To. {data.receiverName || '받는 사람'}
              </div>
              <h3 className="text-xl font-bold mb-1 leading-snug">
                {data.title || '편지 제목'}
              </h3>
              {data.subtitle && (
                <p className="text-sm mb-3 opacity-80">{data.subtitle}</p>
              )}
              <div className="text-[15px] whitespace-pre-line leading-[28px] mt-3">
                {data.body || '여기에 편지 내용이 표시돼요.'}
              </div>
              <div className="text-xs text-right mt-6 opacity-70">
                {isAnon ? senderLabel : `From. ${senderLabel}`}
              </div>
            </div>
            <StickerDecoration count={2} size={20} />
          </LetterPaper>
        </div>

        {data.passwordEnabled && (
          <div className="text-xs text-accent-lavenderDeep text-center">
            🔒 이 편지는 비밀번호로 잠겨 있어요
          </div>
        )}
      </div>
    </div>
  )
}
