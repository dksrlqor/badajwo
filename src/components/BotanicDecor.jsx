// 받아줘 — 화면 모서리에 SVG 로 직접 그린 압화/고사리/잔가지 6개.
// 색감을 yellow / blue / sage / rust / coral 로 다양화해서 빈티지 스크랩북 톤.

function PressedDaisy({ color = '#C7857C', center = '#A6694F', size = 38, style }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={style} aria-hidden>
      <g opacity="0.82">
        {/* 8 꽃잎 */}
        <ellipse cx="20" cy="8" rx="3.2" ry="7.2" fill={color} />
        <ellipse cx="20" cy="32" rx="3.2" ry="7.2" fill={color} />
        <ellipse cx="8" cy="20" rx="7.2" ry="3.2" fill={color} />
        <ellipse cx="32" cy="20" rx="7.2" ry="3.2" fill={color} />
        <ellipse cx="11.5" cy="11.5" rx="6.2" ry="2.8" fill={color} transform="rotate(45 11.5 11.5)" />
        <ellipse cx="28.5" cy="11.5" rx="6.2" ry="2.8" fill={color} transform="rotate(-45 28.5 11.5)" />
        <ellipse cx="11.5" cy="28.5" rx="6.2" ry="2.8" fill={color} transform="rotate(-45 11.5 28.5)" />
        <ellipse cx="28.5" cy="28.5" rx="6.2" ry="2.8" fill={color} transform="rotate(45 28.5 28.5)" />
        <circle cx="20" cy="20" r="3.8" fill={center} />
        {/* 중앙 작은 점들 — 꽃밥 느낌 */}
        <circle cx="18.5" cy="19" r="0.5" fill="rgba(255,255,255,0.6)" />
        <circle cx="21" cy="20.5" r="0.5" fill="rgba(255,255,255,0.6)" />
      </g>
    </svg>
  )
}

function ForgetMeNot({ color = '#7A98C7', center = '#E8B850', size = 42, style }) {
  // 작은 푸른 꽃 무더기 (4 꽃송이) + 잎
  return (
    <svg viewBox="0 0 50 50" width={size} height={size} style={style} aria-hidden>
      <g opacity="0.82">
        {/* 잎 */}
        <ellipse cx="10" cy="35" rx="9" ry="3.5" fill="#7A9272" transform="rotate(-25 10 35)" />
        <ellipse cx="40" cy="38" rx="8" ry="3" fill="#8AA482" transform="rotate(30 40 38)" />
        {/* 4 꽃송이 — 각각 4 꽃잎 */}
        {[
          { cx: 18, cy: 14, r: 5.5 },
          { cx: 32, cy: 10, r: 5 },
          { cx: 28, cy: 26, r: 6 },
          { cx: 14, cy: 28, r: 4.5 }
        ].map((f, i) => (
          <g key={i}>
            <circle cx={f.cx - f.r * 0.6} cy={f.cy} r={f.r * 0.45} fill={color} />
            <circle cx={f.cx + f.r * 0.6} cy={f.cy} r={f.r * 0.45} fill={color} />
            <circle cx={f.cx} cy={f.cy - f.r * 0.6} r={f.r * 0.45} fill={color} />
            <circle cx={f.cx} cy={f.cy + f.r * 0.6} r={f.r * 0.45} fill={color} />
            <circle cx={f.cx} cy={f.cy} r={f.r * 0.32} fill={center} />
          </g>
        ))}
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
      <g opacity="0.78">
        <path d="M 30 5 Q 28 40 30 75" stroke={stem} strokeWidth="1.6" fill="none" />
        {Array.from({ length: leaves }).map((_, i) => {
          const y = 10 + i * (70 / leaves)
          const side = i % 2 === 0 ? -1 : 1
          const cx = 30 + side * 9
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={y}
              rx="9.5"
              ry="2.8"
              fill={color}
              transform={`rotate(${side * 22} ${cx} ${y})`}
            />
          )
        })}
      </g>
    </svg>
  )
}

function SmallBerry({ color = '#9C4F3E', size = 24, style }) {
  return (
    <svg viewBox="0 0 24 30" width={size} height={(size * 30) / 24} style={style} aria-hidden>
      <g opacity="0.8">
        <path d="M 12 3 Q 12 16 12 26" stroke="#5C7050" strokeWidth="1.2" fill="none" />
        <circle cx="9" cy="18" r="3.4" fill={color} />
        <circle cx="14" cy="22" r="3.4" fill={color} />
        <circle cx="11" cy="14" r="3" fill={color} />
        <ellipse cx="5.5" cy="10" rx="4.5" ry="1.8" fill="#7D9270" transform="rotate(-30 5.5 10)" />
        <ellipse cx="18" cy="8" rx="4.5" ry="1.8" fill="#7D9270" transform="rotate(35 18 8)" />
      </g>
    </svg>
  )
}

const sepia = 'drop-shadow(0 3px 6px rgba(92, 62, 40, 0.22)) sepia(0.15) saturate(0.85)'

export default function BotanicDecor() {
  return (
    <div className="botanic-deco" aria-hidden>
      {/* 좌상 — 큰 고사리 가지 (sage) */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: -10,
          transform: 'rotate(-22deg)',
          filter: sepia
        }}
      >
        <FernSprig color="#8BA37E" stem="#6B8060" size={66} leaves={7} />
      </div>

      {/* 우상 — 푸른 forget-me-not 무더기 */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 6,
          transform: 'rotate(14deg)',
          filter: sepia
        }}
      >
        <ForgetMeNot color="#7A98C7" center="#E8B850" size={48} />
      </div>

      {/* 좌상 옆 작은 베리 */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 28,
          transform: 'rotate(8deg)',
          filter: sepia
        }}
      >
        <SmallBerry color="#A6483A" size={24} />
      </div>

      {/* 우상 아래 — 압화 데이지 (꿀색) */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          right: 10,
          transform: 'rotate(-8deg)',
          filter: sepia
        }}
      >
        <PressedDaisy color="#E8C075" center="#9C6B3A" size={38} />
      </div>

      {/* 좌하 — 작은 고사리 (밝은 sage) */}
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          left: -10,
          transform: 'rotate(-32deg)',
          filter: sepia
        }}
      >
        <FernSprig color="#9CB089" stem="#6E8062" size={48} leaves={6} />
      </div>

      {/* 좌하 옆 — 분홍 압화 */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 24,
          transform: 'rotate(18deg)',
          filter: sepia
        }}
      >
        <PressedDaisy color="#D89C95" center="#A6694F" size={32} />
      </div>

      {/* 우하 — 푸른 forget-me-not 작은 무더기 */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 12,
          transform: 'rotate(-12deg)',
          filter: sepia
        }}
      >
        <ForgetMeNot color="#8AA6CC" center="#E8B850" size={42} />
      </div>

      {/* 우하 끝 작은 잎 */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          right: 4,
          transform: 'rotate(40deg)',
          filter: sepia
        }}
      >
        <FernSprig color="#A6B097" stem="#778566" size={40} leaves={5} />
      </div>
    </div>
  )
}
