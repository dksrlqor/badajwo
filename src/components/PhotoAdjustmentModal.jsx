import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function PhotoAdjustmentModal({ photo, onApply, onCancel }) {
  const [scale, setScale] = useState(photo.scale || 1)
  const [offsetX, setOffsetX] = useState(photo.offsetX || 0)
  const [offsetY, setOffsetY] = useState(photo.offsetY || 0)
  const pointerRef = useRef(null)
  const dragRef = useRef({ startX: 0, startY: 0, baseX: 0, baseY: 0 })

  const onPointerDown = (e) => {
    pointerRef.current = e.pointerId
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offsetX,
      baseY: offsetY
    }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }
  const onPointerMove = (e) => {
    if (pointerRef.current !== e.pointerId) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setOffsetX(dragRef.current.baseX + dx)
    setOffsetY(dragRef.current.baseY + dy)
  }
  const onPointerUp = (e) => {
    if (pointerRef.current === e.pointerId) {
      pointerRef.current = null
      try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    }
  }

  const reset = () => {
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-5"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-cream-50 rounded-3xl p-6 w-full max-w-sm shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-ink-900 text-center mb-2">
          사진 위치 조절
        </h3>
        <p className="text-xs text-ink-500 text-center mb-5 leading-relaxed">
          사진을 끌어서 옮기고,
          <br />
          아래 슬라이더로 크기를 맞춰보세요.
        </p>
        <div
          className="relative w-full overflow-hidden bg-cream-100 rounded-2xl mx-auto mb-5 select-none"
          style={{ aspectRatio: '1 / 1', touchAction: 'none', cursor: 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            src={photo.src}
            alt=""
            draggable={false}
            className="absolute top-1/2 left-1/2 pointer-events-none select-none"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${scale})`
            }}
          />
          <div className="absolute inset-0 ring-2 ring-white/50 ring-inset pointer-events-none rounded-2xl" />
        </div>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-ink-500">크기</label>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-accent-pinkDeep hover:underline underline-offset-2"
            >
              처음으로
            </button>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.02"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
            style={{ accentColor: '#E89AB4' }}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-white border border-cream-200 text-ink-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onApply({ scale, offsetX, offsetY })}
            className="flex-1 py-3 rounded-2xl bg-ink-900 text-white"
          >
            적용
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
