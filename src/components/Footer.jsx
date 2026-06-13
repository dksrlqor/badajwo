import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { BRAND, SNS_LINKS, CONTACT_EMAIL, BUSINESS } from '../config/site'

// 받아줘 공통 footer.
//   variant="full"    메인·작성 등 일반 페이지 — 로고/소개 + 링크 정리
//   variant="minimal" 편지 열람 화면 — 감성을 해치지 않는 한 줄짜리
// SNS·문의처는 site.js 에 실제 주소가 있을 때만 노출된다.

const YEAR = 2026

function FooterLink({ to, href, children }) {
  const cls = 'text-[12px]'
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
      {children}
    </a>
  )
}

export default function Footer({ variant = 'full' }) {
  if (variant === 'minimal') {
    return (
      <footer className="px-footer mt-12 px-4 py-4 text-center">
        <p className="text-[11px]" style={{ color: 'var(--px-deep)' }}>
          © {YEAR} {BRAND.name}. All rights reserved. ·{' '}
          <Link to="/privacy">개인정보 처리방침</Link> ·{' '}
          <Link to="/terms">이용약관</Link>
        </p>
      </footer>
    )
  }

  const snsLinks = SNS_LINKS.filter((l) => l && l.href)

  // 사업자 정보 — 값이 있는 항목만 가운뎃점으로 이어 한 줄로.
  const businessText = [
    BUSINESS.company && `상호: ${BUSINESS.company}`,
    BUSINESS.owner && `대표: ${BUSINESS.owner}`,
    BUSINESS.registrationNo && `사업자등록번호: ${BUSINESS.registrationNo}`
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <footer className="px-footer mt-12 px-5 py-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:gap-8 text-center sm:text-left">
        <div>
          <BrandLogo />
          <div
            className="mt-2 text-[13px] font-bold"
            style={{ color: 'var(--px-text)' }}
          >
            {BRAND.service}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: 'var(--px-deep)' }}>
            {BRAND.tagline}
          </div>
        </div>

        <nav aria-label="사이트 링크">
          <ul className="space-y-1.5 sm:text-right">
            {snsLinks.map((l) => (
              <li key={l.label}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
            {CONTACT_EMAIL && (
              <li>
                <FooterLink href={`mailto:${CONTACT_EMAIL}`}>문의하기</FooterLink>
              </li>
            )}
            <li>
              <FooterLink to="/privacy">개인정보 처리방침</FooterLink>
            </li>
            <li>
              <FooterLink to="/terms">이용약관</FooterLink>
            </li>
          </ul>
        </nav>
      </div>

      {businessText && (
        <p
          className="mt-5 text-center text-[11px] leading-relaxed"
          style={{ color: 'var(--px-deep)' }}
        >
          {businessText}
        </p>
      )}

      <p
        className="mt-4 pt-3 text-center text-[11px]"
        style={{
          color: 'var(--px-deep)',
          borderTop: '2px dashed rgba(158, 92, 100, 0.25)'
        }}
      >
        <span aria-hidden style={{ color: 'var(--px-heart)' }}>
          ♥
        </span>{' '}
        © {YEAR} {BRAND.name}. All rights reserved.
      </p>
    </footer>
  )
}
