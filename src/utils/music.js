// 음악 링크 파서 — YouTube / Spotify URL 을 받아 임베드 정보를 돌려준다.
//
// 반환 형태:
//   { provider, originalUrl, embedUrl, canEmbed, title }
//
//   provider  : 'youtube' | 'spotify' | 'unknown'
//   embedUrl  : iframe src 로 쓸 수 있는 URL (canEmbed === true 일 때만 의미 있음)
//   canEmbed  : iframe 임베드 가능 여부 (false 면 "노래 열기" 새 탭 폴백)
//   title     : URL 에서 추출한 힌트(있으면). 사용자가 직접 적은 게 우선.
//
// 자동재생은 절대 하지 않는다. iframe 은 사용자가 재생 버튼을 눌러 펼친 뒤에만 마운트.

const YT_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be'
])

const SPOTIFY_HOSTS = new Set(['open.spotify.com', 'spotify.com', 'www.spotify.com'])
const SPOTIFY_KINDS = new Set(['track', 'playlist', 'album', 'episode', 'show'])

function emptyResult(originalUrl = '') {
  return {
    provider: 'unknown',
    originalUrl,
    embedUrl: null,
    canEmbed: false,
    title: ''
  }
}

function safeUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim())
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u
  } catch {
    return null
  }
}

function parseYouTube(u, originalUrl) {
  const host = u.hostname.toLowerCase()
  if (!YT_HOSTS.has(host)) return null

  let videoId = ''

  if (host === 'youtu.be') {
    // https://youtu.be/VIDEOID
    videoId = u.pathname.replace(/^\/+/, '').split('/')[0]
  } else if (u.pathname.startsWith('/watch')) {
    // https://www.youtube.com/watch?v=VIDEOID
    videoId = u.searchParams.get('v') || ''
  } else if (u.pathname.startsWith('/shorts/')) {
    // https://www.youtube.com/shorts/VIDEOID
    videoId = u.pathname.replace('/shorts/', '').split('/')[0]
  } else if (u.pathname.startsWith('/embed/')) {
    videoId = u.pathname.replace('/embed/', '').split('/')[0]
  } else if (u.pathname.startsWith('/live/')) {
    videoId = u.pathname.replace('/live/', '').split('/')[0]
  }

  videoId = (videoId || '').trim()
  if (!videoId || !/^[A-Za-z0-9_-]{6,30}$/.test(videoId)) return null

  // playlist 동시 지정 시 list 도 살림 (재생 환경은 youtube embed 가 알아서 처리)
  const list = u.searchParams.get('list') || ''
  const params = new URLSearchParams()
  // 자동재생 X, 관련영상 노출 최소화.
  params.set('rel', '0')
  params.set('modestbranding', '1')
  params.set('playsinline', '1')
  if (list) params.set('list', list)
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`
  return {
    provider: 'youtube',
    originalUrl,
    embedUrl,
    canEmbed: true,
    title: ''
  }
}

function parseSpotify(u, originalUrl) {
  const host = u.hostname.toLowerCase()
  if (!SPOTIFY_HOSTS.has(host)) return null

  // /track/{id}, /playlist/{id}, /album/{id}, /episode/{id}
  // 또는 /intl-ko/track/{id} 같은 locale prefix 도 있음.
  const segments = u.pathname.split('/').filter(Boolean)
  let kindIdx = segments.findIndex((s) => SPOTIFY_KINDS.has(s.toLowerCase()))
  if (kindIdx === -1) return null
  const kind = segments[kindIdx].toLowerCase()
  const id = (segments[kindIdx + 1] || '').split('?')[0]
  if (!id || !/^[A-Za-z0-9]{8,}$/.test(id)) return null

  const embedUrl = `https://open.spotify.com/embed/${kind}/${id}?utm_source=badajwo`
  return {
    provider: 'spotify',
    originalUrl,
    embedUrl,
    canEmbed: true,
    title: ''
  }
}

export function parseMusicLink(rawUrl) {
  const trimmed = String(rawUrl || '').trim()
  if (!trimmed) return emptyResult('')
  const u = safeUrl(trimmed)
  if (!u) return emptyResult(trimmed)

  const yt = parseYouTube(u, trimmed)
  if (yt) return yt
  const sp = parseSpotify(u, trimmed)
  if (sp) return sp

  // 직접 mp3 같은 audio 파일이면 canEmbed=true (audio 태그로 재생)
  if (/\.(mp3|m4a|wav|ogg|aac|flac)(\?|#|$)/i.test(u.pathname)) {
    return {
      provider: 'audio',
      originalUrl: trimmed,
      embedUrl: trimmed,
      canEmbed: true,
      title: ''
    }
  }

  // 알 수 없는 호스트는 외부 링크로만 처리.
  return {
    provider: 'unknown',
    originalUrl: trimmed,
    embedUrl: null,
    canEmbed: false,
    title: ''
  }
}

// 사용자에게 보여줄 짧은 라벨 — "YouTube · 노래 듣기" 같은 식.
export function describeMusic(parsed) {
  if (!parsed || !parsed.originalUrl) return ''
  switch (parsed.provider) {
    case 'youtube':
      return 'YouTube'
    case 'spotify':
      return 'Spotify'
    case 'audio':
      return '음악 파일'
    default:
      return '외부 링크'
  }
}
