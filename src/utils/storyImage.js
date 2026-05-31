// 받아줘 — 인스타 스토리 공유용 이미지 생성기.
// 1080 × 1920 portrait canvas 에 빈티지 airmail 봉투 + 받는 이름 + 링크를 그린다.
// 결과 Blob 을 navigator.share files 로 OS 공유 시트에 넘기면, 인스타 → 스토리에 추가에서
// 그대로 배경 이미지로 들어간다. (탭 가능한 링크 스티커는 웹에서 자동 주입 불가 — 인스타 자체 제약)

const W = 1080
const H = 1920

const COLORS = {
  paperTop: '#FDF8EE',
  paperMid: '#FAF1E1',
  paperBot: '#F2E2C6',
  envelopeBg: '#FCF6E6',
  airmailRed: '#C7443E',
  airmailBlue: '#4E6B8A',
  ink: '#3D2E22',
  inkSoft: '#5A4538',
  inkMuted: '#86705E',
  inkFaded: '#B3987B',
  stampLeaf: '#5C7050',
  stampLeafSoft: '#7D9270',
  stampLeafBright: '#8BA37E'
}

// 빈티지 종이 배경 + 미세 noise + 가장자리 vignette.
function drawPaperBackground(ctx) {
  // 세로 그라데이션
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, COLORS.paperTop)
  g.addColorStop(0.55, COLORS.paperMid)
  g.addColorStop(1, COLORS.paperBot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // 따뜻한 빛 스폿
  const r1 = ctx.createRadialGradient(W * 0.2, H * 0.18, 0, W * 0.2, H * 0.18, W * 0.55)
  r1.addColorStop(0, 'rgba(255,255,255,0.22)')
  r1.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = r1
  ctx.fillRect(0, 0, W, H)

  const r2 = ctx.createRadialGradient(W * 0.85, H * 0.78, 0, W * 0.85, H * 0.78, W * 0.5)
  r2.addColorStop(0, 'rgba(180,135,95,0.10)')
  r2.addColorStop(1, 'rgba(180,135,95,0)')
  ctx.fillStyle = r2
  ctx.fillRect(0, 0, W, H)

  // 갈색 spots (오래된 종이 얼룩)
  ctx.save()
  for (let i = 0; i < 28; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const rx = 4 + Math.random() * 7
    const ry = rx * (0.6 + Math.random() * 0.6)
    ctx.fillStyle = `rgba(120, 80, 40, ${0.08 + Math.random() * 0.10})`
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // 미세 noise — random dots
  ctx.save()
  ctx.globalAlpha = 0.05
  for (let i = 0; i < 2400; i++) {
    ctx.fillStyle = '#3D2E22'
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
  }
  ctx.restore()

  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.45, W / 2, H / 2, W * 0.85)
  vg.addColorStop(0, 'rgba(120,80,40,0)')
  vg.addColorStop(1, 'rgba(120,80,40,0.22)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)
}

// 빅토리안 ornament line — 작은 곡선과 다이아 마름모.
function drawOrnamentLine(ctx, cx, cy, width = 360, color = COLORS.inkMuted) {
  ctx.save()
  ctx.translate(cx - width / 2, cy)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.7

  // 좌측 곡선
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(width * 0.08, -16, width * 0.18, 0)
  ctx.stroke()

  // 좌측 다이아
  ctx.beginPath()
  ctx.moveTo(width * 0.22, 0)
  ctx.lineTo(width * 0.25, -10)
  ctx.lineTo(width * 0.28, 0)
  ctx.lineTo(width * 0.25, 10)
  ctx.closePath()
  ctx.stroke()

  // 중앙 곡선
  ctx.beginPath()
  ctx.moveTo(width * 0.32, 0)
  ctx.quadraticCurveTo(width * 0.42, -18, width * 0.5, 0)
  ctx.quadraticCurveTo(width * 0.58, 18, width * 0.68, 0)
  ctx.stroke()

  // 중앙 점
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(width * 0.5, 0, 4, 0, Math.PI * 2)
  ctx.fill()

  // 우측 다이아
  ctx.beginPath()
  ctx.moveTo(width * 0.72, 0)
  ctx.lineTo(width * 0.75, -10)
  ctx.lineTo(width * 0.78, 0)
  ctx.lineTo(width * 0.75, 10)
  ctx.closePath()
  ctx.stroke()

  // 우측 곡선
  ctx.beginPath()
  ctx.moveTo(width * 0.82, 0)
  ctx.quadraticCurveTo(width * 0.92, -16, width, 0)
  ctx.stroke()

  ctx.restore()
}

// airmail 봉투 외곽의 빨강/파랑 사선 띠.
function drawAirmailBorder(ctx, x, y, w, h, borderWidth = 24) {
  ctx.save()
  // 1) 봉투 자체 박스 (그림자 포함)
  ctx.shadowColor = 'rgba(92, 62, 40, 0.30)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 24
  ctx.fillStyle = COLORS.envelopeBg
  roundRect(ctx, x, y, w, h, 18)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // 2) 외곽 띠 영역만 클립 — 사각형 두 개의 even-odd
  ctx.save()
  ctx.beginPath()
  roundRect(ctx, x, y, w, h, 18)
  roundRect(ctx, x + borderWidth, y + borderWidth, w - 2 * borderWidth, h - 2 * borderWidth, 10)
  ctx.clip('evenodd')

  // 3) 클립 안에 빨강/파랑 사선 패턴
  const stripeSize = 38
  const colors = [COLORS.airmailRed, COLORS.envelopeBg, COLORS.airmailBlue, COLORS.envelopeBg]
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(Math.PI / 4) // 45도
  const reach = Math.max(w, h) * 1.5
  for (let i = -reach; i < reach; i += stripeSize) {
    ctx.fillStyle = colors[Math.floor((i + reach) / stripeSize) % colors.length]
    ctx.fillRect(i, -reach, stripeSize, reach * 2)
  }
  ctx.restore()
  ctx.restore()

  // 4) inner 면 위 미세 grain
  ctx.save()
  ctx.beginPath()
  roundRect(ctx, x + borderWidth + 2, y + borderWidth + 2, w - 2 * borderWidth - 4, h - 2 * borderWidth - 4, 8)
  ctx.clip()
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = '#3D2E22'
    ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 1.4, 1.4)
  }
  ctx.restore()

  ctx.restore()
}

// 잎 일러스트 우표 (톱니 가장자리는 단순화 — 작은 점 둘레로 표현)
function drawStamp(ctx, x, y, w, h, rotation = -0.08) {
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(rotation)
  ctx.translate(-w / 2, -h / 2)

  // 그림자
  ctx.shadowColor = 'rgba(92, 62, 40, 0.35)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 10

  // 톱니 흉내 — 외곽
  ctx.fillStyle = '#F8EFD8'
  roundRect(ctx, 0, 0, w, h, 4)
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // 톱니 점들
  ctx.fillStyle = COLORS.paperTop
  const perfStep = 14
  for (let i = perfStep / 2; i < w; i += perfStep) {
    ctx.beginPath()
    ctx.arc(i, 0, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(i, h, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = perfStep / 2; i < h; i += perfStep) {
    ctx.beginPath()
    ctx.arc(0, i, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(w, i, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 안쪽 색지
  const inset = 12
  ctx.fillStyle = COLORS.envelopeBg
  roundRect(ctx, inset, inset, w - 2 * inset, h - 2 * inset, 2)
  ctx.fill()
  ctx.strokeStyle = COLORS.stampLeaf
  ctx.lineWidth = 3
  ctx.stroke()

  // 잎 일러스트 (간단화)
  ctx.save()
  ctx.translate(w / 2, h / 2 - 14)
  ctx.strokeStyle = COLORS.stampLeaf
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 40)
  ctx.lineTo(0, -40)
  ctx.stroke()
  // 잎사귀들
  const leaves = [
    { x: -22, y: -28, rx: 18, ry: 8, rot: -0.5, c: COLORS.stampLeafSoft },
    { x: 22, y: -22, rx: 18, ry: 8, rot: 0.5, c: COLORS.stampLeafBright },
    { x: -25, y: -4, rx: 20, ry: 9, rot: -0.45, c: COLORS.stampLeaf },
    { x: 25, y: 2, rx: 20, ry: 9, rot: 0.5, c: COLORS.stampLeafSoft },
    { x: -22, y: 22, rx: 18, ry: 8, rot: -0.4, c: COLORS.stampLeafBright },
    { x: 22, y: 28, rx: 18, ry: 8, rot: 0.45, c: COLORS.stampLeaf }
  ]
  leaves.forEach((l) => {
    ctx.save()
    ctx.translate(l.x, l.y)
    ctx.rotate(l.rot)
    ctx.fillStyle = l.c
    ctx.beginPath()
    ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
  ctx.restore()

  // POSTAGE 텍스트
  ctx.fillStyle = COLORS.stampLeaf
  ctx.font = '600 18px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('POSTAGE', w / 2, h - 22)

  ctx.restore()
}

// 우편 소인 — dashed 둥근 원 + 도시명 + 받아줘 마크
function drawPostmark(ctx, cx, cy, radius, rotation = -0.2, city = 'SEOUL', date = null) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  const color = 'rgba(78, 107, 138, 0.65)'
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.setLineDash([10, 8])
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // 위 아치 텍스트 — city
  ctx.fillStyle = color
  ctx.font = '600 24px Georgia, serif'
  ctx.textAlign = 'center'
  drawTextOnArc(ctx, city, 0, 0, radius * 0.86, -Math.PI / 2, 0.012)

  // 아래 아치 — 날짜
  const today = date || new Date()
  const dStr = `${today.getDate()}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`
  ctx.font = '500 20px Georgia, serif'
  drawTextOnArc(ctx, dStr, 0, 0, radius * 0.86, Math.PI / 2, -0.012, true)

  // 중앙 받아줘
  ctx.fillStyle = color
  ctx.font = '600 22px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('받아줘', 0, 4)

  ctx.restore()
}

// 작은 헬퍼들 ─────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawTextOnArc(ctx, text, cx, cy, radius, centerAngle, charStep, flip = false) {
  ctx.save()
  const chars = Array.from(text)
  const totalAngle = (chars.length - 1) * charStep
  let angle = centerAngle - totalAngle / 2
  if (flip) angle = centerAngle + totalAngle / 2
  chars.forEach((ch) => {
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.rotate(flip ? angle - Math.PI / 2 : angle + Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
    angle += flip ? -charStep : charStep
  })
  ctx.restore()
}

// 마스킹테이프 한 조각
function drawMaskingTape(ctx, x, y, w, h, rotation, color) {
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(rotation)
  ctx.translate(-w / 2, -h / 2)
  // 본체 (반투명 사선 패턴)
  ctx.shadowColor = 'rgba(92,62,40,0.25)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 6
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  // 사선 light streaks
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()
  ctx.globalAlpha = 0.4
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  for (let i = -h; i < w + h; i += 18) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + h, h)
    ctx.lineTo(i + h - 9, h)
    ctx.lineTo(i - 9, 0)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
  ctx.restore()
}

// 메인 — 스토리 이미지 빌더 ─────────────────────────────
// type: 'ask' (나한테 편지 써줘) | 'sent' (편지 보냈어요)
export async function buildStoryImage({
  type = 'ask',
  receiverName = '',
  url,
  scale = 1
}) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  drawPaperBackground(ctx)

  // 상단 takemyletter.site 작은 마크
  ctx.fillStyle = COLORS.inkMuted
  ctx.font = '600 30px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('takemyletter.site', W / 2, 160)

  // 헤드라인
  ctx.fillStyle = COLORS.ink
  if (type === 'ask') {
    ctx.font = 'italic bold 96px "Times New Roman", Georgia, serif'
    ctx.fillText('나한테 편지 써줘', W / 2, 290)
  } else {
    ctx.font = 'italic bold 96px "Times New Roman", Georgia, serif'
    ctx.fillText('편지가 도착했어요', W / 2, 290)
  }

  drawOrnamentLine(ctx, W / 2, 360, 360, COLORS.inkMuted)

  // 봉투
  const eX = 90
  const eY = 470
  const eW = W - 2 * eX
  const eH = 800
  ctx.save()
  ctx.translate(W / 2, eY + eH / 2)
  ctx.rotate(-0.025)
  ctx.translate(-W / 2, -(eY + eH / 2))
  drawAirmailBorder(ctx, eX, eY, eW, eH, 28)

  // AIR MAIL 라벨
  ctx.fillStyle = '#F8EFD8'
  roundRect(ctx, eX + 60, eY + 70, 380, 60, 6)
  ctx.fill()
  ctx.strokeStyle = 'rgba(92,62,40,0.42)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 5])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.inkSoft
  ctx.font = '600 28px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(type === 'ask' ? '나한테 편지 써줘' : 'AIR MAIL · PAR AVION', eX + 60 + 190, eY + 109)

  // 봉투 안 — TO. 라벨
  ctx.fillStyle = COLORS.inkMuted
  ctx.font = '600 36px Georgia, serif'
  ctx.textAlign = 'left'
  ctx.fillText('TO.', eX + 70, eY + 360)

  // 받는 이름 — 큰 손글씨
  ctx.fillStyle = COLORS.ink
  ctx.font = 'italic bold 130px "Times New Roman", Georgia, serif'
  const displayName = (receiverName || '').slice(0, 12)
  ctx.fillText(displayName, eX + 70, eY + 500)

  // 이름 아래 밑줄
  ctx.strokeStyle = 'rgba(92, 62, 40, 0.5)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(eX + 70, eY + 524)
  ctx.lineTo(eX + eW - 70, eY + 524)
  ctx.stroke()

  // 부제
  if (type === 'ask') {
    ctx.fillStyle = COLORS.inkMuted
    ctx.font = 'italic 40px Georgia, serif'
    ctx.fillText('— 친구야, 편지 한 통 써줄래?', eX + 70, eY + 610)
  } else {
    ctx.fillStyle = COLORS.inkMuted
    ctx.font = 'italic 40px Georgia, serif'
    ctx.fillText('— 너에게 도착한 편지', eX + 70, eY + 610)
  }
  ctx.restore()

  // 봉투 위 우표 + 소인 (회전 적용된 봉투 좌표 위에 별도로)
  ctx.save()
  ctx.translate(W / 2, eY + eH / 2)
  ctx.rotate(-0.025)
  ctx.translate(-W / 2, -(eY + eH / 2))
  // 우표 (우상단)
  drawStamp(ctx, eX + eW - 200, eY + 60, 160, 200, -0.08)
  // 소인 (우표 좌측 살짝 겹침)
  drawPostmark(ctx, eX + eW - 280, eY + 230, 90, -0.18, type === 'ask' ? 'LETTER' : 'SEOUL')
  ctx.restore()

  // 봉투 위 마스킹테이프 — 모서리에 살짝
  drawMaskingTape(ctx, eX + 80, eY - 30, 160, 50, -0.18, 'rgba(220, 200, 170, 0.78)')
  drawMaskingTape(ctx, eX + eW - 220, eY - 22, 150, 46, 0.16, 'rgba(178, 198, 168, 0.82)')

  // 봉투 아래 — 안내 문구 + 링크
  ctx.fillStyle = COLORS.inkSoft
  ctx.font = '600 38px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(
    type === 'ask' ? '링크를 누르면 너에게 편지를 쓸 수 있어' : '링크를 누르면 편지를 열어볼 수 있어',
    W / 2,
    1410
  )

  // 링크 박스
  const lX = 120
  const lY = 1470
  const lW = W - 2 * lX
  const lH = 130
  ctx.save()
  ctx.shadowColor = 'rgba(92,62,40,0.20)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#FBF0DC'
  roundRect(ctx, lX, lY, lW, lH, 16)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = 'rgba(92,62,40,0.30)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 6])
  roundRect(ctx, lX, lY, lW, lH, 16)
  ctx.stroke()
  ctx.setLineDash([])

  // 링크 본문 — 너무 길면 줄임
  let displayUrl = url || ''
  displayUrl = displayUrl.replace(/^https?:\/\//, '')
  if (displayUrl.length > 36) displayUrl = displayUrl.slice(0, 33) + '…'
  ctx.fillStyle = COLORS.ink
  ctx.font = '600 38px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(displayUrl, W / 2, lY + lH / 2)

  // 하단 ornament + 안내
  drawOrnamentLine(ctx, W / 2, 1700, 280, COLORS.inkMuted)
  ctx.fillStyle = COLORS.inkMuted
  ctx.font = 'italic 30px Georgia, serif'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  ctx.fillText('takemyletter.site', W / 2, 1780)
  ctx.font = '500 24px Georgia, serif'
  ctx.fillStyle = COLORS.inkFaded
  ctx.fillText('말로 하기 어려운 마음을, 편지로', W / 2, 1830)

  // Blob
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
