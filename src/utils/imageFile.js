// 파일 → DataURL + 크기 축소.
// localStorage 용량 보호 + 뷰페이지 빠른 렌더를 위해 긴 변 1200px / JPEG 0.86 로 압축.

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('파일을 읽지 못했어요.'))
    r.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이미지를 불러오지 못했어요.'))
    img.src = src
  })
}

export async function loadAndDownscale(file, maxDim = 1200, quality = 0.86) {
  const raw = await readFileAsDataURL(file)
  const img = await loadImage(raw)
  const { width, height } = img
  const scale = Math.min(1, maxDim / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}
