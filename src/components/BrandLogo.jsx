import { useState } from 'react'
import { BRAND, LOGO_SRC } from '../config/site'

// 회사 로고 — public/lunervia-logo.png 가 있으면 이미지를 쓰고,
// 없으면 텍스트 로고로 자동 fallback 한다. 로고 교체는 파일만 갈아끼우면 됨.
// 원본 로고가 흰색이라 어두운 딥핑크 칩 위에 올린다.
export default function BrandLogo({ size = 'md' }) {
  const [imgOk, setImgOk] = useState(true)
  const imgH = size === 'sm' ? 26 : 42
  const fontSize = size === 'sm' ? 12 : 14

  if (imgOk) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '5px 10px',
          background: 'var(--px-deep)',
          border: '2px solid var(--px-border)',
          boxShadow: '2px 2px 0 var(--px-shadow)'
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}${LOGO_SRC}`}
          alt={BRAND.name}
          style={{ height: imgH, display: 'block' }}
          onError={() => setImgOk(false)}
        />
      </span>
    )
  }

  return (
    <span
      aria-label={BRAND.name}
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        border: '2px solid var(--px-border)',
        background: 'var(--px-cream)',
        boxShadow: '2px 2px 0 var(--px-shadow)',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--px-text)'
      }}
    >
      {BRAND.name}
    </span>
  )
}
