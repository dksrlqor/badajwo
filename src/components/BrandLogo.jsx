import { BRAND } from '../config/site'

// 회사 로고 자리 — 지금은 텍스트 placeholder.
// 실제 로고 이미지가 생기면 이 컴포넌트 안에서 <img> 로 교체하면
// footer 등 사용처는 손대지 않아도 된다.
export default function BrandLogo({ size = 'md' }) {
  const fontSize = size === 'sm' ? 12 : 14
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
