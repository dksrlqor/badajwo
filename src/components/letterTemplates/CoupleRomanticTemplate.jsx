import { motion } from 'framer-motion'
import RecordPlayer from '../RecordPlayer'

// 분홍빛 마음 — 커플/연인용 편지지.
// PDF 원본(Pink and Beige Romantic Anniversary)의 분위기를 참고하되,
// 원본의 하트 일러스트/사진/문구는 사용하지 않고
// 단순화한 SVG 하트 + dust glow + 둥근 dashed border 로 새롭게 재해석.
//
// 톤: 부드러운 핑크 #FBE6E8 / 베이지 #F7EFE0 / 액센트 #C57F86 / 잉크 #4A2E2A.
// 구조: 둥근 외곽 카드(중앙 정렬 본문), 상하단 하트 클러스터, 모서리 dust glow,
//      사진은 둥근 모서리 핑크 폴라로이드.

const C = {
  paper: '#FBE6E8',
  paperWarm: '#F7EFE0',
  pinkSoft: '#F0C7CC',
  accent: '#C57F86',
  accentDeep: '#A84E5C',
  ink: '#4A2E2A',
  inkSoft: '#7A5253'
}

function MiniHeart({ size = 18, color = C.accent, rotation = 0, opacity = 0.85 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      style={{ transform: `rotate(${rotation}deg)`, opacity }}
    >
      <path
        d="M12 21 C 4 15 2 9 7 6 C 10 4 12 7 12 8 C 12 7 14 4 17 6 C 22 9 20 15 12 21 Z"
        fill={color}
      />
    </svg>
  )
}

function HeartCluster({ position = 'top' }) {
  // 상/하단 하트 3~5개 — 원본의 위치/구성과 다르게 흩뿌리듯.
  const items =
    position === 'top'
      ? [
          { size: 22, dx: -36, dy: 0, rot: -18, op: 0.85, color: C.accent },
          { size: 14, dx: -8, dy: -8, rot: 6, op: 0.7, color: C.pinkSoft },
          { size: 18, dx: 20, dy: 4, rot: 14, op: 0.85, color: C.accentDeep },
          { size: 11, dx: 38, dy: -6, rot: -8, op: 0.6, color: C.accent }
        ]
      : [
          { size: 15, dx: -32, dy: -2, rot: 18, op: 0.7, color: C.pinkSoft },
          { size: 22, dx: -4, dy: 4, rot: -12, op: 0.85, color: C.accentDeep },
          { size: 13, dx: 22, dy: -4, rot: 8, op: 0.7, color: C.accent },
          { size: 18, dx: 40, dy: 2, rot: 22, op: 0.85, color: C.accent }
        ]
  return (
    <div
      aria-hidden
      style={{ position: 'relative', height: 32, display: 'flex', justifyContent: 'center' }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: 4,
            transform: `translateX(calc(-50% + ${it.dx}px)) translateY(${it.dy}px)`
          }}
        >
          <MiniHeart size={it.size} color={it.color} rotation={it.rot} opacity={it.op} />
        </div>
      ))}
    </div>
  )
}

function PinkPolaroid({ src, caption, rotation = -2, width = 168 }) {
  return (
    <div
      style={{
        width,
        background: '#FFFCF5',
        padding: 9,
        paddingBottom: 28,
        borderRadius: 14,
        boxShadow:
          '0 2px 5px rgba(197, 127, 134, 0.18), 0 14px 30px rgba(197, 127, 134, 0.14), inset 0 1px 0 rgba(255,255,255,0.7)',
        transform: `rotate(${rotation}deg)`,
        position: 'relative'
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%) rotate(-4deg)',
          width: 56,
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
          height: 190,
          borderRadius: 10,
          background: '#F4E4E6',
          overflow: 'hidden'
        }}
      >
        {src ? (
          <img
            src={src}
            alt={caption || ''}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>
      {caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: C.inkSoft,
            fontSize: 12,
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

export default function CoupleRomanticTemplate({ letter }) {
  const photos = Array.isArray(letter?.photos) ? letter.photos : []
  const music = letter?.music || null

  return (
    <div className="relative w-full" style={{ color: C.ink }}>
      {/* 음악 — 핑크 톤으로 wrapper */}
      {music && music.originalUrl && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-5"
          style={{
            padding: 10,
            borderRadius: 18,
            background: 'linear-gradient(180deg, #FBE6E8 0%, #F8D5DA 100%)',
            boxShadow: '0 1px 3px rgba(197,127,134,0.18), inset 0 1px 0 rgba(255,255,255,0.6)'
          }}
        >
          <RecordPlayer music={music} tone="romantic" />
        </motion.div>
      )}

      {/* 외곽 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(247,201,217,0.55) 0%, rgba(247,201,217,0) 45%), radial-gradient(circle at 85% 85%, rgba(247,239,224,0.7) 0%, rgba(247,239,224,0) 50%), linear-gradient(180deg, #FBE6E8 0%, #F7EFE0 100%)',
          padding: '8px',
          borderRadius: 22,
          boxShadow: '0 2px 6px rgba(197,127,134,0.18), 0 18px 36px rgba(197,127,134,0.16)'
        }}
      >
        {/* 내부 카드 — dashed double border */}
        <div
          style={{
            position: 'relative',
            background: 'rgba(255, 252, 245, 0.78)',
            padding: '24px 22px 26px',
            borderRadius: 18,
            border: `1.5px dashed ${C.pinkSoft}`,
            boxShadow: 'inset 0 0 0 6px rgba(255,255,255,0.55), inset 0 0 0 7.5px rgba(240,199,204,0.55)'
          }}
        >
          {/* 상단 하트 클러스터 */}
          <HeartCluster position="top" />

          {/* To. */}
          <div className="text-center mt-2 mb-2" style={{ color: C.inkSoft }}>
            <div style={{ fontSize: 11, letterSpacing: '0.22em' }}>TO.</div>
            <div
              style={{
                fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: 22,
                color: C.accentDeep,
                marginTop: 2
              }}
            >
              {letter?.recipientName || 'My Dear'}
            </div>
          </div>

          {/* 가운데 작은 라인 */}
          <div
            aria-hidden
            style={{
              width: 60,
              height: 1,
              background: C.pinkSoft,
              margin: '8px auto 14px'
            }}
          />

          {/* 제목 */}
          {letter?.title && (
            <h2
              style={{
                fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1.35,
                color: C.ink,
                textAlign: 'center',
                margin: '4px 0 16px'
              }}
            >
              {letter.title}
            </h2>
          )}

          {/* 본문 — 중앙 정렬, 부드러운 lineHeight */}
          <p
            style={{
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              fontSize: 15,
              lineHeight: '27px',
              color: C.ink,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textAlign: 'left',
              padding: '0 4px'
            }}
          >
            {letter?.content || '편지의 내용을 적어주세요.'}
          </p>

          {/* From. */}
          <div className="mt-7 text-right" style={{ color: C.inkSoft, paddingRight: 6 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.22em' }}>FROM.</div>
            <div
              style={{
                fontFamily: 'Georgia, "Apple SD Gothic Neo", serif',
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: 18,
                color: C.accentDeep,
                marginTop: 2
              }}
            >
              {letter?.senderName || 'With love'}
            </div>
          </div>

          {/* 하단 하트 클러스터 */}
          <div className="mt-3">
            <HeartCluster position="bottom" />
          </div>
        </div>
      </motion.div>

      {/* 사진 — 핑크 폴라로이드 */}
      {photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.34 }}
          className="mt-7 flex flex-wrap items-start justify-center gap-y-6 gap-x-3"
          style={{ rowGap: 28 }}
        >
          {photos.slice(0, 3).map((p, i) => (
            <PinkPolaroid
              key={i}
              src={p.src}
              caption={p.alt || ''}
              rotation={p.rotation ?? (i === 0 ? -2.5 : i === 1 ? 2 : -1.2)}
              width={photos.length === 1 ? 220 : 158}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
