import Sprite from './Sprite'

// 하트 burst — trigger(아무 값) 가 바뀔 때마다 작은 픽셀 하트 3개가 위로 뿅.
// 부모는 position: relative 여야 한다.
const HEART = [
  '.hh.hh.',
  'hhhhhhh',
  'hhhhhhh',
  '.hhhhh.',
  '..hhh..',
  '...h...'
]

const SPOTS = [
  { left: '20%', delay: 0 },
  { left: '50%', delay: 0.12 },
  { left: '74%', delay: 0.22 }
]

export default function HeartBurst({ trigger, px = 4 }) {
  if (!trigger) return null
  return (
    <div
      key={String(trigger)}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      {SPOTS.map((s, i) => (
        <div
          key={i}
          className="px-float-heart"
          style={{
            position: 'absolute',
            top: 0,
            left: s.left,
            animationDelay: `${s.delay}s`
          }}
        >
          <Sprite grid={HEART} px={px} />
        </div>
      ))}
    </div>
  )
}
