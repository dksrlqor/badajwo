import { motion } from 'framer-motion'
import RecordPlayer from '../RecordPlayer'

// 차분한 포토 편지 — 감사/가족/기타용.
// PDF 원본(Black & White Simple Photo Frame Thank You)의 구도를 참고하되,
// 원본의 하트/문구/사진 프레임을 그대로 가져오지 않고,
// 깨끗한 ivory 종이 + 큰 손글씨 제목 + 단정한 매트보드 사진 프레임으로 새롭게 재해석.
//
// 톤: ivory #FBF7EE / 흑잉크 #2A241D / sage 액센트 #7F8A7A. 흑백 중심.
// 구조: 큰 손글씨 제목 → 본문 → 단정한 세로 사진 매트보드 → 보낸이 서명.

const C = {
  paper: '#FBF7EE',
  paperEdge: '#E8DFCB',
  ink: '#2A241D',
  inkSoft: '#5A5246',
  inkFaint: 'rgba(42, 36, 29, 0.32)',
  sage: '#7F8A7A',
  mat: '#FFFDF7'
}

const NOISE_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.10  0 0 0 0.035 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

function ThinOrnament({ width = 80 }) {
  return (
    <svg width={width} height={10} viewBox="0 0 100 10" aria-hidden>
      <g fill="none" stroke={C.sage} strokeWidth="1" strokeLinecap="round" opacity="0.75">
        <path d="M 6 5 L 38 5" />
        <circle cx="44" cy="5" r="1.2" fill={C.sage} stroke="none" />
        <path d="M 50 5 Q 54 2 58 5 Q 62 8 66 5" />
        <circle cx="56" cy="5" r="0.6" fill={C.sage} stroke="none" />
        <path d="M 70 5 L 94 5" />
      </g>
    </svg>
  )
}

function PhotoMatboard({ src, caption, width = 220, height = 280 }) {
  // 단정한 흰 매트보드 — 폴라로이드와 달리 회전 없고 그림자 절제.
  return (
    <div
      style={{
        width,
        background: C.mat,
        padding: 12,
        paddingBottom: 36,
        boxShadow:
          '0 1px 2px rgba(42,36,29,0.12), 0 14px 26px rgba(42,36,29,0.10), inset 0 0 0 1px rgba(42,36,29,0.06)'
      }}
    >
      <div
        style={{
          width: '100%',
          height,
          background: '#EEE7D8',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {src ? (
          <img
            src={src}
            alt={caption || ''}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.inkFaint,
              fontSize: 12,
              letterSpacing: '0.2em'
            }}
          >
            PHOTO
          </div>
        )}
      </div>
      {caption ? (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: C.inkSoft,
            fontSize: 11,
            letterSpacing: '0.16em',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic'
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  )
}

export default function ClassicPhotoTemplate({ letter }) {
  const photos = Array.isArray(letter?.photos) ? letter.photos : []
  const music = letter?.music || null

  return (
    <div className="relative w-full" style={{ color: C.ink }}>
      {/* 음악 — 정중한 톤, 단정한 카드 */}
      {music && music.originalUrl && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-5"
          style={{
            padding: 10,
            background: '#F5EFE0',
            border: `1px solid ${C.paperEdge}`,
            boxShadow: '0 1px 2px rgba(42,36,29,0.10)'
          }}
        >
          <RecordPlayer music={music} tone="classic" />
        </motion.div>
      )}

      {/* 본문 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18 }}
        style={{
          background: `${NOISE_BG}, ${C.paper}`,
          backgroundBlendMode: 'multiply, normal',
          padding: '32px 26px 30px',
          boxShadow:
            '0 1px 2px rgba(42,36,29,0.10), 0 16px 36px rgba(42,36,29,0.10), inset 0 0 0 1px rgba(42,36,29,0.06)'
        }}
      >
        {/* 상단 라벨 + ornament */}
        <div className="text-center" style={{ color: C.inkSoft }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase'
            }}
          >
            A Letter For You
          </div>
          <div className="flex justify-center mt-2 mb-4">
            <ThinOrnament width={80} />
          </div>
        </div>

        {/* 큰 손글씨 제목 — italic serif */}
        {letter?.title && (
          <h1
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 30,
              lineHeight: 1.2,
              color: C.ink,
              textAlign: 'center',
              margin: '4px 0 18px',
              letterSpacing: '-0.01em'
            }}
          >
            {letter.title}
          </h1>
        )}

        {/* To. — 좌측 정렬 */}
        <div
          style={{
            paddingTop: 6,
            paddingBottom: 6,
            borderTop: `1px solid ${C.paperEdge}`,
            borderBottom: `1px solid ${C.paperEdge}`,
            marginBottom: 16
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.28em',
              color: C.inkSoft
            }}
          >
            DEAR
          </div>
          <div
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 20,
              color: C.ink,
              marginTop: 2
            }}
          >
            {letter?.recipientName || '소중한 당신께'}
          </div>
        </div>

        {/* 본문 */}
        <p
          style={{
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
            fontSize: 15,
            lineHeight: '27px',
            color: C.ink,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {letter?.content || '여기에 마음을 적어주세요.'}
        </p>

        {/* From. — 우측 italic */}
        <div className="mt-8" style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.28em',
              color: C.inkSoft
            }}
          >
            WITH GRATITUDE,
          </div>
          <div
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 22,
              color: C.ink,
              marginTop: 4
            }}
          >
            {letter?.senderName || '익명'}
          </div>
        </div>
      </motion.div>

      {/* 사진 매트보드 — 세로형, 본문 아래 정렬 (모바일 우선). 여러 장이면 가로 정렬. */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-7 flex flex-wrap items-start justify-center gap-x-4 gap-y-6"
          style={{ rowGap: 24 }}
        >
          {photos.slice(0, 3).map((p, i) => (
            <PhotoMatboard
              key={i}
              src={p.src}
              caption={p.alt || ''}
              width={photos.length === 1 ? 240 : 160}
              height={photos.length === 1 ? 300 : 200}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
