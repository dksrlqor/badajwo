import PixelWindow from '../pixel/PixelWindow'
import RecordPlayer from '../RecordPlayer'

// pixel_letter — 8비트 픽셀 편지함 세계관의 기본 편지지.
// 픽셀 윈도우 안에 To/제목/본문/사진/음악/From/날짜.
export default function PixelLetterTemplate({ letter }) {
  const photos = Array.isArray(letter?.photos) ? letter.photos : []
  const music = letter?.music || null
  const date = formatDate(letter?.createdAt)

  return (
    <PixelWindow title="♡ LETTER FOR YOU ♡" pop={false}>
      {letter?.recipientName && (
        <div className="mb-3">
          <span className="px-label">TO.</span>{' '}
          <span className="text-[15px] font-bold" style={{ color: 'var(--px-text)' }}>
            {letter.recipientName}
          </span>
        </div>
      )}

      {letter?.title && (
        <h2
          className="text-[17px] font-bold mb-3 leading-snug"
          style={{ color: 'var(--px-heart)' }}
        >
          {letter.title}
        </h2>
      )}

      {/* 음악 */}
      {music && music.originalUrl && (
        <div
          className="mb-4"
          style={{ border: '3px solid var(--px-border)', padding: 6, background: 'var(--px-surface)' }}
        >
          <RecordPlayer music={music} tone="romantic" />
        </div>
      )}

      {/* 본문 — 픽셀 노트 줄 */}
      <p
        className="text-[14px]"
        style={{
          color: 'var(--px-text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: '26px',
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0 25px, rgba(201,111,127,0.16) 25px 26px)',
          backgroundPosition: '0 6px',
          padding: '4px 2px',
          minHeight: 120
        }}
      >
        {letter?.content || ''}
      </p>

      {/* 사진 — 픽셀 프레임 */}
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 justify-items-center">
          {photos.slice(0, 5).map((p, i) => (
            <div
              key={i}
              style={{
                width: '100%',
                border: '3px solid var(--px-border)',
                background: 'var(--px-cream)',
                padding: 5,
                boxShadow: '3px 3px 0 var(--px-shadow)'
              }}
            >
              <img
                src={p.src}
                alt={p.alt || ''}
                draggable={false}
                style={{
                  width: '100%',
                  height: 130,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {p.alt && (
                <div
                  className="text-[10px] text-center mt-1"
                  style={{ color: 'var(--px-deep)' }}
                >
                  {p.alt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <hr className="px-hr" />

      <div className="flex items-end justify-between gap-3">
        <span className="text-[10px]" style={{ color: 'var(--px-deep)' }}>
          {date}
        </span>
        <span className="text-[13px]" style={{ color: 'var(--px-text)' }}>
          from.{' '}
          <b style={{ color: 'var(--px-heart)' }}>
            {letter?.senderName || '익명'}
          </b>
        </span>
      </div>
    </PixelWindow>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}
