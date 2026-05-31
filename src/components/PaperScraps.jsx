// 받아줘 — scrapbook 분위기를 만드는 콜라주 레이어.
// 책 페이지 조각, 신문 조각, 티켓 스텁, 우표, 폴라로이드 모서리가 마스킹테이프로 종이 위에 살짝 붙은 듯한 콜라주.
// pointer-events: none. Layout 최상위에서 fixed 로 렌더되어 모든 페이지에 자동 적용.

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

// ── 신문 조각 — 더 작은 텍스트 + 헤드라인 굵은 한 줄 ─────────
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
        {/* 헤드라인 굵은 라인 */}
        <rect x={5} y={6} width={width - 14} height={2.5} fill="rgba(60, 40, 25, 0.55)" />
        {/* 짧은 라인 */}
        <rect x={5} y={12} width={(width - 14) * 0.6} height={1.2} fill="rgba(60, 40, 25, 0.4)" />
        {/* 본문 잔줄 */}
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

// ── 티켓 스텁 — perforated 가장자리 + 작은 텍스트 ──────────────
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
      {/* 좌측 색 띠 */}
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
      {/* 펀치 구멍 */}
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
      {/* perforation dashed line */}
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
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
      >
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

// ── 작은 우표 — 톱니 가장자리 ──────────────────────────────
function MiniStamp({ size = 40, rotation = 4, color = '#7A98C7', icon = '✉', style = {} }) {
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
          background: '#FCF6E6',
          // 톱니 perforation 흉내 — radial gradient 로 가장자리 점들
          backgroundImage:
            'radial-gradient(circle at center, transparent 62%, rgba(255,255,255,0) 62%), radial-gradient(circle at 50% 0, transparent 4%, transparent 4%)',
          borderRadius: 2,
          maskImage:
            'radial-gradient(circle at 50% 0%, transparent 2.4px, #000 2.4px), radial-gradient(circle at 0% 50%, transparent 2.4px, #000 2.4px), radial-gradient(circle at 100% 50%, transparent 2.4px, #000 2.4px), radial-gradient(circle at 50% 100%, transparent 2.4px, #000 2.4px)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 0%, transparent 2.4px, #000 2.4px), radial-gradient(circle at 0% 50%, transparent 2.4px, #000 2.4px), radial-gradient(circle at 100% 50%, transparent 2.4px, #000 2.4px), radial-gradient(circle at 50% 100%, transparent 2.4px, #000 2.4px)',
          boxShadow: 'inset 0 0 0 1.5px rgba(92, 62, 40, 0.35)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 3,
          background: '#FCF6E6',
          border: `1.5px solid ${color}`,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: inner * 0.5,
          color: color,
          fontFamily: 'Georgia, serif'
        }}
      >
        {icon}
      </div>
    </div>
  )
}

// ── 폴라로이드 모서리 (작게) ────────────────────────────────
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

export default function PaperScraps({ variant = 'default' }) {
  // 화면 좌우 가장자리에 흩어진 콜라주.
  // 모바일 좁은 폭에서도 본문 가리지 않도록 가장자리 밖으로 살짝 밀어둠.
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {/* 좌상 — 책장 조각 (sage 테이프) */}
      <BookScrap
        width={94}
        height={62}
        rotation={-11}
        tapeColor="sage"
        paper="#EDE0BD"
        lines={5}
        style={{ top: 200, left: -34 }}
      />
      {/* 좌상 옆 — 작은 신문 조각 */}
      <NewspaperScrap width={56} height={42} rotation={-18} style={{ top: 320, left: -18 }} />

      {/* 우상 — 책장 조각 (orange 테이프) */}
      <BookScrap
        width={80}
        height={54}
        rotation={9}
        tapeColor="orange"
        paper="#F3E6C7"
        lines={4}
        style={{ top: 270, right: -26 }}
      />
      {/* 우상 옆 — 작은 우표 */}
      <MiniStamp
        size={36}
        rotation={-8}
        color="#A6483A"
        icon="✿"
        style={{ top: 360, right: 8 }}
      />

      {/* 좌하 — 티켓 스텁 */}
      <TicketStub
        width={94}
        height={30}
        rotation={-14}
        color="#A6694F"
        style={{ bottom: 280, left: -32 }}
      />
      {/* 좌하 — 작은 책장 조각 (rust 테이프) */}
      <BookScrap
        width={66}
        height={44}
        rotation={-7}
        tapeColor="rust"
        paper="#E8D8B0"
        lines={4}
        style={{ bottom: 200, left: -20 }}
      />

      {/* 우하 — 책장 조각 (blue 테이프) */}
      <BookScrap
        width={88}
        height={60}
        rotation={12}
        tapeColor="blue"
        paper="#EFE2C0"
        lines={5}
        style={{ bottom: 210, right: -28 }}
      />
      {/* 우하 옆 — 폴라로이드 모서리 */}
      <PolaroidCorner
        rotation={14}
        photoBg="#7D9270"
        size={44}
        style={{ bottom: 320, right: 6 }}
      />
      {/* 우하 — 신문 조각 */}
      <NewspaperScrap width={58} height={44} rotation={16} style={{ bottom: 130, right: -16 }} />

      {/* 중하 — 작은 우표 (변형용 hidden 가능) */}
      {variant !== 'minimal' && (
        <MiniStamp
          size={32}
          rotation={6}
          color="#4E6B8A"
          icon="✈"
          style={{ bottom: 92, left: 18 }}
        />
      )}
    </div>
  )
}
