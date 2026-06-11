import PixelLetterTemplate from './PixelLetterTemplate'
import VintageScrapbookTemplate from './VintageScrapbookTemplate'
import RomanticPinkTemplate from './RomanticPinkTemplate'
import PhotoFrameMinimalTemplate from './PhotoFrameMinimalTemplate'
import { resolveTemplateId } from '../../utils/letterTemplates'

// templateId 별 컴포넌트 매핑.
// pixel_letter 가 새 기본. 옛 종이 템플릿들은 이미 공유된 링크 호환을 위해 유지.
const TEMPLATE_MAP = {
  pixel_letter: PixelLetterTemplate,
  vintage_scrapbook: VintageScrapbookTemplate,
  romantic_pink: RomanticPinkTemplate,
  photo_frame_minimal: PhotoFrameMinimalTemplate
}

export default function LetterTemplateRenderer({ letter }) {
  const id = resolveTemplateId(letter?.templateId)
  const Component = TEMPLATE_MAP[id] || PixelLetterTemplate
  return <Component letter={letter} />
}
