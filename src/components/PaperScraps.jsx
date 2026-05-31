// 받아줘 — scrapbook 분위기를 만드는 콜라주 레이어.
// 책 페이지 조각, 신문 조각, 티켓 스텁, 우표, 폴라로이드 모서리가 마스킹테이프로 종이 위에 살짝 붙은 듯한 콜라주.
// pointer-events: none. 부모 scrapbook-page 안쪽에 absolute 로 깔려 모서리에 살짝 보임.

// ── 책장 조각 (텍스트 흉내 가는 줄) ─────────────────────────
function BookScrap({
  width = 84,
  height = 60,
  rotation = -6,
  tapeColor = 'sage',
  paper = '#F0E1C0',
  textColor = 'rgba(92, 62, 40, 0.32)',
  lines = 5,
  tape = true,
  style = {}
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.22))',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: paper,
          borderRadius: '3px 5px 4px 6px',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.50), inset 0 0 12px rgba(92,62,40,0.10)'
        }}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
      >
        {Array.from({ length: lines }).map((_, i) => {
          const y = 8 + (i * (height - 12)) / lines
          const lineW = width - 12 - (i % 2) * 14
          return (
            <line
              key={i}
              x1={6}
              y1={y}
              x2={6 + lineW}
              y2={y}
              stroke={textColor}
              strokeWidth={0.6}
              strokeDasharray="1.5 1.5"
            />
          )
        })}
      </svg>
      {tape && (
        <div
          className={`masking-tape tape-${tapeColor}`}
          style={{
            position: 'absolute',
            width: width * 0.55,
            height: 14,
            top: -6,
            left: '50%',
            transform: 'translateX(-50%) rotate(-8deg)'
          }}
        />
      )}
    </div>
  )
}

// ── 신문 조각 ───────────────────────────────────────────────
function NewspaperScrap({ width = 70, height = 50, rotation = 5, style = {} }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 2px 5px rgba(92, 62, 40, 0.20))',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#E8DCC2',
          borderRadius: '2px 4px 3px 5px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.40), inset 0 0 10px rgba(92,62,40,0.12)'
        }}
      />
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <rect x={5} y={6} width={width - 14} height={2.5} fill="rgba(60, 40, 25, 0.55)" />
        <rect x={5} y={12} width={(width - 14) * 0.6} height={1.2} fill="rgba(60, 40, 25, 0.4)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={i}
            x1={5}
            y1={20 + i * 4}
            x2={5 + (width - 12) * (i % 3 === 0 ? 0.7 : 0.95)}
            y2={20 + i * 4}
            stroke="rgba(92, 62, 40, 0.32)"
            strokeWidth={0.5}
            strokeDasharray="1 1.2"
          />
        ))}
      </svg>
    </div>
  )
}

// ── 티켓 스텁 ──────────────────────────────────────────────
function TicketStub({ width = 90, height = 32, rotation = -8, color = '#C7857C', style = {} }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.24))',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#FBF0DC',
          borderRadius: '2px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 10px rgba(92,62,40,0.10)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: height,
          background: color,
          opacity: 0.55
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: height + 4,
          top: '50%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#735F46',
          transform: 'translateY(-50%)',
          opacity: 0.5
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: height + 14,
          top: 4,
          bottom: 4,
          width: 1,
          borderLeft: '1px dashed rgba(92, 62, 40, 0.45)'
        }}
      />
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <line
            key={i}
            x1={height + 18}
            y1={9 + i * 7}
            x2={width - 6}
            y2={9 + i * 7}
            stroke="rgba(92, 62, 40, 0.4)"
            strokeWidth={0.6}
            strokeDasharray="1 1.4"
          />
        ))}
      </svg>
    </div>
  )
}

// ── 작은 우표 ──────────────────────────────────────────────
function MiniStamp({ size = 40, rotation = 4, color = '#7A98C7', icon = '✿', style = {} }) {
  const inner = size - 6
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.30))',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#F8EFD8',
          boxShadow: 'inset 0 0 0 1.5px rgba(92, 62, 40, 0.35)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 3,
          background: '#FCF6E6',
          border: `1.5px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: inner * 0.55,
          color,
          fontFamily: 'Georgia, serif'
        }}
      >
        {icon}
      </div>
    </div>
  )
}

// ── 폴라로이드 모서리 ──────────────────────────────────────
function PolaroidCorner({ rotation = -10, photoBg = '#735F46', size = 50, style = {} }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width: size,
        height: size + 16,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 4px 8px rgba(92, 62, 40, 0.30))',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#FFFCF5',
          padding: 3,
          boxShadow: 'inset 0 0 0 1px rgba(92, 62, 40, 0.10)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          right: 3,
          height: size - 6,
          background: photoBg,
          opacity: 0.7
        }}
      />
    </div>
  )
}

// 부모 scrapbook-page 의 안쪽에 absolute 로 깔린다.
// .scrapbook-page > * 가 z-index:1 을 강제하므로 inline 으로 zIndex:0 명시.
export default function PaperScraps({ variant = 'default' }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        borderRadius: 'inherit'
      }}
    >
      {/* 좌상 — 책장 조각 */}
      <BookScrap
        width={96}
        height={62}
        rotation={-11}
        tapeColor="sage"
        paper="#EDE0BD"
        lines={5}
        style={{ top: 16, left: -28 }}
      />
      {/* 우상 — 신문 조각 + 우표 */}
      <NewspaperScrap width={70} height={50} rotation={9} style={{ top: 12, right: -24 }} />
      <MiniStamp
        size={36}
        rotation={-6}
        color="#A6483A"
        icon="✿"
        style={{ top: 70, right: -10 }}
      />

      {/* 좌중간 — 작은 책장 조각 */}
      <BookScrap
        width={68}
        height={44}
        rotation={-14}
        tapeColor="rust"
        paper="#E8D8B0"
        lines={4}
        tape={false}
        style={{ top: '52%', left: -34 }}
      />

      {/* 우중간 — 티켓 스텁 */}
      {variant !== 'minimal' && (
        <TicketStub
          width={88}
          height={28}
          rotation={12}
          color="#A6694F"
          style={{ top: '46%', right: -38 }}
        />
      )}

      {/* 좌하 — 책장 조각 */}
      <BookScrap
        width={84}
        height={56}
        rotation={9}
        tapeColor="orange"
        paper="#F3E6C7"
        lines={4}
        style={{ bottom: 20, left: -22 }}
      />

      {/* 우하 — 폴라로이드 모서리 + 우표 */}
      <PolaroidCorner
        rotation={14}
        photoBg="#7D9270"
        size={48}
        style={{ bottom: 90, right: -16 }}
      />
      <BookScrap
        width={78}
        height={52}
        rotation={-8}
        tapeColor="blue"
        paper="#EFE2C0"
        lines={4}
        tape={false}
        style={{ bottom: 16, right: -28 }}
      />
    </div>
  )
}
