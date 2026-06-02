import { motion } from 'framer-motion'
import RecordPlayer from '../RecordPlayer'

// romantic_pink — Pink and Beige Romantic Anniversary Letter A4 PDF 의 구도를 재현.
//
// PDF 구도:
//   배경         : 옅은 아이보리/베이지 종이 텍스처
//   상단         : 큰 검정 필기체 "Thank You" 헤더 (사용자 title 자리)
//   우상단       : 핑크/초록/베이지 줄무늬 와시테이프 (살짝 회전)
//   중앙         : 큰 핑크 베이지 둥근 편지지 박스
//   박스 좌상단  : "My Love,"(핑크 cursive) + 작은 채워진 하트
//   박스 본문    : 좌측 정렬 본문, 줄간격 넓음
//   박스 우하단  : "With all my heart," + 큰 cursive 서명
//   우하단(겹침) : 매우 큰 outline 하트(얇은 핑크 라인) — 박스 위로 살짝 침범
//   좌하단       : 원형 "Love You" 스티커 (오렌지/핑크)
//
// 원본 사진·필기체·스티커 이미지를 그대로 사용하지 않고, CSS·SVG 로 동일 구도를 그렸다.

const SOFT_PAPER_NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 0.04 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

function WashiTape({ width = 88, height = 22, rotate = -12 }) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 1px 3px rgba(120,80,90,0.20)',
        background: [
          'repeating-linear-gradient(90deg, transparent 0 4px, rgba(255,255,255,0.0) 4px 8px)',
          'linear-gradient(180deg, rgba(244,200,210,0.85) 0%, rgba(180,150,140,0.45) 35%, rgba(120,160,120,0.70) 65%, rgba(244,210,190,0.85) 100%)'
        ].join(',')
      }}
    >
      <div
        aria-hidden
        style={{
          width: '100%',
          height: '100%',
          background:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)'
        }}
      />
    </div>
  )
}

function OutlineHeart({ size = 220, color = '#D89BA6', strokeWidth = 1.2 }) {
  // 우하단 큰 outline 하트
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{ display: 'block' }}
    >
      <path
        d="M 50 86 C 12 60 4 36 18 22 C 28 12 40 14 50 26 C 60 14 72 12 82 22 C 96 36 88 60 50 86 Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity="0.62"
      />
    </svg>
  )
}

function SmallHeart({ size = 14, color = '#C04A56' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21 C 4 15 2 9 7 6 C 10 4 12 7 12 8 C 12 7 14 4 17 6 C 22 9 20 15 12 21 Z"
        fill={color}
      />
    </svg>
  )
}

function LoveYouSticker({ size = 70 }) {
  // 좌하단 원형 "Love You" 스티커
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{ filter: 'drop-shadow(0 2px 4px rgba(120,80,90,0.22))' }}
    >
      <defs>
        <radialGradient id="stickerGrad" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#F4D5A8" />
          <stop offset="60%" stopColor="#E0A06A" />
          <stop offset="100%" stopColor="#B86A3C" />
        </radialGradient>
        <path id="stickerArc" d="M 18 50 A 32 32 0 0 1 82 50" />
        <path id="stickerArcBot" d="M 18 54 A 32 32 0 0 0 82 54" />
      </defs>
      <circle cx="50" cy="50" r="38" fill="url(#stickerGrad)" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#A85838" strokeWidth="1" opacity="0.4" />
      <text fill="#A8262E" fontFamily="Georgia, serif" fontSize="12" fontWeight="700" letterSpacing="2">
        <textPath href="#stickerArc" startOffset="50%" textAnchor="middle">
          LOVE
        </textPath>
      </text>
      <text fill="#A8262E" fontFamily="Georgia, serif" fontSize="12" fontWeight="700" letterSpacing="2">
        <textPath href="#stickerArcBot" startOffset="50%" textAnchor="middle">
          YOU
        </textPath>
      </text>
      <g transform="translate(50 50)" fill="#A8262E">
        <path d="M 0 8 C -10 0 -14 -6 -10 -10 C -6 -14 -2 -10 0 -8 C 2 -10 6 -14 10 -10 C 14 -6 10 0 0 8 Z" />
      </g>
    </svg>
  )
}

export default function RomanticPinkTemplate({ letter }) {
  const photos = Array.isArray(letter?.photos) ? letter.photos : []
  const music = letter?.music || null

  return (
    <div
      className="relative w-full"
      style={{
        background: `${SOFT_PAPER_NOISE}, linear-gradient(180deg, #F2E6D2 0%, #ECDDC4 100%)`,
        backgroundBlendMode: 'multiply, normal',
        padding: '24px 12px 36px',
        borderRadius: '4px 6px 5px 7px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 10px rgba(120,80,90,0.12), 0 18px 36px rgba(120,80,90,0.14)',
        overflow: 'hidden'
      }}
    >
      {/* 음악 — 핑크 톤 */}
      {music && music.originalUrl && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-5 mx-1"
        >
          <RecordPlayer music={music} tone="romantic" />
        </motion.div>
      )}

      {/* 상단 헤더 영역 — 큰 필기체 제목 + 우상단 와시테이프 */}
      <div className="relative" style={{ minHeight: 70, marginBottom: 12 }}>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          style={{
            fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 36,
            lineHeight: 1.05,
            color: '#2A201A',
            textAlign: 'center',
            margin: 0,
            letterSpacing: '-0.02em',
            padding: '0 28px'
          }}
        >
          {letter?.title || 'Thank You'}
        </motion.h1>

        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 10,
            right: -8,
            zIndex: 3
          }}
        >
          <WashiTape width={86} height={22} rotate={-14} />
        </div>
      </div>

      {/* 중앙 핑크 박스 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative"
        style={{
          background: `${SOFT_PAPER_NOISE}, linear-gradient(180deg, #F4D9DC 0%, #EFC7CD 60%, #EBB9C0 100%)`,
          backgroundBlendMode: 'multiply, normal',
          borderRadius: 14,
          padding: '20px 18px 24px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.5) inset, 0 2px 6px rgba(120,80,90,0.12), 0 14px 30px rgba(120,80,90,0.14)',
          overflow: 'hidden'
        }}
      >
        {/* 우하단 큰 outline 하트 (배경 장식) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: -36,
            bottom: -54,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <OutlineHeart size={240} color="#D78A98" strokeWidth={1.4} />
        </div>

        {/* "My Love," + 작은 하트 */}
        <div
          className="relative"
          style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}
        >
          <span
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 22,
              color: '#A8333F',
              letterSpacing: '-0.01em'
            }}
          >
            {letter?.recipientName ? `${letter.recipientName},` : 'My Love,'}
          </span>
          <SmallHeart size={14} color="#C04A56" />
        </div>

        {/* 본문 */}
        <p
          className="relative"
          style={{
            zIndex: 1,
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
            fontSize: 13.5,
            lineHeight: '23px',
            color: '#3A2A26',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textAlign: 'left',
            margin: 0
          }}
        >
          {letter?.content || '편지의 내용을 적어주세요.'}
        </p>

        {/* 우하단 서명 */}
        <div
          className="relative"
          style={{
            zIndex: 2,
            marginTop: 22,
            textAlign: 'right',
            color: '#3A2A26'
          }}
        >
          <div style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.78 }}>
            With all my heart,
          </div>
          <div
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 22,
              marginTop: 2,
              color: '#A8333F',
              letterSpacing: '-0.01em'
            }}
          >
            {letter?.senderName || ''}
          </div>
        </div>
      </motion.div>

      {/* 좌하단 Love You 스티커 — 박스 밖, 살짝 박스에 걸치는 위치 */}
      <div
        aria-hidden
        style={{
          position: 'relative',
          marginTop: -18,
          marginLeft: -4,
          zIndex: 4,
          width: 76,
          height: 76,
          transform: 'rotate(-8deg)'
        }}
      >
        <LoveYouSticker size={76} />
      </div>

      {/* 사진들 */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 flex flex-wrap items-start justify-center gap-x-3"
          style={{ rowGap: 24 }}
        >
          {photos.slice(0, 5).map((p, i) => (
            <PinkPolaroid
              key={i}
              src={p.src}
              caption={p.alt || ''}
              rotation={p.rotation ?? (i % 2 === 0 ? -2.5 : 2.5)}
              width={photos.length === 1 ? 220 : 152}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

function PinkPolaroid({ src, caption, rotation = -2, width = 160 }) {
  return (
    <div
      style={{
        width,
        background: '#FFFCF5',
        padding: 9,
        paddingBottom: 26,
        borderRadius: 4,
        boxShadow:
          '0 1px 3px rgba(168, 100, 110, 0.18), 0 12px 26px rgba(168, 100, 110, 0.14), inset 0 1px 0 rgba(255,255,255,0.7)',
        transform: `rotate(${rotation}deg)`,
        position: 'relative'
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -7,
          left: '50%',
          transform: 'translateX(-50%) rotate(-5deg)',
          width: 52,
          height: 14,
          background:
            'repeating-linear-gradient(135deg, rgba(247, 201, 217, 0.92) 0 6px, rgba(255,255,255,0.32) 6px 12px)',
          boxShadow: '0 1px 3px rgba(80,60,50,0.16)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          width: '100%',
          height: width * 0.92,
          background: '#F4E0E4',
          overflow: 'hidden'
        }}
      >
        {src && (
          <img
            src={src}
            alt={caption || ''}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 5,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#A8525B',
            fontSize: 11,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif'
          }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}
