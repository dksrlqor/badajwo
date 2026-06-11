// 받아줘 간단편지 — 편지지 템플릿 메타데이터.
// 실제 렌더링은 components/letterTemplates/<Name>Template.jsx 가 담당한다.
//
// 템플릿 ID 는 첨부 PDF 시각 분석을 기반으로 한 시각 구도 기반의 이름이다.
//   vintage_scrapbook   — Beige Brown Scrapbook Vintage Thank You Letter PDF 구도
//   romantic_pink       — Pink and Beige Romantic Anniversary Letter PDF 구도
//   photo_frame_minimal — Black & White Simple Photo Frame Wedding Thank You PDF 구도
//
// 새 템플릿 추가:
//   1) 이 배열에 메타데이터 항목 추가
//   2) components/letterTemplates/ 아래 컴포넌트 추가
//   3) LetterTemplateRenderer.jsx 의 import 와 매핑에 등록

export const LETTER_TEMPLATES = [
  {
    id: 'pixel_letter',
    name: '픽셀 편지',
    category: 'default',
    description: '8비트 픽셀 편지함 세계관의 기본 편지지',
    mood: 'pixel, retro, pink',
    supportsPhotos: true,
    supportsMusic: true,
    swatch: {
      paper: '#FFFDF8',
      accent: '#F3A6B5',
      ink: '#4A2F35',
      bg: '#FFF7F3'
    }
  },
  {
    id: 'vintage_scrapbook',
    name: '빈티지 스크랩북',
    category: 'friend',
    description: '베이지 종이 위 찢어진 편지지, 리본·꽃·테이프가 흩어진 따뜻한 손편지 감성',
    mood: 'warm, vintage, scrapbook',
    supportsPhotos: true,
    supportsMusic: true,
    swatch: {
      paper: '#FAF3E0',
      accent: '#A6362A',
      ink: '#3a2614',
      bg: '#A88E68'
    }
  },
  {
    id: 'romantic_pink',
    name: '로맨틱 핑크',
    category: 'couple',
    description: '핑크 베이지 톤의 둥근 편지지 + 큰 outline 하트와 Love 스티커',
    mood: 'romantic, soft, pink',
    supportsPhotos: true,
    supportsMusic: true,
    swatch: {
      paper: '#F4D9DC',
      accent: '#A8333F',
      ink: '#3A2A26',
      bg: '#ECDDC4'
    }
  },
  {
    id: 'photo_frame_minimal',
    name: '포토 프레임 미니멀',
    category: 'etc',
    description: '큰 필기체 제목과 흑백 사진 프레임이 단정하게 어우러진 웨딩 감사 편지',
    mood: 'clean, classic, photo',
    supportsPhotos: true,
    supportsMusic: true,
    swatch: {
      paper: '#FFFFFF',
      accent: '#1a1a1a',
      ink: '#1a1a1a',
      bg: '#F6F1E7'
    }
  }
]

export const DEFAULT_TEMPLATE_ID = 'pixel_letter'

// 옛 ID 호환 — localStorage 에 남아 있는 v3 데이터를 새 컴포넌트로 라우팅.
const LEGACY_ID_MAP = {
  'friend-scrapbook-letter': 'vintage_scrapbook',
  'couple-romantic-letter': 'romantic_pink',
  'classic-photo-letter': 'photo_frame_minimal'
}

export function resolveTemplateId(id) {
  if (!id) return DEFAULT_TEMPLATE_ID
  if (LEGACY_ID_MAP[id]) return LEGACY_ID_MAP[id]
  if (LETTER_TEMPLATES.some((t) => t.id === id)) return id
  return DEFAULT_TEMPLATE_ID
}

export function getTemplateMeta(id) {
  const resolved = resolveTemplateId(id)
  return LETTER_TEMPLATES.find((t) => t.id === resolved) || LETTER_TEMPLATES[0]
}
