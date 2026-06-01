import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createSimpleLetter } from '../utils/storage'
import { parseMusicLink, describeMusic } from '../utils/music'
import { LETTER_TEMPLATES, DEFAULT_TEMPLATE_ID, getTemplateMeta } from '../utils/letterTemplates'
import { loadAndDownscale } from '../utils/imageFile'
import MotionButton from '../components/MotionButton'
import Toast from '../components/Toast'
import { OrnamentLine } from '../components/VintageMail'
import LetterTemplateRenderer from '../components/letterTemplates/LetterTemplateRenderer'

// /quick/new — 간단편지 링크 만들기.
// 내가 직접 편지를 작성하고, 사진/노래/템플릿을 골라서 일회성 공유 링크를 만든다.
// "친구가 나에게 메시지 남기는" 흐름이 아니라 "내가 만든 편지를 친구에게 보여주는" 흐름.
//
// 단계:
//   write     — 받는사람/보내는사람/제목/내용
//   decorate  — 편지지 템플릿/사진/노래
//   preview   — 실제 열람과 동일한 미리보기
//   done      — 링크 생성 완료, 복사/이동
//
// 단계 전환은 motion.div 의 entry 모션만 사용 (라우트/페이즈 단 AnimatePresence 회피).

const NAME_MAX = 30
const TITLE_MAX = 60
const CONTENT_MAX = 4000
const MUSIC_TITLE_MAX = 80
const PHOTO_MAX = 3

const STEPS = ['write', 'decorate', 'preview', 'done']

export default function QuickNew() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState('write')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID)
  const [photos, setPhotos] = useState([])
  const [musicUrl, setMusicUrl] = useState('')
  const [musicTitle, setMusicTitle] = useState('')
  const [parsedMusic, setParsedMusic] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdLetter, setCreatedLetter] = useState(null)
  const [toast, setToast] = useState({ message: '', show: false })

  const showToast = (m) => {
    setToast({ message: m, show: true })
    window.setTimeout(() => setToast({ message: '', show: false }), 2200)
  }

  // 음악 URL 입력될 때마다 파싱 — 너무 자주 호출되어도 가벼움.
  useEffect(() => {
    const trimmed = musicUrl.trim()
    if (!trimmed) {
      setParsedMusic(null)
      return
    }
    setParsedMusic(parseMusicLink(trimmed))
  }, [musicUrl])

  const draftLetter = useMemo(
    () => ({
      recipientName: recipientName.trim() || '소중한 너에게',
      senderName: senderName.trim() || '',
      title: title.trim(),
      content: content.trim(),
      templateId,
      photos,
      music:
        parsedMusic && parsedMusic.originalUrl
          ? { ...parsedMusic, title: musicTitle.trim() }
          : null
    }),
    [recipientName, senderName, title, content, templateId, photos, parsedMusic, musicTitle]
  )

  const goNext = () => {
    setError('')
    if (step === 'write') {
      if (!content.trim()) {
        setError('편지 내용을 한 줄이라도 적어주세요.')
        return
      }
      setStep('decorate')
    } else if (step === 'decorate') {
      setStep('preview')
    } else if (step === 'preview') {
      submit()
    }
  }

  const goPrev = () => {
    setError('')
    if (step === 'write') navigate('/write')
    else if (step === 'decorate') setStep('write')
    else if (step === 'preview') setStep('decorate')
    else if (step === 'done') setStep('preview')
  }

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    await new Promise((r) => window.setTimeout(r, 380))
    const letter = createSimpleLetter(draftLetter, {
      createdByUserId: user?.id || null
    })
    setSubmitting(false)
    if (!letter) {
      setError('편지 링크를 만들지 못했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    setCreatedLetter(letter)
    setStep('done')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-6"
    >
      <TopBar step={step} onBack={goPrev} />

      {step === 'write' && (
        <WriteStep
          recipientName={recipientName}
          senderName={senderName}
          title={title}
          content={content}
          onChange={{ setRecipientName, setSenderName, setTitle, setContent }}
          error={error}
          onNext={goNext}
        />
      )}

      {step === 'decorate' && (
        <DecorateStep
          templateId={templateId}
          onTemplate={setTemplateId}
          photos={photos}
          onPhotos={setPhotos}
          musicUrl={musicUrl}
          onMusicUrl={setMusicUrl}
          musicTitle={musicTitle}
          onMusicTitle={setMusicTitle}
          parsedMusic={parsedMusic}
          showToast={showToast}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}

      {step === 'preview' && (
        <PreviewStep
          letter={draftLetter}
          submitting={submitting}
          error={error}
          onCreate={goNext}
          onPrev={goPrev}
        />
      )}

      {step === 'done' && createdLetter && (
        <DoneStep
          letter={createdLetter}
          onAgain={() => {
            setCreatedLetter(null)
            setRecipientName('')
            setSenderName('')
            setTitle('')
            setContent('')
            setPhotos([])
            setMusicUrl('')
            setMusicTitle('')
            setParsedMusic(null)
            setTemplateId(DEFAULT_TEMPLATE_ID)
            setStep('write')
          }}
          showToast={showToast}
        />
      )}

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

function TopBar({ step, onBack }) {
  const idx = STEPS.indexOf(step)
  return (
    <div className="flex items-center justify-between mb-5">
      <button
        onClick={onBack}
        className="text-sm px-2 py-1 -ml-2"
        style={{
          color: '#5A4538',
          textDecoration: 'underline dashed rgba(92,62,40,0.32)',
          textUnderlineOffset: 4
        }}
      >
        ← 뒤로
      </button>
      <div className="flex items-center gap-1.5" aria-hidden>
        {STEPS.slice(0, 3).map((_, i) => (
          <span
            key={i}
            style={{
              width: i <= idx ? 18 : 8,
              height: 6,
              borderRadius: 3,
              background: i <= idx ? '#3D2E22' : '#E8D5B8',
              transition: 'width 0.3s, background 0.3s'
            }}
          />
        ))}
      </div>
    </div>
  )
}

function StepHeading({ title, sub }) {
  return (
    <div className="text-center mb-6">
      <h1
        className="text-[22px] font-bold"
        style={{
          color: '#3D2E22',
          fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
        }}
      >
        {title}
      </h1>
      <div className="flex justify-center mt-2 mb-2">
        <OrnamentLine width={120} color="#86705E" />
      </div>
      {sub && (
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ── Step 1. 편지 정보 입력 ───────────────────────────────
function WriteStep({ recipientName, senderName, title, content, onChange, error, onNext }) {
  const { setRecipientName, setSenderName, setTitle, setContent } = onChange
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StepHeading
        title="간단편지 링크 만들기"
        sub={
          <>
            마음을 적고, 사진과 노래를 담아
            <br />
            하나의 편지 링크로 보내보세요.
          </>
        }
      />

      <div className="space-y-4 mx-1">
        <PaperField
          label="이 편지는 누구에게 보내나요?"
          hint="받는 사람의 이름을 적어주세요"
        >
          <input
            className="paper-input"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value.slice(0, NAME_MAX))}
            placeholder="받는 사람"
            style={{ fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}
          />
        </PaperField>

        <PaperField
          label="보내는 사람은 누구인가요?"
          hint="비워두면 '익명'으로 전해져요"
        >
          <input
            className="paper-input"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value.slice(0, NAME_MAX))}
            placeholder="보내는 사람"
            style={{ fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}
          />
        </PaperField>

        <PaperField label="편지의 제목을 적어주세요" hint="짧은 한 줄이면 충분해요">
          <input
            className="paper-input"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="편지의 제목"
            style={{ fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}
          />
        </PaperField>

        <PaperField label="전하고 싶은 마음을 천천히 적어주세요" required>
          <textarea
            className="paper-textarea lined-paper w-full min-h-[200px]"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX))}
            placeholder="짧아도 괜찮아요. 지금 떠오르는 마음을 적어보세요."
            style={{
              fontSize: 15,
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              color: '#3D2E22'
            }}
          />
          <div className="text-right text-[11px] mt-1" style={{ color: '#86705E' }}>
            {content.length} / {CONTENT_MAX}
          </div>
        </PaperField>
      </div>

      {error && (
        <div className="text-[12px] text-center mt-3" style={{ color: '#C7443E' }}>
          {error}
        </div>
      )}

      <div className="mt-5">
        <MotionButton variant="primary" onClick={onNext}>
          다음 — 편지지 꾸미기
        </MotionButton>
      </div>
    </motion.section>
  )
}

// ── Step 2. 편지지/사진/음악 꾸미기 ─────────────────────
function DecorateStep({
  templateId,
  onTemplate,
  photos,
  onPhotos,
  musicUrl,
  onMusicUrl,
  musicTitle,
  onMusicTitle,
  parsedMusic,
  showToast,
  onNext,
  onPrev
}) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const onPickFile = () => {
    if (photos.length >= PHOTO_MAX) {
      showToast(`사진은 ${PHOTO_MAX}장까지 첨부할 수 있어요.`)
      return
    }
    fileInputRef.current?.click()
  }

  const onFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // 같은 파일 다시 고를 수 있게
    if (!files.length) return
    setUploading(true)
    const next = [...photos]
    for (const f of files) {
      if (next.length >= PHOTO_MAX) break
      try {
        const dataUrl = await loadAndDownscale(f, 1200, 0.86)
        next.push({
          src: dataUrl,
          alt: '',
          rotation: next.length % 2 === 0 ? -2.5 : 2.5,
          tape: ['kraft', 'pink', 'mint'][next.length % 3]
        })
      } catch {
        showToast('사진을 불러오지 못했어요.')
      }
    }
    onPhotos(next)
    setUploading(false)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StepHeading title="편지지 꾸미기" sub="편지지, 사진, 노래를 골라 편지에 마음을 더해보세요." />

      {/* 템플릿 선택 — 가로 스와이프 카드 */}
      <SectionLabel>어떤 편지지에 담을까요?</SectionLabel>
      <div
        className="flex gap-3 overflow-x-auto pb-2 mb-5 -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {LETTER_TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            selected={t.id === templateId}
            onClick={() => onTemplate(t.id)}
          />
        ))}
      </div>

      {/* 사진 */}
      <SectionLabel>함께 보여주고 싶은 사진이 있나요?</SectionLabel>
      <div
        className="mx-1 mb-5 p-3"
        style={{
          background: '#FBF0DC',
          border: '1.5px dashed rgba(92,62,40,0.28)',
          borderRadius: '6px 8px 5px 9px'
        }}
      >
        {photos.length === 0 ? (
          <p className="text-[12px] text-center leading-relaxed py-2" style={{ color: '#86705E' }}>
            사진은 최대 {PHOTO_MAX}장까지 더할 수 있어요.
            <br />
            없어도 괜찮아요.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div
                key={i}
                className="relative"
                style={{ width: 84, height: 84, flexShrink: 0 }}
              >
                <img
                  src={p.src}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(92,62,40,0.18)'
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    onPhotos(photos.filter((_, j) => j !== i))
                  }
                  aria-label="사진 삭제"
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#3D2E22',
                    color: '#FDF8EE',
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.18)'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <button
            type="button"
            onClick={onPickFile}
            disabled={uploading || photos.length >= PHOTO_MAX}
            className="w-full"
            style={{
              padding: '10px 12px',
              background: '#FDF8EE',
              border: '1.5px dashed rgba(92,62,40,0.32)',
              borderRadius: '5px 7px 4px 6px',
              fontSize: 13,
              color: '#3D2E22',
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              cursor: photos.length >= PHOTO_MAX ? 'not-allowed' : 'pointer',
              opacity: photos.length >= PHOTO_MAX ? 0.6 : 1
            }}
          >
            {uploading
              ? '사진 옮기는 중…'
              : photos.length >= PHOTO_MAX
              ? `사진 ${PHOTO_MAX}장까지 더해졌어요`
              : '+ 사진 더하기'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* 음악 */}
      <SectionLabel>편지와 어울리는 노래 링크를 붙여주세요</SectionLabel>
      <div className="mx-1 mb-2">
        <input
          className="paper-input"
          value={musicUrl}
          onChange={(e) => onMusicUrl(e.target.value.slice(0, 400))}
          placeholder="YouTube 또는 Spotify 링크"
          style={{ fontFamily: 'Georgia, serif' }}
        />
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#86705E' }}>
          Spotify 트랙·플레이리스트, YouTube 영상 링크를 붙여넣을 수 있어요.
        </p>
        {parsedMusic && parsedMusic.originalUrl && (
          <div
            className="mt-2 px-3 py-2 text-[12px]"
            style={{
              background: parsedMusic.canEmbed ? '#EFE7C8' : '#F5E0D8',
              color: '#3D2E22',
              borderRadius: '5px 7px 4px 6px'
            }}
          >
            {parsedMusic.canEmbed ? (
              <>
                <b>{describeMusic(parsedMusic)}</b> · 편지 안에서 바로 들을 수 있어요.
              </>
            ) : (
              <>
                <b>외부 링크</b> · 받는 사람이 새 탭에서 노래를 열어볼 수 있어요.
              </>
            )}
          </div>
        )}
        {parsedMusic && parsedMusic.originalUrl && (
          <input
            className="paper-input mt-2"
            value={musicTitle}
            onChange={(e) => onMusicTitle(e.target.value.slice(0, MUSIC_TITLE_MAX))}
            placeholder="이 곡의 이름 (선택)"
            style={{ fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}
          />
        )}
      </div>

      <div className="mt-6 space-y-3">
        <MotionButton variant="primary" onClick={onNext}>
          다음 — 미리보기
        </MotionButton>
        <MotionButton variant="ghost" onClick={onPrev}>
          내용 다시 적기
        </MotionButton>
      </div>
    </motion.section>
  )
}

// ── Step 3. 미리보기 ────────────────────────────────────
function PreviewStep({ letter, submitting, error, onCreate, onPrev }) {
  const meta = getTemplateMeta(letter.templateId)
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StepHeading
        title="편지 미리보기"
        sub={
          <>
            받는 사람이 링크에서 보게 될 화면이에요.
            <br />
            마음에 들면 링크를 만들어보세요.
          </>
        }
      />

      <div
        className="mx-1 mb-5 px-3 py-2 text-[11px] leading-relaxed"
        style={{
          background: '#FCF096',
          color: '#3D2E22',
          borderRadius: '4px 6px 5px 7px',
          fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
        }}
      >
        <b>미리보기</b> · 편지지: {meta.name} · 이 화면에서는 링크가 만들어지지 않아요.
      </div>

      <div className="mx-0 mb-6">
        <LetterTemplateRenderer letter={letter} />
      </div>

      {error && (
        <div className="text-[12px] text-center mb-3" style={{ color: '#C7443E' }}>
          {error}
        </div>
      )}

      <div className="space-y-3">
        <MotionButton variant="primary" onClick={onCreate} disabled={submitting}>
          {submitting ? '편지 링크 만드는 중…' : '편지 링크 만들기'}
        </MotionButton>
        <MotionButton variant="ghost" onClick={onPrev}>
          꾸미기로 돌아가기
        </MotionButton>
      </div>
    </motion.section>
  )
}

// ── Step 4. 링크 생성 완료 ──────────────────────────────
function DoneStep({ letter, onAgain, showToast }) {
  const navigate = useNavigate()
  const fullUrl = `${window.location.origin}/quick/${letter.code}`

  const copy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl)
      } else {
        const t = document.createElement('textarea')
        t.value = fullUrl
        t.style.position = 'fixed'
        t.style.opacity = '0'
        document.body.appendChild(t)
        t.focus()
        t.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(t)
        if (!ok) throw new Error('copy failed')
      }
      showToast('편지 링크가 복사되었어요. 이제 마음을 보내보세요.')
    } catch {
      showToast('복사에 실패했어요. 직접 선택해주세요.')
    }
  }

  const shareNative = async () => {
    if (!navigator.share) {
      copy()
      return
    }
    try {
      await navigator.share({
        title: '받아줘 편지',
        text: '당신에게 도착한 편지가 있어요.',
        url: fullUrl
      })
    } catch {
      // 사용자 취소 — 무시
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <StepHeading
        title="편지 링크가 만들어졌어요"
        sub={
          <>
            이 링크를 친구에게 보내보세요.
            <br />
            링크를 열면 편지가 펼쳐져요.
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 14, rotate: 1.4 }}
        animate={{ opacity: 1, y: 0, rotate: 1.4 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="mx-1 mb-5 px-4 py-4"
        style={{
          background: '#FBF0DC',
          borderRadius: '4px 6px 5px 7px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.14)'
        }}
      >
        <div
          className="text-[10px] mb-1"
          style={{ color: '#86705E', letterSpacing: '0.22em' }}
        >
          공유할 링크
        </div>
        <div
          className="text-[13px] break-all select-all"
          onClick={(e) => {
            const range = document.createRange()
            range.selectNodeContents(e.currentTarget)
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
          }}
          style={{
            color: '#3D2E22',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.5,
            borderBottom: '1px dashed rgba(92,62,40,0.32)',
            paddingBottom: 6
          }}
        >
          {fullUrl}
        </div>
      </motion.div>

      <div className="space-y-3">
        <MotionButton variant="primary" onClick={copy}>
          링크 복사하기
        </MotionButton>
        {typeof navigator !== 'undefined' && navigator.share && (
          <MotionButton variant="accent" onClick={shareNative}>
            친구에게 바로 보내기
          </MotionButton>
        )}
        <MotionButton
          variant="soft"
          onClick={() => navigate(`/quick/${letter.code}`)}
        >
          편지가 열리는 화면 보기
        </MotionButton>
        <MotionButton variant="ghost" onClick={onAgain}>
          또 한 통 만들기
        </MotionButton>
      </div>

      <p
        className="text-[11px] text-center mt-5 leading-relaxed"
        style={{ color: '#86705E' }}
      >
        이 링크는 받아줘 아이디 없이도 만들 수 있어요.
        <br />
        <Link
          to="/me"
          className="underline mt-1 inline-block"
          style={{
            color: '#5A4538',
            textUnderlineOffset: 3,
            textDecorationStyle: 'dashed'
          }}
        >
          내가 만든 편지 모아보기
        </Link>
      </p>
    </motion.section>
  )
}

// ── 공통 UI ─────────────────────────────────────────────
function PaperField({ label, hint, children, required }) {
  return (
    <div>
      <label
        className="block text-[13px] mb-1"
        style={{
          color: '#3D2E22',
          fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
          fontWeight: 600
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#C7443E', marginLeft: 4 }}>*</span>
        )}
      </label>
      {hint && (
        <div className="text-[11px] mb-1.5" style={{ color: '#86705E' }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div
      className="mx-1 mb-2 text-[12px]"
      style={{
        color: '#5A4538',
        letterSpacing: '0.18em',
        fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
        fontWeight: 600
      }}
    >
      {children}
    </div>
  )
}

function TemplateCard({ template, selected, onClick }) {
  const { swatch } = template
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 text-left relative"
      style={{
        width: 156,
        padding: 12,
        background: '#FDF8EE',
        borderRadius: '6px 8px 5px 9px',
        border: `2px ${selected ? 'solid' : 'dashed'} ${
          selected ? '#3D2E22' : 'rgba(92,62,40,0.22)'
        }`,
        boxShadow: selected
          ? '0 4px 10px rgba(92,62,40,0.16), 0 14px 26px rgba(92,62,40,0.14)'
          : '0 1px 2px rgba(92,62,40,0.08)',
        transform: selected ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
    >
      <div
        aria-hidden
        style={{
          height: 78,
          borderRadius: 6,
          background: `linear-gradient(135deg, ${swatch.paper} 0%, ${swatch.paper} 60%, ${swatch.accent} 60%, ${swatch.accent} 100%)`,
          marginBottom: 8,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)'
        }}
      />
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#3D2E22',
          fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
        }}
      >
        {template.name}
      </div>
      <div
        className="text-[11px] mt-0.5 leading-snug"
        style={{ color: '#86705E' }}
      >
        {template.description}
      </div>
      {selected && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#3D2E22',
            color: '#FDF8EE',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✓
        </div>
      )}
    </button>
  )
}
