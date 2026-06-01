import FriendScrapbookTemplate from './FriendScrapbookTemplate'
import CoupleRomanticTemplate from './CoupleRomanticTemplate'
import ClassicPhotoTemplate from './ClassicPhotoTemplate'

// templateId 별 컴포넌트 매핑. 새 템플릿을 추가하면 여기와 utils/letterTemplates.js
// 양쪽에 등록한다.
const TEMPLATE_MAP = {
  'friend-scrapbook-letter': FriendScrapbookTemplate,
  'couple-romantic-letter': CoupleRomanticTemplate,
  'classic-photo-letter': ClassicPhotoTemplate
}

export default function LetterTemplateRenderer({ letter }) {
  const id = letter?.templateId
  const Component = TEMPLATE_MAP[id] || FriendScrapbookTemplate
  return <Component letter={letter} />
}
