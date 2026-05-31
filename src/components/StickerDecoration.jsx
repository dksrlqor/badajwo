// 편지지·폴라로이드 주변에 스티커를 자동으로 흩뿌리는 컴포넌트.
// 자유 배치 편집기 대신 미리 정해진 슬롯에 두는 MVP 방식.

const PRESET_SLOTS = [
  { top: '4%', right: '6%', rotate: 14 },
  { bottom: '8%', left: '5%', rotate: -10 },
  { top: '40%', left: '-2%', rotate: 6 },
  { bottom: '24%', right: '-2%', rotate: 18 }
]

const DEFAULT_PALETTE = ['🌸', '⭐', '🌿', '✨']

export default function StickerDecoration({
  stickers,
  count = 2,
  size = 22,
  className = ''
}) {
  const picks =
    stickers && stickers.length ? stickers : DEFAULT_PALETTE.slice(0, count)
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {picks.slice(0, PRESET_SLOTS.length).map((s, i) => {
        const slot = PRESET_SLOTS[i]
        return (
          <div
            key={i}
            className="absolute"
            style={{
              ...slot,
              transform: `rotate(${slot.rotate}deg)`,
              fontSize: size,
              filter: 'drop-shadow(0 2px 4px rgba(80,60,50,0.18))',
              opacity: 0.96
            }}
          >
            {s}
          </div>
        )
      })}
    </div>
  )
}
