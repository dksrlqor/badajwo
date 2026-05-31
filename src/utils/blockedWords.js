// 받아줘 — 차단어/예약어 정의.
// 정책이 자주 바뀔 수 있으므로 별도 파일로 분리해 둔다.
// 백엔드 정책 응답으로 교체할 수 있도록 export 만 일정하게 유지.

export const BLOCKED_WORDS = [
  // 영어
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'dick',
  // 한국어
  '시발', '씨발', '병신', '개새끼', '존나', '좆', '꺼져', '닥쳐'
]

export const RESERVED_HANDLES = new Set([
  'admin', 'official', 'support', 'help', 'system',
  'badajwo', 'batajwo',
  'null', 'undefined', 'user', 'manager', 'root', 'staff',
  'login', 'logout', 'signup', 'setup',
  'me', 'home', 'inbox', 'archive', 'feed',
  'create', 'view', 'complete', 'letter', 'diary'
])
