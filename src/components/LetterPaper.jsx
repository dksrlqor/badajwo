export const PAPER_COLORS = {
  ivory:    { label: '아이보리', bg: '#FFFBEF', line: 'rgba(190, 160, 110, 0.18)', edge: '#F0E4C6', ink: '#3A3330' },
  yellow:   { label: '연노랑',   bg: '#FFF8D6', line: 'rgba(180, 150, 50, 0.20)',  edge: '#F2DD8B', ink: '#3A3330' },
  pink:     { label: '연핑크',   bg: '#FFE7EE', line: 'rgba(220, 100, 130, 0.18)', edge: '#F4C0CC', ink: '#3A3330' },
  sky:      { label: '연하늘',   bg: '#E6F0FB', line: 'rgba(80, 120, 180, 0.18)',  edge: '#BFD5EE', ink: '#2C3340' },
  lavender: { label: '연보라',   bg: '#EFE7FB', line: 'rgba(120, 90, 180, 0.18)',  edge: '#D2C2EC', ink: '#33304A' },
  mint:     { label: '연민트',   bg: '#E5F3EC', line: 'rgba(60, 140, 100, 0.18)',  edge: '#BEDFCC', ink: '#2C3A35' }
}

export const PAPER_COLOR_KEYS = Object.keys(PAPER_COLORS)

export function getPaperPalette(key) {
  return PAPER_COLORS[key] || PAPER_COLORS.ivory
}

export default function LetterPaper({
  colorKey = 'ivory',
  className = '',
  children,
  padded = true
}) {
  const p = getPaperPalette(colorKey)
  // 종이 질감: 줄 패턴 + 따뜻한 빛 spot 2개를 겹쳐서 미세한 grain 느낌.
  const style = {
    backgroundColor: p.bg,
    backgroundImage: `
      radial-gradient(circle at 18% 22%, rgba(255,255,255,0.18) 0%, transparent 30%),
      radial-gradient(circle at 82% 78%, rgba(180,135,95,0.06) 0%, transparent 34%),
      repeating-linear-gradient(to bottom, transparent 0, transparent 31px, ${p.line} 31px, ${p.line} 32px)
    `,
    backgroundPosition: '0 0, 0 0, 0 18px',
    backgroundRepeat: 'no-repeat, no-repeat, repeat-y',
    color: p.ink
  }
  return (
    <div
      className={`relative rounded-2xl shadow-card overflow-hidden ${
        padded ? 'px-6 pt-7 pb-8' : ''
      } ${className}`}
      style={{
        ...style,
        boxShadow:
          '0 18px 45px rgba(92, 62, 40, 0.14), 0 4px 14px rgba(92, 62, 40, 0.10), inset 0 1px 0 rgba(255,255,255,0.45)'
      }}
    >
      {/* 왼쪽 마진선 (실제 편지지의 세로선 느낌) */}
      <div
        className="absolute left-7 top-0 bottom-0 w-px opacity-70"
        style={{ background: p.edge }}
      />
      {children}
    </div>
  )
}
