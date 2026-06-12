import Sprite from './Sprite'

// 받아줘 마스코트 — 8비트 픽셀 고양이.
// state:
//   'idle'      기본 (꼬리 살랑 + 눈 깜빡임 + 위아래 1px)
//   'heart-sit' 큰 하트 위에 앉아 있음
//   'heart-hug' 하트를 꼭 안고 있음 (전송 성공)
//   'envelope'  봉투를 들고 있음 (편지 생성)
//   'wait'      봉투 옆에서 기다림 (= idle 과 동일 모션, 시멘틱 구분용)
//   'tilt'      고개 갸웃 (오류)
//
// 그리드 교체만으로 도트 수정 가능. 진짜 sprite 이미지로 바꿀 땐 Sprite 만 교체.

// ── 기본 몸체 (16×14) — 눈은 5·6행 2픽셀 높이 ──────────
const CAT_BASE = [
  '..oo........oo..',
  '.occo......occo.',
  '.ocpco....ocpco.',
  '.occcooooooccco.',
  '.occcccccccccco.',
  'occtcccccccctcco',
  'occtcccccccctcco',
  'occccccddcccccco',
  'ocpcccccccccpcco',
  '.occcccccccccco.',
  '.occcccccccccco.',
  '.occcccccccccco.',
  '.occooccccoocco.',
  '..oooooooooooo..'
]

// 깜빡임 — 눈 윗픽셀(5행)을 몸색으로 덮어 반눈 만들기
const CAT_BLINK = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '...c........c...',
  '................'
]

// 꼬리 2프레임 (오른쪽) — 두 프레임 모두 같은 길이의 이어진 한 줄.
// 픽셀이 생겼다 사라지면 움직일 때 벌어져 보이므로,
// 끝(8행) 픽셀만 좌우로 1px 옮겨 살랑이는 느낌을 낸다.
const TAIL_A = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '...............o',
  '...............o',
  '...............o',
  '...............o',
  '..............oo'
]
const TAIL_B = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..............o.',
  '...............o',
  '...............o',
  '...............o',
  '..............oo'
]

// 안고 있는 하트 (몸 중앙)
const HUG_HEART = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '....hh...hh.....',
  '...hhhhhhhhh....',
  '....hhhhhhh.....',
  '.....hhhhh......',
  '......hhh.......'
]

// 들고 있는 봉투 (몸 앞)
const HOLD_ENVELOPE = [
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
  '...owdwwwwdwo...',
  '...owwddddwwo...',
  '...owwwwwwwwo...',
  '...oooooooooo...'
]

// 아래 큰 하트 (heart-sit 용, 16×6)
const SIT_HEART = [
  '..hhh....hhh....',
  '.hhhhh..hhhhh...',
  '.hhhhhhhhhhhh...',
  '..hhhhhhhhhh....',
  '....hhhhhh......',
  '......hh........'
]

export default function PixelCat({
  state = 'idle',
  px = 6,
  animate = true,
  className = '',
  style = {}
}) {
  const tilt = state === 'tilt'
  const showSitHeart = state === 'heart-sit'
  const overlay =
    state === 'heart-hug' ? HUG_HEART : state === 'envelope' ? HOLD_ENVELOPE : null

  const W = 16 * px
  const H = 14 * px

  return (
    <div
      className={`${animate && !tilt ? 'px-bob' : ''} ${className}`}
      style={{
        position: 'relative',
        width: W,
        display: 'inline-block',
        transform: tilt ? 'rotate(8deg)' : undefined,
        ...style
      }}
      role="img"
      aria-label="픽셀 고양이"
    >
      <div style={{ position: 'relative', width: W, height: H }}>
        <Sprite grid={CAT_BASE} px={px} style={{ position: 'absolute', inset: 0 }} />
        {animate && (
          <Sprite
            grid={CAT_BLINK}
            px={px}
            className="px-blink"
            style={{ position: 'absolute', inset: 0 }}
          />
        )}
        {animate ? (
          <>
            <Sprite grid={TAIL_A} px={px} className="px-frame-a" style={{ position: 'absolute', inset: 0 }} />
            <Sprite grid={TAIL_B} px={px} className="px-frame-b" style={{ position: 'absolute', inset: 0 }} />
          </>
        ) : (
          <Sprite grid={TAIL_A} px={px} style={{ position: 'absolute', inset: 0 }} />
        )}
        {overlay && (
          <Sprite grid={overlay} px={px} style={{ position: 'absolute', inset: 0 }} />
        )}
        {tilt && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -px * 3,
              right: -px * 2,
              fontSize: px * 2.4,
              fontWeight: 700,
              color: '#C96F7F'
            }}
          >
            ?
          </div>
        )}
      </div>
      {showSitHeart && (
        <Sprite grid={SIT_HEART} px={px} style={{ display: 'block', marginTop: -px }} />
      )}
    </div>
  )
}
