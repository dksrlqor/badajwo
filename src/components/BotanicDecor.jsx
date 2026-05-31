// 받아줘 — 화면 모서리에 압화/고사리/말린 꽃을 살짝 흩뿌리는 데코.
// 본문보다 절대 튀지 않게 opacity 낮게, sepia 살짝, 작은 사이즈.
// pointer-events none + z-index 0 로 클릭/스크롤 방해하지 않음.
export default function BotanicDecor() {
  return (
    <div className="botanic-deco" aria-hidden>
      {/* 좌상 — 작은 고사리 잎 */}
      <span
        style={{
          top: 14,
          left: 8,
          fontSize: 28,
          opacity: 0.35,
          transform: 'rotate(-18deg)'
        }}
      >
        🌿
      </span>
      {/* 우상 — 압화 꽃 한 송이 */}
      <span
        style={{
          top: 36,
          right: 12,
          fontSize: 22,
          opacity: 0.32,
          transform: 'rotate(14deg)'
        }}
      >
        🌸
      </span>
      {/* 좌하 — 작은 잎 */}
      <span
        style={{
          bottom: 80,
          left: 6,
          fontSize: 18,
          opacity: 0.28,
          transform: 'rotate(8deg)'
        }}
      >
        🍃
      </span>
      {/* 우하 — 말린 꽃 */}
      <span
        style={{
          bottom: 26,
          right: 16,
          fontSize: 26,
          opacity: 0.34,
          transform: 'rotate(-12deg)'
        }}
      >
        🌾
      </span>
    </div>
  )
}
