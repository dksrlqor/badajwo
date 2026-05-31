// 받아줘 LetterPaper.
// 빈티지 항공우편(airmail) 편지지 — 가장자리 빨강/파랑 사선 띠 + 안쪽 줄있는 종이
// + 중앙 세로 fold shadow + 미세 종이 grain.

export const PAPER_COLORS = {
  ivory:    { label: '아이보리', bg: '#FDF8EE', line: 'rgba(120, 85, 60, 0.10)', edge: '#E8D5B8', ink: '#3D2E22' },
  yellow:   { label: '연노랑',   bg: '#FCF5D6', line: 'rgba(140, 110, 50, 0.10)', edge: '#F0DDA0', ink: '#3D2E22' },
  pink:     { label: '연핑크',   bg: '#FCE9EA', line: 'rgba(180, 110, 110, 0.10)', edge: '#F0BFC2', ink: '#3D2E22' },
  sky:      { label: '연하늘',   bg: '#E9F0F8', line: 'rgba(80, 110, 160, 0.10)', edge: '#BCD0E6', ink: '#2C3340' },
  lavender: { label: '연보라',   bg: '#EFE7F8', line: 'rgba(120, 95, 170, 0.10)', edge: '#D0BFE6', ink: '#33304A' },
  mint:     { label: '연민트',   bg: '#E5F1E9', line: 'rgba(80, 130, 95, 0.10)', edge: '#BFDDC9', ink: '#2C3A35' }
}

export const PAPER_COLOR_KEYS = Object.keys(PAPER_COLORS)

export function getPaperPalette(key) {
  return PAPER_COLORS[key] || PAPER_COLORS.ivory
}

// 빈티지 톤 (Tailwind airmail.* 와 동일)
const AIR_RED = '#C7443E'
const AIR_BLUE = '#4E6B8A'

// 종이 결 — multiply blend 로 색감 보존하며 미세 입자만 얹는다.
const NOISE_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.28  0 0 0 0 0.20  0 0 0 0 0.13  0 0 0 0.045 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export default function LetterPaper({
  colorKey = 'ivory',
  className = '',
  children,
  padded = true,
  airmail = true // 항공우편 사선 띠. 끄면 기존처럼 단순 종이 카드.
}) {
  const p = getPaperPalette(colorKey)

  // 외부: 항공우편 사선 띠가 보이는 영역.
  // 안쪽 div 가 paper 색으로 띠를 덮으므로 padding 두께만큼만 띠가 남는다.
  const outerStyle = airmail
    ? {
        background: `repeating-linear-gradient(45deg,
          ${AIR_RED} 0 6px,
          ${p.bg} 6px 12px,
          ${AIR_BLUE} 12px 18px,
          ${p.bg} 18px 24px
        )`,
        padding: 7, // 모바일 / 데스크톱 공통, 본문 가독성 우선
        borderRadius: 14,
        boxShadow:
          '0 4px 10px rgba(92, 62, 40, 0.10), 0 24px 56px rgba(92, 62, 40, 0.14)'
      }
    : {
        background: p.bg,
        padding: 0,
        borderRadius: 18,
        boxShadow:
          '0 2px 5px rgba(92, 62, 40, 0.08), 0 14px 32px rgba(92, 62, 40, 0.10)'
      }

  // 내부: 줄있는 편지지 + 중앙 fold + 따뜻한 빛 spot 2 + 종이 grain.
  // background 다중 레이어 (앞이 위에 그려짐):
  //   1) 중앙 fold (가운데 1px 세로 띠 그림자)
  //   2) 빛 spot 좌상
  //   3) 빛 spot 우하
  //   4) 종이 grain noise (multiply)
  //   5) 줄 패턴 (repeat-y)
  const innerStyle = {
    backgroundColor: p.bg,
    color: p.ink,
    borderRadius: airmail ? 6 : 18,
    backgroundImage: `
      linear-gradient(90deg, transparent 49.6%, rgba(110, 80, 50, 0.07) 49.95%, rgba(110, 80, 50, 0.07) 50.05%, transparent 50.4%),
      radial-gradient(circle at 18% 22%, rgba(255,255,255,0.22) 0%, transparent 32%),
      radial-gradient(circle at 82% 78%, rgba(180,135,95,0.07) 0%, transparent 38%),
      ${NOISE_BG},
      repeating-linear-gradient(to bottom, transparent 0, transparent 31px, ${p.line} 31px, ${p.line} 32px)
    `,
    backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 18px',
    backgroundRepeat: 'no-repeat, no-repeat, no-repeat, repeat, repeat-y',
    backgroundBlendMode: 'normal, normal, normal, multiply, normal'
  }

  return (
    <div className={`relative ${className}`} style={outerStyle}>
      <div
        className={`relative overflow-hidden ${
          padded ? 'px-6 pt-7 pb-8 sm:px-8' : ''
        }`}
        style={innerStyle}
      >
        {/* 왼쪽 마진선 — 실제 편지지의 세로선 */}
        <div
          className="absolute top-0 bottom-0 w-px opacity-70"
          style={{ left: airmail ? 26 : 28, background: p.edge }}
        />
        {children}
      </div>
    </div>
  )
}
