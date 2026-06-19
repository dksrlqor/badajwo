// 받아줘 — 운영 주체·외부 링크 상수.
// 주소가 빈 항목은 footer 에서 자동으로 숨겨져 빈 href 링크가 노출되지 않는다.

export const BRAND = {
  name: 'Lunervia',
  service: '받아줘',
  tagline: '작은 마음을 픽셀 편지로 전하는 공간'
}

// 로고 이미지 — public/lunervia-logo.png 로 넣으면 BrandLogo 가 자동으로 사용한다.
// (파일이 없으면 텍스트 로고로 fallback)
export const LOGO_SRC = 'lunervia-logo.png'

// 문의는 인스타그램 DM 하나로만 받는다.
export const SNS_LINKS = [
  { label: '문의 · Instagram @_dksrlqor', href: 'https://www.instagram.com/_dksrlqor' }
  // TikTok 등 새 SNS 는 여기에 { label, href } 로 추가
]

export const CONTACT_EMAIL = '' // 이메일 문의는 사용하지 않음 (인스타 DM 로 받음)
