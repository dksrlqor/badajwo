import { motion } from 'framer-motion'
import RecordPlayer from '../RecordPlayer'

// photo_frame_minimal — Black & White Simple Photo Frame Wedding Gift Thank You PDF 의 구도를 재현.
//
// PDF 구도:
//   배경         : 거의 흰색 / 옅은 아이보리, 우상단 종이 접힘 코너
//   좌측         : 큰 검정 필기체 헤더 (2줄, "thank" / "you") + 작은 outline 하트
//   좌측 본문    : serif 본문 텍스트, 좌측 정렬
//   우측         : 세로 4~5개 흑백 사진 프레임 스택 (mat board 흰 padding)
//   모바일       : 사진은 본문 아래 2열 그리드로 자연스럽게 떨어짐
//
// 사진이 없을 때도 빈 프레임이 보이도록 placeholder 처리.

const FAINT_NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.20  0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0.03 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

function TinyOutlineHeart({ size = 24, color = '#1a1a1a', strokeWidth = 1.3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21 C 4 15 2 9 7 6 C 10 4 12 7 12 8 C 12 7 14 4 17 6 C 22 9 20 15 12 21 Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FoldedCorner({ size = 56 }) {
  // 우상단 종이가 접힌 듯한 코너 효과
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      aria-hidden
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="foldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E5E0D6" />
        </linearGradient>
      </defs>
      <path d="M 60 0 L 60 32 L 28 0 Z" fill="url(#foldGrad)" />
      <path
        d="M 60 0 L 60 32 L 28 0"
        fill="none"
        stroke="rgba(80,70,55,0.20)"
        strokeWidth="0.6"
      />
      <path d="M 28 0 L 60 32" stroke="rgba(60,50,40,0.16)" strokeWidth="1" fill="none" />
    </svg>
  )
}

function PhotoMat({ src, caption, width = 132, ratio = 1.28, idx = 0 }) {
  // 흑백 사진 mat board — 폴라로이드 회전 없이 단정하게
  const h = Math.round(width * ratio)
  return (
    <div
      style={{
        width,
        background: '#FFFFFF',
        padding: 7,
        paddingBottom: 9,
        boxShadow:
          '0 1px 2px rgba(40,30,20,0.10), 0 6px 14px rgba(40,30,20,0.08), inset 0 0 0 1px rgba(40,30,20,0.04)',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: '100%',
          height: h,
          background: '#E8E4DC',
          overflow: 'hidden',
          filter: src ? 'grayscale(0.18)' : 'none'
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
              color: '#A89F8C',
              fontSize: 10,
              letterSpacing: '0.2em',
              fontFamily: 'Georgia, serif'
            }}
          >
            PHOTO {idx + 1}
          </div>
        )}
      </div>
      {caption ? (
        <div
          style={{
            marginTop: 6,
            textAlign: 'center',
            color: '#3A332B',
            fontSize: 10,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif'
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  )
}

export default function PhotoFrameMinimalTemplate({ letter }) {
  const photos = Array.isArray(letter?.photos) ? letter.photos : []
  const music = letter?.music || null

  // PDF 는 항상 4장 프레임이 보임 → 사용자가 안 채워도 placeholder 로 4장.
  const TARGET = 4
  const filled = photos.slice(0, TARGET)
  const placeholders = Array.from({ length: Math.max(0, TARGET - filled.length) })

  return (
    <div
      className="relative w-full"
      style={{
        background: `${FAINT_NOISE}, linear-gradient(180deg, #FCFAF5 0%, #F6F1E7 100%)`,
        backgroundBlendMode: 'multiply, normal',
        padding: '26px 16px 36px',
        borderRadius: '4px 6px 5px 7px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(40,30,20,0.08), 0 18px 36px rgba(40,30,20,0.10)',
        overflow: 'hidden',
        color: '#1a1a1a'
      }}
    >
      {/* 우상단 종이 접힘 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 3,
          pointerEvents: 'none'
        }}
      >
        <FoldedCorner size={56} />
      </div>

      {/* 음악 */}
      {music && music.originalUrl && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-5"
        >
          <RecordPlayer music={music} tone="classic" />
        </motion.div>
      )}

      {/* 좌측 큰 헤더 + 하트 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        style={{ position: 'relative', marginBottom: 16 }}
      >
        <div
          style={{
            fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 0.95,
            color: '#1a1a1a',
            letterSpacing: '-0.03em'
          }}
        >
          {letter?.title ? (
            <span>{letter.title}</span>
          ) : (
            <>
              <span style={{ display: 'block' }}>thank</span>
              <span style={{ display: 'inline-block', position: 'relative' }}>
                you
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: -28,
                    top: 8,
                    display: 'inline-block'
                  }}
                >
                  <TinyOutlineHeart size={22} />
                </span>
              </span>
            </>
          )}
        </div>
        {letter?.title && (
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              marginLeft: 10,
              verticalAlign: 'middle'
            }}
          >
            <TinyOutlineHeart size={22} />
          </span>
        )}
      </motion.div>

      {/* DEAR + 본문 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        {letter?.recipientName && (
          <div
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontSize: 12,
              letterSpacing: '0.22em',
              color: '#4a4540',
              marginBottom: 6
            }}
          >
            DEAR <span style={{ fontStyle: 'italic', letterSpacing: 0, fontSize: 14, color: '#1a1a1a' }}>
              {letter.recipientName}
            </span>
          </div>
        )}
        <p
          style={{
            fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
            fontSize: 13,
            lineHeight: '22px',
            color: '#1a1a1a',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textAlign: 'left',
            margin: 0
          }}
        >
          {letter?.content || '여기에 마음을 적어주세요.'}
        </p>
        {letter?.senderName && (
          <div
            style={{
              marginTop: 16,
              textAlign: 'right',
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif'
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: '0.22em', color: '#4a4540' }}>
              WITH GRATITUDE,
            </div>
            <div
              style={{
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 22,
                color: '#1a1a1a',
                marginTop: 2,
                letterSpacing: '-0.01em'
              }}
            >
              {letter.senderName}
            </div>
          </div>
        )}
      </motion.div>

      {/* 사진 프레임 — 모바일 2열, 빈 자리는 placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32 }}
        className="mt-6 grid grid-cols-2 gap-3 justify-items-center"
      >
        {filled.map((p, i) => (
          <PhotoMat
            key={`p-${i}`}
            src={p.src}
            caption={p.alt || ''}
            width={144}
            ratio={1.28}
            idx={i}
          />
        ))}
        {placeholders.map((_, i) => (
          <PhotoMat
            key={`ph-${i}`}
            width={144}
            ratio={1.28}
            idx={filled.length + i}
          />
        ))}
      </motion.div>

      {photos.length === 0 && (
        <p
          className="text-center mt-3 text-[11px] leading-relaxed"
          style={{ color: '#7a6f60' }}
        >
          사진을 추가하면 이 자리에 채워져요.
        </p>
      )}
    </div>
  )
}
