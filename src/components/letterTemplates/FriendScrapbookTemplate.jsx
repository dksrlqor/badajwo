import { motion } from 'framer-motion'
import MaskingTape from '../MaskingTape'
import PolaroidPhotoCard from '../PolaroidPhotoCard'
import RecordPlayer from '../RecordPlayer'

// 따뜻한 스크랩북 — 친구용 편지지.
// PDF 원본(Beige Brown Scrapbook Thank You)의 분위기를 참고하되,
// 원본의 사진/지도 조각/꽃/하트 일러스트는 사용하지 않고,
// CSS 도형 + 직접 그린 미니 SVG 로 새롭게 재해석.
//
// 톤: 베이지 종이(#F1E2C8), 브라운 잉크(#4A3320), 다양한 톤의 마스킹 테이프.
// 구조: 살짝 회전한 본문 카드, 가장자리 테이프, 본문 아래 폴라로이드 가로 스크롤,
//      구석에 작은 종이 메모/스티커, 본문 좌상단 작은 꽃 마크.

const C = {
  paper: '#F1E2C8',
  paperEdge: '#E2D0AE',
  ink: '#4A3320',
  inkSoft: '#7A5A3D',
  inkFaint: 'rgba(74, 51, 32, 0.42)',
  accent: '#A67A4A'
}

const NOISE_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.30  0 0 0 0 0.21  0 0 0 0 0.12  0 0 0 0.07 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

function TinyFlower({ size = 16, color = C.accent, leaf = '#7F8A55' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <g opacity="0.85">
        <path d="M 10 20 Q 10 14 10 8" stroke={leaf} strokeWidth="1" fill="none" />
        <ellipse cx="6" cy="14" rx="3" ry="1.2" fill={leaf} transform="rotate(-25 6 14)" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="10"
            cy="3.5"
            rx="1.6"
            ry="3.4"
            fill={color}
            transform={`rotate(${deg} 10 7)`}
          />
        ))}
        <circle cx="10" cy="7" r="1.6" fill="#7A4A24" />
      </g>
    </svg>
  )
}

function PaperScrap({ rotation = -6, color = '#E8D2A8', width = 64, height = 38, children, style = {} }) {
  return (
    <div
      aria-hidden={!children}
      style={{
        width,
        height,
        background: color,
        transform: `rotate(${rotation}deg)`,
        boxShadow:
          '0 1px 2px rgba(74, 51, 32, 0.18), 0 4px 8px rgba(74, 51, 32, 0.10), inset 0 1px 0 rgba(255,255,255,0.4)',
        position: 'relative',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export default function FriendScrapbookTemplate({ letter }) {
  const photos = Array.isArray(letter?.photos) ? letter.photos : []
  const music = letter?.music || null

  return (
    <div className="relative w-full" style={{ color: C.ink }}>
      {/* 음악 — 상단, 마스킹테이프로 살짝 붙인 듯한 느낌 */}
      {music && music.originalUrl && (
        <motion.div
          initial={{ opacity: 0, y: -6, rotate: -1.4 }}
          animate={{ opacity: 1, y: 0, rotate: -1.4 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-5"
        >
          <MaskingTape
            color="kraft"
            rotation={-8}
            width={62}
            height={14}
            className="absolute -top-2 left-6 z-10"
            style={{ transform: 'rotate(-8deg)' }}
          />
          <RecordPlayer music={music} tone="scrapbook" />
        </motion.div>
      )}

      {/* 본문 카드 — 종이 결 + 미세 회전 */}
      <motion.div
        initial={{ opacity: 0, y: 12, rotate: -0.6 }}
        animate={{ opacity: 1, y: 0, rotate: -0.6 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="relative"
        style={{
          background: `${NOISE_BG}, linear-gradient(180deg, ${C.paper} 0%, #ECD9B7 100%)`,
          backgroundBlendMode: 'multiply, normal',
          padding: '26px 22px 28px',
          borderRadius: '6px 8px 5px 9px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.55) inset, 0 2px 6px rgba(74,51,32,0.16), 0 18px 36px rgba(74,51,32,0.14)'
        }}
      >
        {/* 상단 테이프 두 개 */}
        <MaskingTape
          color="kraft"
          rotation={-10}
          width={78}
          height={18}
          className="absolute -top-3 left-3 z-10"
          style={{ transform: 'rotate(-10deg)' }}
        />
        <MaskingTape
          color="pink"
          rotation={8}
          width={66}
          height={16}
          className="absolute -top-2 right-6 z-10"
          style={{ transform: 'rotate(8deg)' }}
        />

        {/* 좌상단 작은 꽃 + 라벨 */}
        <div className="flex items-center gap-2 mb-3" style={{ color: C.inkSoft }}>
          <TinyFlower size={18} color={C.accent} />
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase'
            }}
          >
            scrapbook letter
          </span>
        </div>

        {/* To. */}
        <div className="mb-3">
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              color: C.inkSoft
            }}
          >
            TO.
          </div>
          <div
            style={{
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 22,
              color: C.ink,
              borderBottom: `1.5px dashed ${C.inkFaint}`,
              paddingBottom: 4,
              marginTop: 3
            }}
          >
            {letter?.recipientName || '소중한 너에게'}
          </div>
        </div>

        {/* 제목 */}
        {letter?.title && (
          <h2
            style={{
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              fontWeight: 700,
              fontSize: 20,
              lineHeight: 1.35,
              color: C.ink,
              margin: '14px 0 14px'
            }}
          >
            {letter.title}
          </h2>
        )}

        {/* 본문 — 줄 있는 종이 느낌 */}
        <div
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 25px, rgba(74,51,32,0.10) 25px 26px)`,
            backgroundPosition: '0 6px',
            paddingTop: 6,
            paddingBottom: 6
          }}
        >
          <p
            style={{
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              fontSize: 15,
              lineHeight: '26px',
              color: C.ink,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {letter?.content || '여기에 마음을 적어주세요.'}
          </p>
        </div>

        {/* From. */}
        <div className="mt-7 text-right" style={{ color: C.inkSoft }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em' }}>FROM.</div>
          <div
            style={{
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 18,
              color: C.ink,
              marginTop: 2
            }}
          >
            {letter?.senderName || '익명의 친구'}
          </div>
        </div>

        {/* 우하단 종이 스크랩 + 작은 별 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: -10,
            bottom: -8,
            display: 'flex',
            gap: 4,
            transform: 'rotate(8deg)'
          }}
        >
          <PaperScrap width={42} height={28} rotation={-12} color="#E8D2A8" />
          <PaperScrap width={36} height={24} rotation={6} color="#D9BF94" />
        </div>
      </motion.div>

      {/* 사진들 — 스크랩북처럼 살짝 흩뿌리듯 배치 */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-7"
        >
          <div
            className="flex flex-wrap items-start justify-center gap-y-6 gap-x-3"
            style={{ rowGap: 24 }}
          >
            {photos.slice(0, 3).map((p, i) => (
              <div
                key={i}
                style={{
                  width: photos.length === 1 ? 220 : 150,
                  flexShrink: 0
                }}
              >
                <PolaroidPhotoCard
                  photo={{ src: p.src, caption: p.alt || '' }}
                  rotation={p.rotation ?? (i === 0 ? -3 : i === 1 ? 2.5 : -1.5)}
                  tapeColor={p.tape || ['kraft', 'pink', 'yellow'][i % 3]}
                  width={photos.length === 1 ? 220 : 150}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
