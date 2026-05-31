// 받아줘 — 화면 모서리 + 가장자리에 SVG 로 직접 그린 압화/고사리/잔가지.
// 이모지보다 빈티지 스크랩북 톤이 잘 살아남는다.
// 모두 pointer-events none + opacity 낮게.

function PressedDaisy({ color = '#C7857C', center = '#A6694F', size = 38, style }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={style} aria-hidden>
      <g opacity="0.78">
        {/* 8 꽃잎 */}
        <ellipse cx="20" cy="8" rx="3" ry="7" fill={color} />
        <ellipse cx="20" cy="32" rx="3" ry="7" fill={color} />
        <ellipse cx="8" cy="20" rx="7" ry="3" fill={color} />
        <ellipse cx="32" cy="20" rx="7" ry="3" fill={color} />
        <ellipse cx="11.5" cy="11.5" rx="6" ry="2.6" fill={color} transform="rotate(45 11.5 11.5)" />
        <ellipse cx="28.5" cy="11.5" rx="6" ry="2.6" fill={color} transform="rotate(-45 28.5 11.5)" />
        <ellipse cx="11.5" cy="28.5" rx="6" ry="2.6" fill={color} transform="rotate(-45 11.5 28.5)" />
        <ellipse cx="28.5" cy="28.5" rx="6" ry="2.6" fill={color} transform="rotate(45 28.5 28.5)" />
        <circle cx="20" cy="20" r="3.6" fill={center} />
      </g>
    </svg>
  )
}

function FernSprig({ color = '#7D9270', stem = '#5C7050', size = 60, leaves = 7, style }) {
  return (
    <svg
      viewBox="0 0 60 80"
      width={size}
      height={(size * 80) / 60}
      style={style}
      aria-hidden
    >
      <g opacity="0.72">
        {/* 줄기 */}
        <path d="M 30 5 Q 28 40 30 75" stroke={stem} strokeWidth="1.4" fill="none" />
        {Array.from({ length: leaves }).map((_, i) => {
          const y = 10 + i * (70 / leaves)
          const side = i % 2 === 0 ? -1 : 1
          const cx = 30 + side * 9
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={y}
              rx="9"
              ry="2.6"
              fill={color}
              transform={`rotate(${side * 22} ${cx} ${y})`}
            />
          )
        })}
      </g>
    </svg>
  )
}

function SmallBerry({ color = '#9C4F3E', size = 22, style }) {
  return (
    <svg viewBox="0 0 24 30" width={size} height={(size * 30) / 24} style={style} aria-hidden>
      <g opacity="0.75">
        <path d="M 12 3 Q 12 16 12 26" stroke="#5C7050" strokeWidth="1.2" fill="none" />
        <circle cx="9" cy="18" r="3.2" fill={color} />
        <circle cx="14" cy="22" r="3.2" fill={color} />
        <ellipse cx="6" cy="12" rx="4" ry="1.6" fill="#7D9270" transform="rotate(-30 6 12)" />
        <ellipse cx="17" cy="9" rx="4" ry="1.6" fill="#7D9270" transform="rotate(35 17 9)" />
      </g>
    </svg>
  )
}

export default function BotanicDecor() {
  return (
    <div className="botanic-deco" aria-hidden>
      {/* 좌상 — 고사리 가지 */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: -4,
          transform: 'rotate(-22deg)',
          filter:
            'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.20)) sepia(0.15) saturate(0.78)'
        }}
      >
        <FernSprig color="#8BA37E" stem="#6B8060" size={56} leaves={6} />
      </div>

      {/* 우상 — 압화 데이지 (분홍) */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          right: 14,
          transform: 'rotate(14deg)',
          filter:
            'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.20)) sepia(0.18) saturate(0.78)'
        }}
      >
        <PressedDaisy color="#D89C95" center="#A6694F" size={36} />
      </div>

      {/* 좌상 옆 작은 베리 */}
      <div
        style={{
          position: 'absolute',
          top: 76,
          left: 24,
          transform: 'rotate(8deg)',
          filter:
            'drop-shadow(0 2px 4px rgba(92, 62, 40, 0.18)) sepia(0.15) saturate(0.7)'
        }}
      >
        <SmallBerry color="#A6483A" size={22} />
      </div>

      {/* 좌하 — 작은 잎 */}
      <div
        style={{
          position: 'absolute',
          bottom: 110,
          left: -8,
          transform: 'rotate(-30deg)',
          filter:
            'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.18)) sepia(0.18) saturate(0.7)'
        }}
      >
        <FernSprig color="#9CB089" stem="#6E8062" size={44} leaves={5} />
      </div>

      {/* 우하 — 압화 (꿀색) */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          right: 18,
          transform: 'rotate(-8deg)',
          filter:
            'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.20)) sepia(0.18) saturate(0.78)'
        }}
      >
        <PressedDaisy color="#D8B17A" center="#8C5A3A" size={34} />
      </div>

      {/* 우하 끝 작은 잎 */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          right: 8,
          transform: 'rotate(40deg)',
          filter:
            'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.16)) sepia(0.15) saturate(0.7)'
        }}
      >
        <FernSprig color="#A6B097" stem="#778566" size={36} leaves={5} />
      </div>
    </div>
  )
}
