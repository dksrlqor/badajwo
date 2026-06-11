import Sprite from './Sprite'

// 8비트 픽셀 봉투 — 닫힘/열림 두 상태.
// 닫힘: 핑크 플랩(역삼각) + 하트 봉인. 열림: 플랩이 위로 + 편지지가 봉투 위로 살짝.
// hover 흔들림은 부모에서 .px-shake-hover 클래스로.

const W = 24

function buildClosed() {
  const rows = []
  rows.push('o'.repeat(W)) // 상단 테두리

  // 플랩 — 위 전체 폭에서 중앙(행 6)으로 좁아지는 역삼각형
  for (let y = 1; y <= 6; y++) {
    const lo = 2 * y - 1 // 왼쪽 대각선 시작
    const hi = 24 - 2 * y // 오른쪽 대각선 끝
    let row = ''
    for (let x = 0; x < W; x++) {
      if (x === 0 || x === W - 1) row += 'o'
      else if (x === lo || x === lo + 1 || x === hi || x === hi - 1) row += 'd'
      else if (x > lo + 1 && x < hi - 1) row += 'p'
      else row += 'w'
    }
    rows.push(row)
  }

  // 봉투 본체
  for (let y = 0; y < 7; y++) rows.push('o' + 'w'.repeat(W - 2) + 'o')
  rows.push('o'.repeat(W)) // 하단 테두리

  // 하트 봉인 — 플랩 꼭짓점(행 5~7) 위에 덧그림
  const put = (y, x, ch) => {
    rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1)
  }
  put(5, 10, 'h'); put(5, 12, 'h')
  put(6, 10, 'h'); put(6, 11, 'h'); put(6, 12, 'h')
  put(7, 11, 'h')
  return rows
}

function buildOpen() {
  const rows = []
  // 위로 젖혀진 플랩 (핑크 안감)
  rows.push('..........oooo..........')
  rows.push('........oopppppoo.......')
  rows.push('......oopppppppppoo.....')
  rows.push('....oopppppppppppppoo...')
  // 봉투 밖으로 나온 편지지 머리 (글줄 힌트 t)
  rows.push('..oooooooooooooooooo....')
  rows.push('..occcccccccccccccco....')
  rows.push('..octcctcctcccccccco....')
  rows.push('..occcccccccccccccco....')
  // 봉투 본체
  rows.push('o'.repeat(W))
  for (let y = 0; y < 7; y++) rows.push('o' + 'w'.repeat(W - 2) + 'o')
  rows.push('o'.repeat(W))
  return rows
}

const CLOSED = buildClosed()
const OPEN = buildOpen()

export default function PixelEnvelope({ open = false, px = 7, className = '', style = {} }) {
  return (
    <Sprite
      grid={open ? OPEN : CLOSED}
      px={px}
      className={className}
      style={style}
      label={open ? '열린 픽셀 봉투' : '닫힌 픽셀 봉투'}
    />
  )
}
