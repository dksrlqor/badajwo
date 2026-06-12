import Sprite from './Sprite'

// 편지 배달 고양이 — 입에 하트 스티커 봉투를 물고 있는 큰 픽셀 고양이.
// /l/:code 오픈 인터랙션 전용. 터치 단계(stage)에 따라 표정이 점점 웃상이 된다.
//
//   stage 0  새침/무표정 — 조심스럽게 편지를 물고 있음
//   stage 1  옅은 미소 — 입꼬리가 살짝 올라감
//   stage 2  방긋 — ∧∧ 눈웃음 + 볼터치
//   stage 3  활짝 — 입을 벌리고 웃으며(분홍 혀) 편지를 내밂 (handover)
//
// 그리드 교체만으로 도트 수정 가능. 몸통은 PixelCat 과 같은 16×14 + 19칸 꼬리.

// ── 몸체 (16×14) — 눈/입 없음, 표정은 stage 별 overlay 가 그림 ──
const BODY = [
  '..oo........oo..',
  '.occo......occo.',
  '.ocpco....ocpco.',
  '.occcooooooccco.',
  '.occcccccccccco.',
  'occcccccccccccco',
  'occcccccccccccco',
  'occcccccccccccco',
  'ocpcccccccccpcco',
  '.occcccccccccco.',
  '.occcccccccccco.',
  '.occcccccccccco.',
  '.occooccccoocco.',
  '..oooooooooooo..'
]

// ── 눈 ──
const EYES_BAR = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '...t........t...',
  '...t........t...'
]
const EYES_HAPPY = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '...t........t...',
  '..t.t......t.t..'
]

// ── 입 ──
const MOUTH_FLAT = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '.......tt.......'
]
const MOUTH_SOFT = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '......t..t......',
  '.......tt.......'
]
const MOUTH_GRIN = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '.....t....t.....',
  '......tttt......'
]
const MOUTH_OPEN = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '.....t....t.....',
  '......thht......'
]

// ── 볼터치 (stage 2+) — 기본 볼 옆에 한 픽셀 더 ──
const BLUSH_MORE = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..p..........p..'
]

// ── 입에 문 봉투 (하트 스티커) — 9~13행, 턱 바로 아래 ──
const MOUTH_ENVELOPE = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '...oooooooooo...',
  '...owwhwhwwwo...',
  '...owwhhhwwwo...',
  '...owwwhwwwwo...',
  '...oooooooooo...'
]

// ── 꼬리 2프레임 (PixelCat 과 동일 디자인, 19칸) ──
const TAIL_A = [
  '...................',
  '...................',
  '...................',
  '...................',
  '...................',
  '...................',
  '.................oo',
  '.................oo',
  '................oo.',
  '................oo.',
  '................oo.',
  '...............oo..',
  '..............oo...'
]
const TAIL_B = [
  '...................',
  '...................',
  '...................',
  '...................',
  '...................',
  '...................',
  '................oo.',
  '................oo.',
  '................oo.',
  '................oo.',
  '................oo.',
  '...............oo..',
  '..............oo...'
]

const FACE_BY_STAGE = [
  { eyes: EYES_BAR, mouth: MOUTH_FLAT, blush: false },
  { eyes: EYES_BAR, mouth: MOUTH_SOFT, blush: false },
  { eyes: EYES_HAPPY, mouth: MOUTH_GRIN, blush: true },
  { eyes: EYES_HAPPY, mouth: MOUTH_OPEN, blush: true }
]

export default function MailCat({ stage = 0, px = 8, animate = true, style = {} }) {
  const face = FACE_BY_STAGE[Math.max(0, Math.min(3, stage))]
  const handover = stage >= 3
  const W = 16 * px
  const H = 14 * px

  const layer = { position: 'absolute', inset: 0 }

  return (
    <div
      className={animate ? 'px-bob' : ''}
      style={{ position: 'relative', width: W, display: 'inline-block', ...style }}
      role="img"
      aria-label="편지를 입에 문 픽셀 고양이"
    >
      <div style={{ position: 'relative', width: W, height: H }}>
        <Sprite grid={BODY} px={px} style={layer} />
        {animate ? (
          <>
            <Sprite grid={TAIL_A} px={px} className="px-frame-a" style={layer} />
            <Sprite grid={TAIL_B} px={px} className="px-frame-b" style={layer} />
          </>
        ) : (
          <Sprite grid={TAIL_A} px={px} style={layer} />
        )}
        <Sprite grid={face.eyes} px={px} style={layer} />
        <Sprite grid={face.mouth} px={px} style={layer} />
        {face.blush && <Sprite grid={BLUSH_MORE} px={px} style={layer} />}
        <span
          className={handover ? 'px-handover' : ''}
          style={{ ...layer, display: 'block', pointerEvents: 'none' }}
        >
          <Sprite grid={MOUTH_ENVELOPE} px={px} style={layer} />
        </span>
      </div>
    </div>
  )
}
