import { motion } from 'framer-motion'
import RecordPlayer from '../RecordPlayer'

// vintage_scrapbook — Beige Brown Scrapbook Vintage Thank You Letter PDF 의 구도를 재현.
//
// PDF 구도(좌상→우하):
//   배경       : 짙은 베이지/카키 톤 종이 위, 흐릿한 타이프라이터 텍스트 그림
//   좌상단     : 빨간 리본/실이 종이를 관통하는 듯한 장식
//   우상단     : 베이지 색지 조각 (손글씨 squiggly 라인)
//   중앙       : 찢어진 가장자리의 아이보리 편지지
//   편지지 상단: 큰 필기체 제목
//   편지지 본문: 좌측 정렬 serif, "Dear …" 본문
//   편지지 우하단: 날짜 + With Regards + 서명
//   좌하단     : 작은 분홍 장미 + 잎사귀
//   중앙 하단  : 거친 빨간 잉크 하트 stain
//   우하단     : 베이지 종이 조각 위에 노란 마스킹테이프
//
// 원본의 사진/하트/꽃/지도 조각/폰트/문구를 그대로 사용하지 않고,
// CSS·SVG·gradient 로 동일 구도와 분위기를 직접 그렸다.

const PAPER_NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.30  0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

const FAINT_TYPEWRITER =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><g font-family='Georgia,serif' font-size='9' fill='%235a3f24' opacity='0.10'><text x='10' y='22'>thank you so very much for the kind</text><text x='10' y='52' transform='rotate(-1 10 52)'>days we spent together last summer</text><text x='10' y='84'>i still remember the small letters you</text><text x='10' y='118'>used to leave on the kitchen table</text><text x='10' y='150' transform='rotate(0.5 10 150)'>with the morning light coming in</text><text x='10' y='184'>and the radio playing quietly behind</text><text x='10' y='216'>i hope to see you again very soon</text><text x='10' y='250'>love from the old desk by the window</text><text x='10' y='282'>thank you so very much for the kind</text></g></svg>\")"

// 찢어진 가장자리 — 비대칭 polygon clip-path 로 종이 가장자리가 살짝 갈라진 느낌
const TORN_CLIP =
  'polygon(2% 1%, 8% 0%, 15% 2%, 24% 0%, 33% 2%, 44% 0%, 53% 2%, 64% 0%, 75% 1%, 86% 0%, 95% 2%, 99% 5%, 100% 12%, 98% 22%, 100% 33%, 99% 44%, 100% 55%, 99% 66%, 100% 77%, 99% 88%, 100% 94%, 96% 99%, 88% 100%, 78% 98%, 67% 100%, 55% 99%, 44% 100%, 32% 98%, 22% 100%, 12% 99%, 4% 100%, 0% 94%, 1% 84%, 0% 72%, 1% 60%, 0% 48%, 1% 36%, 0% 24%, 1% 12%, 2% 6%)'

// ─── 장식 컴포넌트 ───────────────────────────────────────

function RibbonCorner({ rotate = -16, scale = 1 }) {
  // 좌상단 빨간 리본 + 종이를 관통하는 실 느낌
  return (
    <svg
      width={120 * scale}
      height={100 * scale}
      viewBox="0 0 120 100"
      aria-hidden
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: 'center' }}
    >
      <defs>
        <linearGradient id="ribbonRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D24F3A" />
          <stop offset="60%" stopColor="#A6362A" />
          <stop offset="100%" stopColor="#8A2A22" />
        </linearGradient>
      </defs>
      {/* 종이 위에 살짝 떠 있는 리본 그림자 */}
      <g filter="url(#riboShadow)" />
      {/* 매듭 끈 — 종이를 한 번 통과한 듯 */}
      <path
        d="M 12 50 Q 30 32 48 50 Q 64 64 84 48"
        stroke="#8A2A22"
        strokeWidth="2.5"
        fill="none"
        opacity="0.92"
      />
      {/* 리본 본체 — 살짝 휘어진 직사각형 */}
      <path
        d="M 14 56 Q 8 70 14 88 L 50 100 Q 56 86 50 68 Z"
        fill="url(#ribbonRed)"
        opacity="0.95"
      />
      {/* 리본 끝 — 갈라진 모양 */}
      <path
        d="M 14 88 L 22 100 L 32 92 L 42 100 L 50 100"
        fill="#A6362A"
        opacity="0.92"
      />
      {/* 하이라이트 */}
      <path
        d="M 18 60 Q 16 76 22 90"
        stroke="rgba(255,255,255,0.32)"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  )
}

function ScrapPaper({
  width = 110,
  height = 64,
  rotate = -4,
  color = '#D6BE92',
  scribble = true
}) {
  // 손글씨 squiggly 라인이 살짝 보이는 베이지 종이 조각
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        background: `linear-gradient(180deg, ${color} 0%, #C0A678 100%)`,
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          '0 1px 2px rgba(74,51,32,0.18), 0 6px 14px rgba(74,51,32,0.12), inset 0 1px 0 rgba(255,255,255,0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {scribble && (
        <svg
          viewBox="0 0 110 64"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g
            fill="none"
            stroke="#5a3f24"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.38"
          >
            <path d="M 8 14 Q 20 10 32 14 Q 44 18 56 14 Q 70 10 86 14" />
            <path d="M 8 26 Q 22 22 38 26 Q 52 30 68 26 Q 82 22 96 26" />
            <path d="M 8 38 Q 22 34 36 38 Q 50 42 64 38 Q 76 34 88 38" />
            <path d="M 8 50 Q 18 46 30 50 Q 42 54 54 50 Q 66 46 80 50" />
          </g>
        </svg>
      )}
    </div>
  )
}

function PinkRose({ size = 56, rotate = -8 }) {
  // 좌하단 작은 분홍 장미 + 잎
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden
      style={{ transform: `rotate(${rotate}deg)`, filter: 'drop-shadow(0 2px 4px rgba(74,51,32,0.18))' }}
    >
      <defs>
        <radialGradient id="petalGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F4B3B8" />
          <stop offset="60%" stopColor="#D88087" />
          <stop offset="100%" stopColor="#B25661" />
        </radialGradient>
      </defs>
      {/* 잎사귀 좌측 */}
      <path
        d="M 14 56 Q 4 50 8 36 Q 22 38 24 52 Z"
        fill="#7F8F4F"
        opacity="0.92"
      />
      <path
        d="M 14 56 Q 12 46 18 40"
        stroke="#5d6c3a"
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
      {/* 잎사귀 우측 */}
      <path
        d="M 60 58 Q 74 52 72 38 Q 56 40 52 54 Z"
        fill="#94A45D"
        opacity="0.92"
      />
      {/* 꽃 봉오리 — 겹친 꽃잎 */}
      <g>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <ellipse
            key={deg}
            cx="40"
            cy="22"
            rx="9"
            ry="13"
            fill="url(#petalGrad)"
            transform={`rotate(${deg} 40 32)`}
            opacity={0.88 - (i % 3) * 0.05}
          />
        ))}
        <ellipse cx="40" cy="32" rx="7" ry="7" fill="#9F4855" opacity="0.92" />
        <ellipse cx="40" cy="30" rx="3" ry="3" fill="#7A2F3B" />
      </g>
    </svg>
  )
}

function InkHeart({ size = 80, rotate = -6 }) {
  // 중앙 하단 빨간 잉크 하트 — 거친 path + opacity 로 잉크 느낌 (filter 미사용으로 가볍게)
  return (
    <svg
      width={size}
      height={size * 0.92}
      viewBox="0 0 100 92"
      aria-hidden
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <defs>
        <radialGradient id="inkHeartGrad" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#D04434" />
          <stop offset="55%" stopColor="#A8261C" />
          <stop offset="100%" stopColor="#7A1A14" />
        </radialGradient>
      </defs>
      {/* 거친 잉크 하트 — path 자체를 살짝 들쭉날쭉하게 */}
      <path
        d="M 50 88 C 16 64 2 40 16 24 C 22 16 32 14 40 18 C 46 20 49 24 50 28 C 51 24 54 20 60 18 C 68 14 78 16 84 24 C 98 40 84 64 50 88 Z"
        fill="url(#inkHeartGrad)"
        opacity="0.92"
      />
      <path
        d="M 50 88 C 16 64 2 40 16 24 C 22 16 32 14 40 18 C 46 20 49 24 50 28 C 51 24 54 20 60 18 C 68 14 78 16 84 24 C 98 40 84 64 50 88 Z"
        fill="#7A1A14"
        opacity="0.18"
        transform="translate(1.5, 1.2)"
      />
      {/* 작은 splatter */}
      <circle cx="12" cy="18" r="2.6" fill="#A8261C" opacity="0.72" />
      <circle cx="90" cy="22" r="1.8" fill="#A8261C" opacity="0.62" />
      <circle cx="20" cy="78" r="2" fill="#7A1A14" opacity="0.55" />
      <circle cx="84" cy="76" r="1.2" fill="#7A1A14" opacity="0.45" />
    </svg>
  )
}

function YellowTape({ width = 90, height = 22, rotate = 22 }) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        background:
          'repeating-linear-gradient(135deg, rgba(245, 215, 100, 0.92) 0 7px, rgba(255,255,255,0.32) 7px 14px)',
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 1px 3px rgba(74,51,32,0.20)'
      }}
    />
  )
}

// ─── 메인 템플릿 ────────────────────────────────────────

export default function VintageScrapbookTemplate({ letter }) {
  const photos = Array.isArray(letter?.photos) ? letter.photos : []
  const music = letter?.music || null
  const dateLabel = formatDate(letter?.createdAt || letter?.date)

  return (
    <div
      className="relative w-full"
      style={{
        background: `${PAPER_NOISE}, ${FAINT_TYPEWRITER}, linear-gradient(160deg, #B19676 0%, #A88E68 50%, #8E7553 100%)`,
        backgroundBlendMode: 'multiply, normal, normal',
        padding: '36px 14px 56px',
        borderRadius: '4px 6px 5px 7px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 10px rgba(74,51,32,0.18), 0 18px 36px rgba(74,51,32,0.18)',
        overflow: 'hidden'
      }}
    >
      {/* 음악 — 베이지 종이 위에 카드처럼 */}
      {music && music.originalUrl && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-5 mx-1"
        >
          <RecordPlayer music={music} tone="scrapbook" />
        </motion.div>
      )}

      {/* 종이 + 장식 컨테이너 */}
      <div className="relative" style={{ minHeight: 420 }}>
        {/* 좌상단 빨간 리본 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -10,
            left: -18,
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          <RibbonCorner rotate={-14} scale={0.85} />
        </div>

        {/* 우상단 베이지 종이 조각 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -8,
            right: -6,
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          <ScrapPaper width={88} height={50} rotate={8} color="#CFB386" />
        </div>

        {/* 중앙 찢어진 아이보리 종이 */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{
            position: 'relative',
            margin: '8px auto 0',
            background: `${PAPER_NOISE}, linear-gradient(180deg, #FAF3E0 0%, #F4EAD0 100%)`,
            backgroundBlendMode: 'multiply, normal',
            clipPath: TORN_CLIP,
            padding: '34px 22px 56px',
            zIndex: 2,
            filter: 'drop-shadow(0 3px 4px rgba(74,51,32,0.22)) drop-shadow(0 12px 22px rgba(74,51,32,0.14))'
          }}
        >
          {/* 상단 큰 제목 */}
          <h1
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 36,
              lineHeight: 1,
              color: '#3a2614',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              margin: '4px 0 18px',
              textShadow: '0 1px 0 rgba(255,255,255,0.4)'
            }}
          >
            {letter?.title || 'Thank You'}
          </h1>

          {/* Dear */}
          <div style={{ color: '#3a2614', fontFamily: 'Georgia, "Apple SD Gothic Neo", serif', fontSize: 13, marginBottom: 12 }}>
            <span style={{ fontStyle: 'italic' }}>Dear </span>
            <span style={{ fontWeight: 700 }}>
              {letter?.recipientName || 'Friend'}
            </span>
          </div>

          {/* 본문 */}
          <p
            style={{
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
              fontSize: 13.5,
              lineHeight: '22px',
              color: '#3a2614',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textAlign: 'left'
            }}
          >
            {letter?.content || '여기에 마음을 적어주세요.'}
          </p>

          {/* 우하단 날짜 + 서명 */}
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
              color: '#3a2614',
              fontFamily: 'Georgia, "Apple SD Gothic Neo", serif'
            }}
          >
            <div style={{ fontSize: 10, lineHeight: 1.4, opacity: 0.78 }}>
              {dateLabel && (
                <>
                  <div style={{ letterSpacing: '0.18em' }}>{dateLabel}</div>
                </>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontStyle: 'italic', opacity: 0.7 }}>
                Best Regards,
              </div>
              <div
                style={{
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 22,
                  marginTop: 2,
                  letterSpacing: '-0.01em'
                }}
              >
                {letter?.senderName || ''}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 좌하단 분홍 장미 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -14,
            left: -2,
            zIndex: 6,
            pointerEvents: 'none'
          }}
        >
          <PinkRose size={64} rotate={-12} />
        </div>

        {/* 중앙 하단 빨간 잉크 하트 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 6,
            pointerEvents: 'none'
          }}
        >
          <InkHeart size={72} rotate={-4} />
        </div>

        {/* 우하단 베이지 종이 조각 + 노란 테이프 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -10,
            right: -8,
            zIndex: 6,
            pointerEvents: 'none'
          }}
        >
          <div style={{ position: 'relative', width: 110, height: 76 }}>
            <ScrapPaper width={104} height={62} rotate={-10} color="#CDB084" scribble={false} />
            <div style={{ position: 'absolute', top: -6, left: 10 }}>
              <YellowTape width={80} height={18} rotate={18} />
            </div>
          </div>
        </div>
      </div>

      {/* 사진들 — vintage_scrapbook 에서는 종이 아래 폴라로이드처럼 흩뿌리듯 */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="relative mt-10 flex flex-wrap items-start justify-center gap-x-3 gap-y-6"
          style={{ rowGap: 28, zIndex: 4 }}
        >
          {photos.slice(0, 5).map((p, i) => (
            <ScrapbookPolaroid
              key={i}
              src={p.src}
              caption={p.alt || ''}
              rotation={p.rotation ?? (i % 2 === 0 ? -3.2 : 2.8)}
              width={photos.length === 1 ? 220 : 148}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

function ScrapbookPolaroid({ src, caption, rotation = -3, width = 150 }) {
  return (
    <div
      style={{
        width,
        background: '#FAF3E0',
        padding: 8,
        paddingBottom: 24,
        transform: `rotate(${rotation}deg)`,
        boxShadow:
          '0 1px 3px rgba(74,51,32,0.18), 0 12px 28px rgba(74,51,32,0.14), inset 0 1px 0 rgba(255,255,255,0.5)',
        position: 'relative'
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -7,
          left: '50%',
          transform: 'translateX(-50%) rotate(-4deg)',
          width: 52,
          height: 14,
          background:
            'repeating-linear-gradient(135deg, rgba(245, 215, 100, 0.92) 0 6px, rgba(255,255,255,0.32) 6px 12px)',
          boxShadow: '0 1px 3px rgba(74,51,32,0.20)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          width: '100%',
          height: width * 0.85,
          background: '#E2D2A8',
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
            bottom: 4,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#6a4a28',
            fontSize: 10,
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

function formatDate(ts) {
  if (!ts) return ''
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  if (isNaN(d.getTime())) return ''
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
