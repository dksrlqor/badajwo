// 받아줘 — 인스타 스토리 공유용 이미지 생성기 (8비트 픽셀 컨셉).
// 1080 × 1920 portrait canvas 에 픽셀 윈도우 + 배달 고양이 + 받는 이름 + 링크를 그린다.
// 색·도트·폰트는 사이트(pixel.css / PixelCat / Sprite)와 동일하게 맞춘다.
// 결과 Blob 을 navigator.share files 로 OS 공유 시트에 넘기면 인스타 → 스토리에 추가로 들어간다.

import { PX } from '../components/pixel/Sprite'

const W = 1080
const H = 1920

// 디자인 토큰 — src/styles/pixel.css :root 와 동일.
const C = {
  bg: '#FFF7F3',
  cream: '#FFFDF8',
  surface: '#FFE1E8',
  pink: '#F3A6B5',
  deep: '#C96F7F',
  border: '#9E5C64',
  text: '#4A2F35',
  heart: '#E45C7A',
  white: '#FFFFFF',
  shadow: 'rgba(158, 92, 100, 0.30)'
}

const FONT = "'Galmuri11', 'Galmuri9', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"

// ── 고양이 도트 (PixelCat.jsx 와 동일 그리드) ──────────────
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

// 작은 하트 (타이틀/배경 패턴용)
const HEART_MINI = [
  '.hh.hh.',
  'hhhhhhh',
  'hhhhhhh',
  '.hhhhh.',
  '..hhh..',
  '...h...'
]

// ── 헬퍼 ──────────────────────────────────────────────────
// 문자 그리드 → 캔버스 픽셀(rect). Sprite.jsx 의 캔버스판.
function drawSprite(ctx, grid, ox, oy, px, palette = PX) {
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]
    for (let x = 0; x < row.length; x++) {
      const fill = palette[row[x]]
      if (!fill) continue
      ctx.fillStyle = fill
      ctx.fillRect(ox + x * px, oy + y * px, px, px)
    }
  }
}

// 단색 하트(특정 색) 그리드 그리기
function drawHeart(ctx, ox, oy, px, color) {
  drawSprite(ctx, HEART_MINI, ox, oy, px, { h: color })
}

// 크림 배경 + 흩뿌린 픽셀 하트 패턴
function drawBackground(ctx) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  const px = 4
  const hw = HEART_MINI[0].length * px // 28
  const stepX = 150
  const stepY = 150
  let row = 0
  for (let y = -hw; y < H + hw; y += stepY) {
    const offset = row % 2 === 0 ? 0 : stepX / 2
    let col = 0
    for (let x = -hw + offset; x < W + hw; x += stepX) {
      const usePink = (row + col) % 2 === 0
      ctx.globalAlpha = usePink ? 0.16 : 0.1
      drawHeart(ctx, x, y, px, usePink ? C.pink : C.heart)
      col++
    }
    row++
  }
  ctx.globalAlpha = 1
}

// 픽셀 윈도우 (타이틀바 + 본문 + 하드 섀도)
function drawWindow(ctx, x, y, w, h) {
  const tbH = 124
  const b = 8

  // 하드 섀도
  ctx.fillStyle = C.shadow
  ctx.fillRect(x + 18, y + 18, w, h)

  // 본문 (크림)
  ctx.fillStyle = C.cream
  ctx.fillRect(x, y, w, h)

  // 타이틀바 (핑크)
  ctx.fillStyle = C.pink
  ctx.fillRect(x, y, w, tbH)
  // 타이틀바 하단 경계
  ctx.fillStyle = C.border
  ctx.fillRect(x, y + tbH - b, w, b)

  // 외곽 테두리
  ctx.fillStyle = C.border
  ctx.fillRect(x, y, w, b) // top
  ctx.fillRect(x, y + h - b, w, b) // bottom
  ctx.fillRect(x, y, b, h) // left
  ctx.fillRect(x + w - b, y, b, h) // right

  // 타이틀: ♡ 받아줘 ♡
  const cx = x + w / 2
  const ty = y + tbH / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 50px ${FONT}`
  const title = '받아줘'
  const tW = ctx.measureText(title).width
  ctx.fillStyle = C.text
  ctx.fillText(title, cx, ty + 2)
  // 양옆 픽셀 하트
  const hpx = 5
  const heartW = HEART_MINI[0].length * hpx
  const heartH = HEART_MINI.length * hpx
  drawHeart(ctx, cx - tW / 2 - 46 - heartW / 2, ty - heartH / 2, hpx, C.heart)
  drawHeart(ctx, cx + tW / 2 + 46 - heartW / 2, ty - heartH / 2, hpx, C.heart)

  // 우상단 컨트롤 칩 2개
  const chip = 26
  const chipY = y + (tbH - b - chip) / 2
  for (let i = 0; i < 2; i++) {
    const chipX = x + w - 40 - (1 - i) * (chip + 12) - chip
    ctx.fillStyle = C.cream
    ctx.fillRect(chipX, chipY, chip, chip)
    ctx.fillStyle = C.border
    ctx.lineWidth = 3
    ctx.strokeRect(chipX + 1.5, chipY + 1.5, chip - 3, chip - 3)
  }

  return { bodyTop: y + tbH, bodyLeft: x + b, bodyRight: x + w - b }
}

// 픽셀 버튼/박스 (사각형 + 두꺼운 테두리 + 하드 섀도)
function drawPixelBox(ctx, x, y, w, h, { fill, border = C.border, shadow = true }) {
  if (shadow) {
    ctx.fillStyle = C.shadow
    ctx.fillRect(x + 8, y + 8, w, h)
  }
  ctx.fillStyle = fill
  ctx.fillRect(x, y, w, h)
  const b = 6
  ctx.fillStyle = border
  ctx.fillRect(x, y, w, b)
  ctx.fillRect(x, y + h - b, w, b)
  ctx.fillRect(x, y, b, h)
  ctx.fillRect(x + w - b, y, b, h)
}

// ── 메인 — 스토리 이미지 빌더 ─────────────────────────────
// type: 'ask' (나에게 편지 써줘) | 'sent' (편지가 도착했어요)
export async function buildStoryImage({ type = 'ask', receiverName = '', url }) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false

  // Galmuri 폰트 로드 보장 (안 되면 시스템 폰트로라도 진행)
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load(`700 72px 'Galmuri11'`),
        document.fonts.load(`400 36px 'Galmuri11'`)
      ])
      await document.fonts.ready
    } catch {}
  }

  drawBackground(ctx)

  // 상단 사이트 마크
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = C.deep
  ctx.font = `700 34px ${FONT}`
  ctx.fillText('takemyletter.site', W / 2, 150)

  // 윈도우
  const wx = 70
  const wy = 280
  const ww = W - 2 * wx
  const wh = 1180
  const { bodyTop, bodyLeft, bodyRight } = drawWindow(ctx, wx, wy, ww, wh)
  const cx = W / 2
  const bodyW = bodyRight - bodyLeft

  // 배달 고양이 (ask=봉투 / sent=하트 안기)
  const catPx = 17
  const catW = 16 * catPx
  const catOx = cx - catW / 2
  const catOy = bodyTop + 70
  drawSprite(ctx, TAIL_A, catOx, catOy, catPx)
  drawSprite(ctx, CAT_BASE, catOx, catOy, catPx)
  drawSprite(ctx, type === 'sent' ? HUG_HEART : HOLD_ENVELOPE, catOx, catOy, catPx)

  // 헤드라인
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = C.text
  ctx.font = `700 76px ${FONT}`
  ctx.fillText(type === 'sent' ? '편지가 도착했어요' : '나에게 편지 써줘', cx, catOy + 14 * catPx + 120)

  // 부제
  ctx.fillStyle = C.deep
  ctx.font = `400 36px ${FONT}`
  ctx.fillText(
    type === 'sent' ? '너에게 도착한 작은 마음' : '익명으로도, 이름을 적어서도 괜찮아',
    cx,
    catOy + 14 * catPx + 184
  )

  // TO. 박스 (받는 이름)
  const toY = catOy + 14 * catPx + 250
  const toH = 168
  const toX = bodyLeft + 40
  const toW = bodyW - 80
  drawPixelBox(ctx, toX, toY, toW, toH, { fill: C.surface })
  ctx.textAlign = 'left'
  ctx.fillStyle = C.deep
  ctx.font = `700 30px ${FONT}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('TO.', toX + 44, toY + 58)
  ctx.fillStyle = C.text
  ctx.font = `700 76px ${FONT}`
  const name = (receiverName || '').slice(0, 16)
  ctx.fillText(name, toX + 44, toY + 132)

  // 안내 문구
  ctx.textAlign = 'center'
  ctx.fillStyle = C.text
  ctx.font = `400 36px ${FONT}`
  ctx.fillText(
    type === 'sent' ? '아래 링크로 편지를 열어볼 수 있어' : '아래 링크를 누르면 나에게 편지를 쓸 수 있어',
    cx,
    toY + toH + 90
  )

  // 링크 버튼 (딥핑크)
  const lY = toY + toH + 140
  const lH = 132
  const lX = bodyLeft + 40
  const lW = bodyW - 80
  drawPixelBox(ctx, lX, lY, lW, lH, { fill: C.deep })
  let displayUrl = (url || 'takemyletter.site').replace(/^https?:\/\//, '')
  if (displayUrl.length > 30) displayUrl = displayUrl.slice(0, 29) + '…'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = C.cream
  ctx.font = `700 42px ${FONT}`
  ctx.fillText(displayUrl, cx, lY + lH / 2 + 2)

  // 하단 태그라인
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  drawHeart(ctx, cx - 9, 1700, 3, C.heart)
  ctx.fillStyle = C.deep
  ctx.font = `700 36px ${FONT}`
  ctx.fillText('받아줘 · takemyletter.site', cx, 1790)
  ctx.fillStyle = C.text
  ctx.font = `400 28px ${FONT}`
  ctx.fillText('말로 하기 어려운 마음을, 픽셀 편지로', cx, 1842)

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('canvas toBlob failed'))
        resolve(blob)
      },
      'image/png',
      0.95
    )
  })
}

// 공유 — Web Share API 로 OS 공유 시트 → 인스타 → 스토리에 추가.
// 실패 시 이미지 다운로드 + 링크 복사 + 인스타 카메라 딥링크 시도.
export async function shareToInstagramStory({ blob, url, fileName = 'badajwo-story.png' }) {
  const file = new File([blob], fileName, { type: 'image/png' })
  // 1) Web Share with files
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: '받아줘 - takemyletter.site',
        text: url || ''
      })
      return { ok: true, method: 'webshare' }
    } catch (err) {
      if (err && err.name === 'AbortError') {
        return { ok: false, aborted: true }
      }
      // continue to fallback
    }
  }

  // 2) Fallback: 이미지 다운로드 + 링크 클립보드 + 인스타 딥링크
  try {
    const a = document.createElement('a')
    const objUrl = URL.createObjectURL(blob)
    a.href = objUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(objUrl), 1000)
  } catch {}

  try {
    if (url && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
    }
  } catch {}

  // 인스타 카메라 딥링크는 모바일에서만 동작. 데스크탑에선 무시됨.
  const isMobile =
    typeof navigator !== 'undefined' &&
    /android|iphone|ipad|ipod/i.test(navigator.userAgent || '')
  if (isMobile) {
    setTimeout(() => {
      window.location.href = 'instagram://story-camera'
    }, 600)
  }

  return { ok: true, method: 'fallback' }
}
