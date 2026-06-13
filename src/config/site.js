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

// 문의는 인스타그램 DM 으로 받는다 — 기업/개인 채널 구분.
export const SNS_LINKS = [
  { label: '기업 문의 · Instagram @lunerviasoft', href: 'https://www.instagram.com/lunerviasoft' },
  { label: '개인 문의 · Instagram @dksrlqor', href: 'https://www.instagram.com/dksrlqor' }
  // TikTok 등 새 SNS 는 여기에 { label, href } 로 추가
]

export const CONTACT_EMAIL = '' // 이메일 문의는 사용하지 않음 (인스타 DM 로 받음)

// 사업자 정보 — footer 하단에 한 줄로 표기. 빈 항목은 자동으로 숨겨진다.
// (상호/대표자명은 사업자등록증 표기 그대로 유지할 것)
export const BUSINESS = {
  company: '루네르비아',          // 상호 (등록증 표기 — 한글)
  owner: '안기백',                // 대표자
  registrationNo: '283-42-01448'  // 사업자 등록번호
}
