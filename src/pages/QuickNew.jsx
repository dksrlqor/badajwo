import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createSimpleLetter } from '../utils/storage'
import { parseMusicLink, describeMusic } from '../utils/music'
import { loadAndDownscale } from '../utils/imageFile'
import Toast from '../components/Toast'
import PixelWindow from '../components/pixel/PixelWindow'
import PixelButton from '../components/pixel/PixelButton'
import PixelCat from '../components/pixel/PixelCat'
import HeartBurst from '../components/pixel/HeartBurst'
import LetterTemplateRenderer from '../components/letterTemplates/LetterTemplateRenderer'

// /one-letter — 일회성 픽셀 편지 만들기.
// 편지 하나를 작성 → 전용 링크(/l/:code) 생성 → 상대에게 전달.
// 받은 편지함과 절대 연결되지 않는 독립 흐름 (simpleLetters).
//
// 단계: write → decorate(선택) → preview → done
// 생성 중에는 고양이가 봉투에 편지를 넣는 모션.

const NAME_MAX = 30
const TITLE_MAX = 60
const CONTENT_MAX = 4000
const MUSIC_TITLE_MAX = 80
const PHOTO_MAX = 5
const STEPS = ['write', 'decorate', 'preview']

export default function QuickNew() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState('write')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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
    window.setTimeout(() => setToast({ message: '', show: false }), 2400)
  }

  useEffect(() => {
    const trimmed = musicUrl.trim()
    setParsedMusic(trimmed ? parseMusicLink(trimmed) : null)
  }, [musicUrl])

  const draftLetter = useMemo(
    () => ({
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
      title: title.trim(),
      content: content.trim(),
      templateId: 'pixel_letter',
      photos,
      music:
        parsedMusic && parsedMusic.originalUrl
          ? { ...parsedMusic, title: musicTitle.trim() }
          : null,
      createdAt: Date.now()
    }),
    [recipientName, senderName, title, content, photos, parsedMusic, musicTitle]
  )

  const goNext = () => {
    setError('')
    if (step === 'write') {
      if (!content.trim()) {
        setError('한 줄이라도 괜찮아요. 마음을 적어주세요.')
        return
      }
      setStep('decorate')
    } else if (step === 'decorate') setStep('preview')
    else if (step === 'preview') submit()
  }

  const goPrev = () => {
    setError('')
    if (step === 'write') navigate('/')
    else if (step === 'decorate') setStep('write')
    else if (step === 'preview') setStep('decorate')
  }

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      // 고양이가 봉투에 넣는 모션을 잠깐 보여주기 위한 최소 시간
      const [letter] = await Promise.all([
        createSimpleLetter(draftLetter, { createdByUserId: user?.id || null }),
        new Promise((r) => window.setTimeout(r, 900))
      ])
      if (!letter) {
        setError('편지를 봉투에 넣지 못했어요. 잠시 후 다시 시도해주세요.')
        return
      }
      setCreatedLetter(letter)
      setStep('done')
    } catch {
      setError('편지를 봉투에 넣지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // 생성 중 — 고양이가 봉투에 편지 넣는 중
  if (submitting) {
    return (
      <div className="pt-16 text-center">
        <PixelWindow title="♡ One Letter ♡">
          <div className="flex flex-col items-center py-6">
            <PixelCat state="envelope" px={6} />
            <p className="mt-5 text-[13px]" style={{ color: 'var(--px-text)' }}>
              고양이가 편지를 봉투에 넣는 중이에요...
            </p>
          </div>
        </PixelWindow>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2"
    >
      <TopBar step={step} onBack={goPrev} />

      {step === 'write' && (
        <PixelWindow title="♡ One Letter ♡">
          <div className="flex justify-center mb-4">
            <PixelCat state="heart-sit" px={5} />
          </div>
          <p
            className="text-[12px] text-center leading-relaxed mb-5"
            style={{ color: 'var(--px-deep)' }}
          >
            편지 하나를 만들어 전용 링크로 보내요.
            <br />
            전용 링크는 24시간 동안만 열 수 있어요.
            <br />
            받은 편지함과는 연결되지 않는 한 통이에요.
          </p>

          <Field label="To. 받을 사람">
            <input
              className="px-input"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value.slice(0, NAME_MAX))}
              placeholder="받는 사람 (비워도 돼요)"
            />
          </Field>
          <Field label="From. 보내는 사람">
            <input
              className="px-input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value.slice(0, NAME_MAX))}
              placeholder="비워두면 익명으로 전해져요"
            />
          </Field>
          <Field label="편지 제목 (선택)">
            <input
              className="px-input"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="짧은 한 줄"
            />
          </Field>
          <Field label="편지 내용" required>
            <textarea
              className="px-textarea min-h-[190px]"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX))}
              placeholder="여기에 마음을 조심히 적어주세요..."
            />
            <div className="text-right text-[11px] mt-1" style={{ color: 'var(--px-deep)' }}>
              {content.length} / {CONTENT_MAX}
            </div>
          </Field>

          {error && <ErrorLine text={error} />}

          <PixelButton variant="deep" onClick={goNext}>
            다음 — 꾸미기
          </PixelButton>
        </PixelWindow>
      )}

      {step === 'decorate' && (
        <PixelWindow title="♡ 꾸미기 (선택) ♡">
          <PhotoSection photos={photos} onPhotos={setPhotos} showToast={showToast} />
          <MusicSection
            musicUrl={musicUrl}
            onMusicUrl={setMusicUrl}
            musicTitle={musicTitle}
            onMusicTitle={setMusicTitle}
            parsedMusic={parsedMusic}
          />
          <div className="mt-5 space-y-3">
            <PixelButton variant="deep" onClick={goNext}>
              다음 — 미리보기
            </PixelButton>
            <PixelButton variant="ghost" onClick={goPrev}>
              내용 다시 적기
            </PixelButton>
          </div>
        </PixelWindow>
      )}

      {step === 'preview' && (
        <div>
          <div className="px-label mb-3">
            미리보기 — 받는 사람이 보게 될 편지예요
          </div>
          <LetterTemplateRenderer letter={draftLetter} />
          {error && <ErrorLine text={error} />}
          <div className="mt-5 space-y-3">
            <PixelButton variant="deep" onClick={goNext} disabled={submitting}>
              ♥ 편지 봉투에 넣기
            </PixelButton>
            <PixelButton variant="ghost" onClick={goPrev}>
              꾸미기로 돌아가기
            </PixelButton>
          </div>
        </div>
      )}

      {step === 'done' && createdLetter && (
        <DoneStep
          letter={createdLetter}
          showToast={showToast}
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
            setStep('write')
          }}
        />
      )}

      <Toast message={toast.message} show={toast.show} />
    </motion.div>
  )
}

function TopBar({ step, onBack }) {
  const idx = STEPS.indexOf(step)
  if (step === 'done') return null
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onBack}
        className="px-btn px-btn-ghost px-btn-sm"
        style={{ width: 'auto' }}
      >
        ← 뒤로
      </button>
      <div className="flex items-center gap-1.5" aria-hidden>
        {STEPS.map((_, i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              background: i <= idx ? 'var(--px-heart)' : 'var(--px-surface)',
              border: '2px solid var(--px-border)'
            }}
          />
        ))}
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="mb-4">
      <div className="text-[12px] font-bold mb-1.5" style={{ color: 'var(--px-text)' }}>
        {label}
        {required && <span style={{ color: 'var(--px-heart)' }}> *</span>}
      </div>
      {children}
    </div>
  )
}

function ErrorLine({ text }) {
  return (
    <div className="text-[12px] text-center mb-3" style={{ color: '#b0413e' }}>
      {text}
    </div>
  )
}

function PhotoSection({ photos, onPhotos, showToast }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const onPickFile = () => {
    if (photos.length >= PHOTO_MAX) {
      showToast(`사진은 ${PHOTO_MAX}장까지 더할 수 있어요.`)
      return
    }
    fileInputRef.current?.click()
  }

  const onFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setUploading(true)
    const next = [...photos]
    for (const f of files) {
      if (next.length >= PHOTO_MAX) break
      try {
        const dataUrl = await loadAndDownscale(f, 1200, 0.86)
        next.push({ src: dataUrl, alt: '' })
      } catch {
        showToast('사진을 불러오지 못했어요.')
      }
    }
    onPhotos(next)
    setUploading(false)
  }

  return (
    <div className="mb-5">
      <div className="text-[12px] font-bold mb-1.5" style={{ color: 'var(--px-text)' }}>
        사진 더하기 (최대 {PHOTO_MAX}장)
      </div>
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {photos.map((p, i) => (
            <div key={i} className="relative" style={{ width: 76, height: 76 }}>
              <img
                src={p.src}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  border: '3px solid var(--px-border)'
                }}
              />
              <button
                type="button"
                onClick={() => onPhotos(photos.filter((_, j) => j !== i))}
                aria-label="사진 삭제"
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 22,
                  height: 22,
                  background: 'var(--px-deep)',
                  color: 'var(--px-cream)',
                  border: '2px solid var(--px-border)',
                  fontSize: 12,
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <PixelButton
        variant="cream"
        size="sm"
        onClick={onPickFile}
        disabled={uploading || photos.length >= PHOTO_MAX}
        style={{ width: '100%' }}
      >
        {uploading
          ? '사진 옮기는 중...'
          : photos.length >= PHOTO_MAX
          ? `사진 ${PHOTO_MAX}장이 가득 찼어요`
          : '+ 사진 고르기'}
      </PixelButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

function MusicSection({ musicUrl, onMusicUrl, musicTitle, onMusicTitle, parsedMusic }) {
  return (
    <div>
      <div className="text-[12px] font-bold mb-1.5" style={{ color: 'var(--px-text)' }}>
        함께 들을 노래 (선택)
      </div>
      <input
        className="px-input"
        value={musicUrl}
        onChange={(e) => onMusicUrl(e.target.value.slice(0, 400))}
        placeholder="YouTube 또는 Spotify 링크"
      />
      {parsedMusic && parsedMusic.originalUrl && (
        <>
          <div
            className="mt-2 px-3 py-2 text-[12px]"
            style={{
              background: parsedMusic.canEmbed ? 'var(--px-surface)' : '#FCEBDD',
              border: '2px solid var(--px-border)'
            }}
          >
            {parsedMusic.canEmbed ? (
              <>
                <b>{describeMusic(parsedMusic)}</b> · 편지 안에서 바로 들을 수 있어요.
              </>
            ) : (
              <>
                <b>외부 링크</b> · 받는 사람이 새 탭에서 열어 듣게 돼요.
              </>
            )}
          </div>
          <input
            className="px-input mt-2"
            value={musicTitle}
            onChange={(e) => onMusicTitle(e.target.value.slice(0, MUSIC_TITLE_MAX))}
            placeholder="곡 이름 (선택)"
          />
        </>
      )}
    </div>
  )
}

function DoneStep({ letter, onAgain, showToast }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fullUrl = `${window.location.origin}/l/${letter.code}`
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    setBurst(Date.now())
  }, [])

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
      setBurst(Date.now())
      showToast('전용 편지 링크가 복사되었어요 ♡')
    } catch {
      showToast('복사에 실패했어요. 링크를 직접 선택해주세요.')
    }
  }

  return (
    <PixelWindow title="♡ Pixel Letter ♡">
      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <PixelCat state="heart-hug" px={6} />
          <HeartBurst trigger={burst} />
        </div>
        <h2
          className="mt-4 text-[16px] font-bold leading-relaxed"
          style={{ color: 'var(--px-text)' }}
        >
          고양이가 편지를 봉투에 넣었어요 ♡
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
          이 편지는 24시간 동안만 열 수 있어요.
          <br />
          링크를 복사해서 상대에게 보내주세요.
        </p>

        <div
          className="w-full mt-4 px-3 py-3 text-[12px] px-break-url select-all"
          onClick={(e) => {
            const range = document.createRange()
            range.selectNodeContents(e.currentTarget)
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
          }}
          style={{
            background: 'var(--px-cream)',
            border: '3px solid var(--px-border)',
            boxShadow: 'inset 3px 3px 0 rgba(158,92,100,0.10)',
            color: 'var(--px-text)'
          }}
        >
          {fullUrl}
        </div>

        <div className="w-full mt-4 space-y-3">
          <PixelButton variant="deep" onClick={copy}>
            ♥ 링크 복사하기
          </PixelButton>
          <PixelButton variant="cream" onClick={() => navigate(`/l/${letter.code}`)}>
            편지가 열리는 화면 보기
          </PixelButton>
          <PixelButton variant="surface" onClick={onAgain}>
            새 편지 만들기
          </PixelButton>
          {!user?.username && (
            <PixelButton variant="ghost" onClick={() => navigate('/login')}>
              내 편지함 만들기
            </PixelButton>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed" style={{ color: 'var(--px-deep)' }}>
          링크를 아는 사람만 이 편지를 볼 수 있고, 만든 지 24시간이 지나면 만료돼요.
          {user?.username && (
            <>
              {' '}
              <Link
                to="/me"
                className="underline"
                style={{ color: 'var(--px-text)', textUnderlineOffset: 3 }}
              >
                내 편지함으로
              </Link>
            </>
          )}
        </p>
      </div>
    </PixelWindow>
  )
}
