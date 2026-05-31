import { useEffect, useRef, useState } from 'react'

// 캔버스 한 장으로 덮개를 그리고, destination-out 으로 긁어 지운다.
// 일정 비율 이상 지워지면 자연스럽게 전체 공개.
// 데스크톱(마우스) + 모바일(터치) 모두 pointer events 로 처리.
export default function ScratchPhotoReveal({
  src,
  threshold = 0.6,
  brushRadius = 22,
  hint = '살짝 긁어보세요',
  onRevealed
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const drawingRef = useRef(false)
  const lastRef = useRef({ x: 0, y: 0 })
  const checkTimerRef = useRef(null)

  const paintCover = () => {
    const c = canvasRef.current
    const container = containerRef.current
    if (!c || !container) return
    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    ctx.globalCompositeOperation = 'source-over'
    const grd = ctx.createLinearGradient(0, 0, w, h)
    grd.addColorStop(0, '#CDBEA1')
    grd.addColorStop(1, '#AB9A7B')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
    // 자잘한 반짝임
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    for (let i = 0; i < 80; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }
    // 힌트 문구
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(hint, w / 2, h / 2)
  }

  useEffect(() => {
    if (revealed) return
    paintCover()
    const onResize = () => paintCover()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, hint, revealed])

  const localPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const erase = (x, y, fromX, fromY) => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    if (fromX != null) {
      ctx.lineWidth = brushRadius * 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  const scheduleCheck = () => {
    if (checkTimerRef.current) return
    checkTimerRef.current = setTimeout(() => {
      checkTimerRef.current = null
      const c = canvasRef.current
      if (!c) return
      const ctx = c.getContext('2d')
      const w = c.width
      const h = c.height
      if (w === 0 || h === 0) return
      try {
        const data = ctx.getImageData(0, 0, w, h).data
        const stride = 16 // 픽셀 샘플링 보폭 (성능 보호)
        let cleared = 0
        let total = 0
        for (let i = 3; i < data.length; i += 4 * stride) {
          if (data[i] < 32) cleared++
          total++
        }
        if (total > 0 && cleared / total >= threshold) {
          setRevealed(true)
          onRevealed?.()
        }
      } catch {
        // CORS 이슈 등으로 getImageData 실패할 수 있음 → 무시
      }
    }, 220)
  }

  const onDown = (e) => {
    if (revealed) return
    drawingRef.current = true
    const p = localPos(e)
    lastRef.current = p
    erase(p.x, p.y)
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }
  const onMove = (e) => {
    if (!drawingRef.current || revealed) return
    const p = localPos(e)
    erase(p.x, p.y, lastRef.current.x, lastRef.current.y)
    lastRef.current = p
    scheduleCheck()
  }
  const onUp = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    scheduleCheck()
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />
      {!revealed && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-grab"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      )}
    </div>
  )
}
