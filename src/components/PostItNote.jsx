const COLOR_MAP = {
  yellow:   { bg: '#FCF096', inset: 'rgba(190, 160, 30, 0.22)' },
  pink:     { bg: '#F8D2D8', inset: 'rgba(200, 110, 130, 0.22)' },
  mint:     { bg: '#D8EBD0', inset: 'rgba(80, 150, 110, 0.22)' },
  lavender: { bg: '#DECAF0', inset: 'rgba(130, 100, 190, 0.22)' }
}

// 종이 결 (포스트잇 미세 노이즈)
const NOISE_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.32  0 0 0 0 0.24  0 0 0 0 0.15  0 0 0 0.060 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export default function PostItNote({
  text,
  color = 'yellow',
  rotation = -3,
  className = '',
  style = {},
  width = 170
}) {
  if (!text) return null
  const c = COLOR_MAP[color] || COLOR_MAP.yellow
  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        background: `${NOISE_BG}, ${c.bg}`,
        backgroundBlendMode: 'multiply, normal',
        boxShadow: `2px 5px 14px rgba(92,62,40,0.20), inset 0 -14px 28px ${c.inset}`,
        transform: `rotate(${rotation}deg)`,
        padding: '12px 14px 14px',
        ...style
      }}
    >
      <div
        className="text-[13px] leading-snug font-medium whitespace-pre-line break-words"
        style={{ color: '#3D2E22' }}
      >
        {text}
      </div>
    </div>
  )
}
