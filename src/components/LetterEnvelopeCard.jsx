import { motion } from 'framer-motion'
import { AirmailBorder, Postmark } from './VintageMail'

// 받은 편지 상세 — 빈티지 항공우편 봉투/엽서 위에 본문이 적힌 듯한 카드.
//
// 시각 참조: Blue Red and Beige Vintage Envelope PDF 의 봉투 카드 구도만 차용.
//   · 크림/베이지 카드 본체
//   · 가장자리 빨강·파랑 사선 항공우편 띠
//   · 우상단 반투명 우표 자리 + navy 원형 소인 + 가로 물결 라인
//   · 카드 뒤에 살짝 보이는 베이지 지도 조각 + 빨간 종이 stamp (배경 레이어)
//   · 살짝 기울어진 종이 + drop shadow
//
// 본문/서명/날짜는 props 로 받은 letter 데이터를 그대로 렌더링한다.
// PDF 안의 문구·이미지·로고는 사용하지 않았다.

// ─── 작은 장식 컴포넌트들 ────────────────────────────────

function StampSlot({ width = 56, height = 64 }) {
  // 우상단 작은 반투명 우표 자리 — 옅은 파랑/회색, 톱니 가장자리 흉내
  const dot = 5
  const r = 2
  const perforation = {
    WebkitMaskImage: `
      radial-gradient(circle at ${dot}px 0, transparent ${r}px, #000 ${r}px),
      radial-gradient(circle at 0 ${dot}px, transparent ${r}px, #000 ${r}px)
    `,
    WebkitMaskSize: `${dot}px ${dot}px, ${dot}px ${dot}px`,
    maskImage: `
      radial-gradient(circle at ${dot}px 0, transparent ${r}px, #000 ${r}px),
      radial-gradient(circle at 0 ${dot}px, transparent ${r}px, #000 ${r}px)
    `,
    maskSize: `${dot}px ${dot}px, ${dot}px ${dot}px`
  }
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        transform: 'rotate(-4deg)',
        position: 'relative',
        filter: 'drop-shadow(0 1px 2px rgba(40,55,90,0.18))'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(220, 228, 236, 0.92)',
          ...perforation
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 4,
          background: 'rgba(196, 210, 224, 0.62)',
          border: '1px solid rgba(78, 107, 138, 0.28)'
        }}
      />
    </div>
  )
}

function WavyCancelLines({ width = 76, height = 22, color = 'rgba(60, 80, 120, 0.55)' }) {
  // 우편 소인 옆에 붙는 가로 wavy cancellation 라인 5줄
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', transform: 'rotate(-2deg)' }}
    >
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
        {[3, 7, 11, 15, 19].map((y) => (
          <path
            key={y}
            d={`M 2 ${y} Q ${width * 0.2} ${y - 1.6}, ${width * 0.4} ${y} T ${width * 0.8} ${y} T ${width - 2} ${y}`}
          />
        ))}
      </g>
    </svg>
  )
}

function BackPaperScrap({
  width = 80,
  height = 64,
  rotate = -8,
  color = '#D6BE92',
  texture = 'map',
  style = {}
}) {
  // 카드 뒤에 살짝 보이는 paper scrap — 베이지 지도 조각 / 빨간 종이
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        background: color,
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          '0 1px 2px rgba(74,51,32,0.18), 0 4px 8px rgba(74,51,32,0.10)',
        opacity: 0.7,
        overflow: 'hidden',
        ...style
      }}
    >
      {texture === 'map' && (
        <svg
          viewBox="0 0 80 64"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g
            fill="none"
            stroke="rgba(90, 60, 30, 0.45)"
            strokeWidth="0.8"
          >
            <path d="M 4 12 Q 22 8 36 14 T 76 16" />
            <path d="M 6 28 Q 20 24 38 30 T 76 28" />
            <path d="M 2 44 Q 24 38 40 46 T 76 44" />
            <path d="M 14 4 L 18 60" />
            <path d="M 36 2 L 38 62" />
            <path d="M 58 4 L 62 60" />
          </g>
        </svg>
      )}
      {texture === 'stamp' && (
        <svg
          viewBox="0 0 80 64"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect x="2" y="2" width="76" height="60" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="40" y="38" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fill="rgba(255,255,255,0.45)" letterSpacing="2">
            POSTAGE
          </text>
        </svg>
      )}
    </div>
  )
}

// ─── 메인 카드 ─────────────────────────────────────────

export default function LetterEnvelopeCard({
  letter,
  senderLabel,
  isAnonymous = false
}) {
  const date = formatLetterDate(letter?.createdAt)
  const receiverLabel = letter?.receiverUsername
    ? `@${letter.receiverUsername}`
    : ''

  return (
    <div className="relative mx-1" style={{ paddingTop: 14, paddingBottom: 24 }}>
      {/* 뒤쪽 종이 레이어 — 카드 뒤에 살짝 보임 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -8,
          right: -10,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <BackPaperScrap width={86} height={58} rotate={10} color="#D6BE92" texture="map" />
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -4,
          left: -12,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <BackPaperScrap width={64} height={48} rotate={-14} color="#C7443E" texture="stamp" />
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -6,
          right: 18,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <BackPaperScrap width={92} height={42} rotate={6} color="#CFB386" texture="map" />
      </div>

      {/* 메인 봉투 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          transform: 'rotate(-0.8deg)',
          transformOrigin: '50% 100%'
        }}
      >
        <AirmailBorder
          borderWidth={9}
          innerPadding={18}
          background="#FAF1DA"
          radius="14px 11px 16px 12px"
        >
          <div className="relative" style={{ paddingRight: 4 }}>
            {/* 우상단 우표 + 소인 + 물결 라인 */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 4,
                zIndex: 2
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ position: 'relative' }}>
                  <Postmark
                    size={62}
                    rotation={-10}
                    city="BADAJWO"
                    color="rgba(60, 80, 120, 0.55)"
                  />
                </div>
                <div style={{ marginTop: -4, marginLeft: -6 }}>
                  <WavyCancelLines width={72} height={20} />
                </div>
              </div>
              <StampSlot width={50} height={58} />
            </div>

            {/* To 라벨 */}
            {receiverLabel && (
              <div style={{ marginBottom: 14, paddingRight: 110 }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    color: '#7A5A3D',
                    fontFamily: 'Georgia, "Apple SD Gothic Neo", serif'
                  }}
                >
                  TO.
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#3D2E22',
                    fontFamily: '"Apple SD Gothic Neo", Pretendard, Georgia, serif',
                    marginTop: 2,
                    borderBottom: '1.2px dashed rgba(92,62,40,0.32)',
                    paddingBottom: 4
                  }}
                >
                  {receiverLabel}
                </div>
              </div>
            )}

            {/* 본문 */}
            <p
              style={{
                fontFamily: '"Apple SD Gothic Neo", Pretendard, Georgia, serif',
                fontSize: 15,
                lineHeight: '26px',
                color: '#3D2E22',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textAlign: 'left',
                margin: 0,
                paddingTop: 8,
                minHeight: 160
              }}
            >
              {letter?.content || ''}
            </p>

            {/* 우하단 서명 라인 — by [이름] + 날짜 + 밑줄 */}
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 12,
                color: '#3D2E22',
                fontFamily: 'Georgia, "Apple SD Gothic Neo", serif'
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  color: '#86705E'
                }}
              >
                {date}
              </div>
              <div style={{ textAlign: 'right', flex: 1, marginLeft: 12 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: '#86705E',
                    fontStyle: 'italic'
                  }}
                >
                  from.{' '}
                </span>
                <span
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: 18,
                    color: isAnonymous ? '#7A5A3D' : '#3D2E22',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {senderLabel}
                </span>
                <div
                  aria-hidden
                  style={{
                    marginTop: 4,
                    height: 1,
                    background: 'rgba(92,62,40,0.32)',
                    width: '100%',
                    maxWidth: 200,
                    marginLeft: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
        </AirmailBorder>
      </motion.div>
    </div>
  )
}

function formatLetterDate(ts) {
  if (!ts) return ''
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}.${m}.${day}`
}
