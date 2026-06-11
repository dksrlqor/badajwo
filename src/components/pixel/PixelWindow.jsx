// 레트로 컴퓨터 윈도우 — 핑크 타이틀바 + 하트 + 장식 컨트롤.
export default function PixelWindow({
  title = '♡ 받아줘 ♡',
  children,
  className = '',
  style = {},
  bodyStyle = {},
  pop = true
}) {
  return (
    <div className={`px-window ${pop ? 'px-pop' : ''} ${className}`} style={style}>
      <div className="px-titlebar">
        <span className="px-titlebar-heart" aria-hidden>
          ♥
        </span>
        <span className="px-titlebar-text">{title}</span>
        <span className="px-titlebar-controls" aria-hidden>
          <i />
          <i />
        </span>
      </div>
      <div className="px-window-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  )
}
