// 받아줘 — 빈티지 우편물 데코 컴포넌트 모음.
// AirmailBorder : 빨강/파랑 사선 dashed 항공우편 테두리
// PaperStamp    : 잎/꽃 일러스트 우표 (톱니 가장자리)
// Postmark      : dashed 둥근 우편 소인 (도장)
// OrnamentLine  : 빅토리안 손그림 ornament 라인 (제목 아래 장식)

// ──────────────────────────────────────────────────────────
// AirmailBorder
// 봉투/카드 외곽에 두르는 빨강·파랑 사선 띠.
// children 을 감싸는 컨테이너로 사용.
// ──────────────────────────────────────────────────────────
export function AirmailBorder({
  children,
  className = '',
  style = {},
  borderWidth = 10,
  background = '#FCF6E6',
  innerPadding = 18,
  radius = '6px 4px 8px 5px'
}) {
  // 빨강/파랑 사선 dashed 패턴을 4방향으로 깔아 봉투 가장자리 느낌.
  const stripe = `repeating-linear-gradient(
    45deg,
    #C7443E 0 8px,
    #FCF6E6 8px 16px,
    #4E6B8A 16px 24px,
    #FCF6E6 24px 32px
  )`
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: stripe,
        padding: borderWidth,
        borderRadius: radius,
        boxShadow:
          '0 2px 5px rgba(92, 62, 40, 0.12), 0 14px 32px rgba(92, 62, 40, 0.18), 0 1px 0 rgba(255,255,255,0.5) inset',
        ...style
      }}
    >
      <div
        style={{
          background,
          padding: innerPadding,
          borderRadius: 'calc(var(--r, 4px) - 2px)',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// PaperStamp
// 잎/꽃 일러스트가 들어간 빈티지 우표. 톱니 가장자리(perforation) 흉내.
// variant: leaf | flower | bird | airmail
// ──────────────────────────────────────────────────────────
export function PaperStamp({
  variant = 'leaf',
  size = 60,
  rotation = -6,
  className = '',
  style = {}
}) {
  const w = size
  const h = size * 1.2
  // 톱니 mask — 가장자리 둘레에 작은 반원 컷아웃을 깔아 톱니 형태.
  const perforation = (() => {
    const dotSpacing = 6
    const radius = 2.2
    return {
      WebkitMaskImage: `
        radial-gradient(circle at ${dotSpacing}px 0, transparent ${radius}px, #000 ${radius}px),
        radial-gradient(circle at 0 ${dotSpacing}px, transparent ${radius}px, #000 ${radius}px)
      `,
      WebkitMaskSize: `${dotSpacing}px ${dotSpacing}px, ${dotSpacing}px ${dotSpacing}px`,
      maskImage: `
        radial-gradient(circle at ${dotSpacing}px 0, transparent ${radius}px, #000 ${radius}px),
        radial-gradient(circle at 0 ${dotSpacing}px, transparent ${radius}px, #000 ${radius}px)
      `,
      maskSize: `${dotSpacing}px ${dotSpacing}px, ${dotSpacing}px ${dotSpacing}px`
    }
  })()

  return (
    <div
      aria-hidden
      className={className}
      style={{
        width: w,
        height: h,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 4px 8px rgba(92, 62, 40, 0.28))',
        position: 'relative',
        ...style
      }}
    >
      {/* 톱니 외곽 — 살짝 어두운 종이 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#F8EFD8',
          ...perforation
        }}
      />
      {/* 내부 색지 + 일러스트 */}
      <div
        style={{
          position: 'absolute',
          inset: 4,
          background: '#FCF6E6',
          border: `1.5px solid ${variant === 'flower' ? '#A6483A' : variant === 'airmail' ? '#4E6B8A' : '#5C7050'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 2px'
        }}
      >
        <svg
          viewBox="0 0 40 40"
          width={w - 12}
          height={h - 22}
          style={{ display: 'block' }}
        >
          {variant === 'leaf' && (
            <g opacity="0.85">
              {/* 잎 줄기 */}
              <path d="M 20 36 Q 20 22 20 6" stroke="#5C7050" strokeWidth="1.2" fill="none" />
              {/* 잎사귀들 */}
              <ellipse cx="14" cy="12" rx="6" ry="2.5" fill="#7D9270" transform="rotate(-30 14 12)" />
              <ellipse cx="26" cy="14" rx="6" ry="2.5" fill="#8BA37E" transform="rotate(30 26 14)" />
              <ellipse cx="13" cy="20" rx="7" ry="2.8" fill="#6E8062" transform="rotate(-25 13 20)" />
              <ellipse cx="27" cy="22" rx="7" ry="2.8" fill="#7D9270" transform="rotate(28 27 22)" />
              <ellipse cx="14" cy="28" rx="6" ry="2.5" fill="#8BA37E" transform="rotate(-22 14 28)" />
              <ellipse cx="26" cy="30" rx="6" ry="2.5" fill="#6E8062" transform="rotate(25 26 30)" />
            </g>
          )}
          {variant === 'flower' && (
            <g opacity="0.88">
              <path d="M 20 36 Q 20 28 20 22" stroke="#5C7050" strokeWidth="1.2" fill="none" />
              <ellipse cx="14" cy="32" rx="5" ry="2" fill="#7D9270" transform="rotate(-30 14 32)" />
              {/* 꽃잎 — 8장 */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse
                  key={deg}
                  cx="20"
                  cy="10"
                  rx="2.6"
                  ry="6"
                  fill="#D89C95"
                  transform={`rotate(${deg} 20 16)`}
                />
              ))}
              <circle cx="20" cy="16" r="3" fill="#A6694F" />
            </g>
          )}
          {variant === 'bird' && (
            <g opacity="0.88">
              <path d="M 8 22 Q 18 12 30 16 Q 34 18 32 24 Q 22 30 12 28 Q 6 26 8 22 Z" fill="#4E6B8A" />
              <path d="M 24 18 L 36 12" stroke="#4E6B8A" strokeWidth="1.4" fill="none" />
              <circle cx="28" cy="20" r="1" fill="#FCF6E6" />
              <path d="M 14 28 Q 16 34 22 32" stroke="#4E6B8A" strokeWidth="1.2" fill="none" />
            </g>
          )}
          {variant === 'airmail' && (
            <g opacity="0.85">
              <path d="M 6 14 L 34 6 L 26 30 L 20 22 L 6 14 Z" fill="#C7443E" />
              <path d="M 20 22 L 14 30 L 26 30" fill="#A6483A" />
              <path d="M 6 14 L 20 22" stroke="#FCF6E6" strokeWidth="0.8" fill="none" />
            </g>
          )}
        </svg>
        <div
          style={{
            fontSize: w * 0.13,
            color: variant === 'flower' ? '#A6483A' : variant === 'airmail' ? '#4E6B8A' : '#5C7050',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: 2
          }}
        >
          POSTAGE
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Postmark
// dashed 둥근 우편 소인. 날짜/도시명을 안에 적을 수 있음.
// ──────────────────────────────────────────────────────────
export function Postmark({
  size = 78,
  rotation = -14,
  color = 'rgba(78, 107, 138, 0.65)',
  city = 'SEOUL',
  date,
  className = '',
  style = {}
}) {
  const today = date || new Date()
  const d =
    typeof today === 'string'
      ? today
      : `${today.getDate()}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`
  return (
    <div
      aria-hidden
      className={className}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
        ...style
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
        {/* 외곽 dashed 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeDasharray="4 3"
        />
        {/* 내곽 점선 원 */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        {/* 위 도시명 — arc */}
        <defs>
          <path id="pmTop" d="M 12 50 A 38 38 0 0 1 88 50" />
          <path id="pmBot" d="M 12 52 A 38 38 0 0 0 88 52" />
        </defs>
        <text
          fill={color}
          fontFamily="Georgia, serif"
          fontSize="11"
          letterSpacing="3"
        >
          <textPath href="#pmTop" startOffset="50%" textAnchor="middle">
            {city}
          </textPath>
        </text>
        <text
          fill={color}
          fontFamily="Georgia, serif"
          fontSize="9"
          letterSpacing="2"
        >
          <textPath href="#pmBot" startOffset="50%" textAnchor="middle">
            {d}
          </textPath>
        </text>
        {/* 중앙 받아줘 마크 */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill={color}
          fontFamily="Georgia, serif"
          fontSize="10"
          fontWeight="600"
          letterSpacing="1"
        >
          받아줘
        </text>
      </svg>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// OrnamentLine
// 빅토리안 손그림 ornament 라인. 제목 아래 장식.
// ──────────────────────────────────────────────────────────
export function OrnamentLine({
  width = 140,
  color = '#86705E',
  thickness = 1,
  className = '',
  style = {}
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 140 18"
      width={width}
      height={(width * 18) / 140}
      className={className}
      style={{ display: 'block', ...style }}
    >
      <g fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" opacity="0.7">
        {/* 좌측 잎 곡선 */}
        <path d="M 4 9 Q 14 4 24 9" />
        <path d="M 18 9 Q 22 12 28 11" />
        {/* 좌측 작은 다이아 */}
        <path d="M 32 9 L 36 6 L 40 9 L 36 12 Z" />
        {/* 중앙 곡선 — 양옆으로 부드럽게 */}
        <path d="M 44 9 Q 52 4 60 9 Q 64 12 68 9" />
        <circle cx="70" cy="9" r="1.6" fill={color} stroke="none" />
        <path d="M 72 9 Q 76 12 80 9 Q 88 4 96 9" />
        {/* 우측 다이아 */}
        <path d="M 100 9 L 104 6 L 108 9 L 104 12 Z" />
        {/* 우측 잎 곡선 */}
        <path d="M 112 9 Q 118 12 122 11" />
        <path d="M 116 9 Q 126 4 136 9" />
      </g>
    </svg>
  )
}

export default { AirmailBorder, PaperStamp, Postmark, OrnamentLine }
