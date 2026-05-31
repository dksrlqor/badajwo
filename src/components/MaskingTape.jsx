const COLORS = {
  pink:     'rgba(247, 201, 217, 0.88)',
  yellow:   'rgba(255, 233, 130, 0.88)',
  mint:     'rgba(180, 220, 200, 0.88)',
  lavender: 'rgba(215, 199, 240, 0.88)',
  kraft:    'rgba(220, 200, 170, 0.88)'
}

export default function MaskingTape({
  rotation = -8,
  color = 'pink',
  width = 80,
  height = 18,
  className = '',
  style = {}
}) {
  const tint = COLORS[color] || COLORS.pink
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        width,
        height,
        background: `repeating-linear-gradient(135deg, ${tint} 0 6px, rgba(255,255,255,0.28) 6px 12px)`,
        boxShadow: '0 1px 3px rgba(80,60,50,0.16)',
        transform: `rotate(${rotation}deg)`,
        ...style
      }}
    />
  )
}
