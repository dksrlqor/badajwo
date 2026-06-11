import { useEffect, useRef, useState } from 'react'
import PixelCat from './PixelCat'
import Sprite from './Sprite'

// 쓰다듬을 수 있는 고양이 — 터치/클릭/Enter/Space 마다 머리 위로
// 픽셀 하트 2~4개가 뿅 하고 떠오르는 이스터에그.
// 연속 입력은 cooldown 으로 막고, prefers-reduced-motion 이면 모션 없이
// 하트만 잠깐 보여준다.

const HEART = [
  '.hh.hh.',
  'hhhhhhh',
  'hhhhhhh',
  '.hhhhh.',
  '..hhh..',
  '...h...'
]

const COOLDOWN_MS = 350
const HEART_LIFETIME_MS = 1200
const MAX_HEARTS = 10

export default function PettableCat({ state = 'heart-hug', px = 6 }) {
  const [hearts, setHearts] = useState([])
  const [happy, setHappy] = useState(false)
  const lastPet = useRef(0)
  const happyTimer = useRef(null)
  const alive = useRef(true)

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      window.clearTimeout(happyTimer.current)
    }
  }, [])

  const pet = () => {
    const now = Date.now()
    if (now - lastPet.current < COOLDOWN_MS) return
    lastPet.current = now

    const count = 2 + Math.floor(Math.random() * 3) // 2~4개
    const batch = Array.from({ length: count }, (_, i) => ({
      id: `${now}-${i}`,
      left: 8 + Math.random() * 72, // %
      delay: i * 0.09,
      px: Math.random() < 0.5 ? 3 : 4
    }))
    setHearts((prev) => [...prev, ...batch].slice(-MAX_HEARTS))
    window.setTimeout(() => {
      if (!alive.current) return
      const ids = new Set(batch.map((b) => b.id))
      setHearts((prev) => prev.filter((h) => !ids.has(h.id)))
    }, HEART_LIFETIME_MS)

    if (!reduceMotion) {
      setHappy(true)
      window.clearTimeout(happyTimer.current)
      happyTimer.current = window.setTimeout(() => {
        if (alive.current) setHappy(false)
      }, 500)
    }
  }

  return (
    <button
      type="button"
      className="px-pet-btn"
      onClick={pet}
      aria-label="고양이에게 하트 보내기"
    >
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span className={happy ? 'px-cat-jump' : ''} style={{ display: 'inline-block' }}>
          <PixelCat state={state} px={px} />
        </span>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'visible'
          }}
        >
          {hearts.map((h) => (
            <span
              key={h.id}
              className={reduceMotion ? '' : 'px-float-heart'}
              style={{
                position: 'absolute',
                top: -6,
                left: `${h.left}%`,
                animationDelay: `${h.delay}s`
              }}
            >
              <Sprite grid={HEART} px={h.px} />
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}
