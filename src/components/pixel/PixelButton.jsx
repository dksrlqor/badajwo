// 8비트 픽셀 버튼. variant: pink | deep | cream | surface | ghost | danger
// size: 'sm' 이면 inline 작은 버튼.
export default function PixelButton({
  variant = 'pink',
  size,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const v = variant === 'pink' ? '' : `px-btn-${variant}`
  const s = size === 'sm' ? 'px-btn-sm' : ''
  return (
    <button type={type} className={`px-btn ${v} ${s} ${className}`} {...props}>
      {children}
    </button>
  )
}
