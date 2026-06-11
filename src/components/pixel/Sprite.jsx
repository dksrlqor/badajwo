// 문자 그리드 → SVG rect 픽셀 스프라이트.
// grid: 문자열 배열. 한 글자 = 1픽셀. palette 에 없는 글자('.')는 투명.
// 나중에 진짜 sprite 이미지로 교체할 때는 이 컴포넌트만 <img> 로 바꾸면 된다.
export const PX = {
  o: '#9E5C64', // outline
  c: '#FFFDF8', // cream (몸통)
  p: '#F3A6B5', // pink
  d: '#C96F7F', // deep pink
  h: '#E45C7A', // heart
  t: '#4A2F35', // dark (눈/잉크)
  w: '#FFFFFF'  // white
}

export default function Sprite({
  grid,
  palette = PX,
  px = 6,
  className = '',
  style = {},
  label
}) {
  const h = grid.length
  const w = Math.max(...grid.map((r) => r.length))
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * px}
      height={h * px}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = palette[ch]
          if (!fill) return null
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />
        })
      )}
    </svg>
  )
}
