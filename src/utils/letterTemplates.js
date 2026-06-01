// 받아줘 간단편지 — 편지지 템플릿 메타데이터.
// 실제 렌더링은 components/letterTemplates/<id>Template.jsx 가 담당한다.
//
// 템플릿을 새로 추가할 때:
//   1) 이 배열에 메타데이터 항목을 추가
//   2) components/letterTemplates/ 아래에 컴포넌트 파일 추가
//   3) LetterTemplateRenderer.jsx 의 import/매핑에 등록
//
// id 는 storage 의 simpleLetter.templateId 와 동일한 문자열이어야 한다.
// 백엔드 이전 시에는 이 메타데이터를 서버 응답으로 받아도 좋다.

export const LETTER_TEMPLATES = [
  {
    id: 'friend-scrapbook-letter',
    name: '따뜻한 스크랩북',
    category: 'friend',
    description: '친구에게 보내기 좋은 빈티지 스크랩북 감성 편지지',
    mood: 'warm, vintage, scrapbook',
    supportsPhotos: true,
    supportsMusic: true,
    // 미리보기 카드용 색 토큰 — 실제 본문 렌더 색은 컴포넌트가 정의.
    swatch: {
      paper: '#F1E2C8',
      accent: '#A67A4A',
      ink: '#4A3320'
    }
  },
  {
    id: 'couple-romantic-letter',
    name: '분홍빛 마음',
    category: 'couple',
    description: '연인과 기념일에 어울리는 로맨틱 편지지',
    mood: 'romantic, soft, pink',
    supportsPhotos: true,
    supportsMusic: true,
    swatch: {
      paper: '#FBE6E8',
      accent: '#C57F86',
      ink: '#4A2E2A'
    }
  },
  {
    id: 'classic-photo-letter',
    name: '차분한 포토 편지',
    category: 'etc',
    description: '고마운 사람에게 보내기 좋은 깔끔한 포토 편지지',
    mood: 'clean, classic, calm',
    supportsPhotos: true,
    supportsMusic: true,
    swatch: {
      paper: '#FBF7EE',
      accent: '#2A241D',
      ink: '#2A241D'
    }
  }
]

export const DEFAULT_TEMPLATE_ID = 'friend-scrapbook-letter'

export function getTemplateMeta(id) {
  return LETTER_TEMPLATES.find((t) => t.id === id) || LETTER_TEMPLATES[0]
}
