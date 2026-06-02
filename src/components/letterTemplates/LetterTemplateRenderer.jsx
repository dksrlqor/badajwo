import VintageScrapbookTemplate from './VintageScrapbookTemplate'
import RomanticPinkTemplate from './RomanticPinkTemplate'
import PhotoFrameMinimalTemplate from './PhotoFrameMinimalTemplate'
import { resolveTemplateId } from '../../utils/letterTemplates'

// templateId 별 컴포넌트 매핑. 옛 v3 ID 도 letterTemplates.resolveTemplateId 를 거쳐 새 ID 로 변환됨.
const TEMPLATE_MAP = {
  vintage_scrapbook: VintageScrapbookTemplate,
  romantic_pink: RomanticPinkTemplate,
  photo_frame_minimal: PhotoFrameMinimalTemplate
}

export default function LetterTemplateRenderer({ letter }) {
  const id = resolveTemplateId(letter?.templateId)
  const Component = TEMPLATE_MAP[id] || VintageScrapbookTemplate
  return <Component letter={letter} />
}
