import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { describeMusic } from '../utils/music'

// 받아줘 RecordPlayer (v2).
// parseMusicLink 결과를 받아 YouTube / Spotify 는 iframe 임베드,
// mp3 같은 직링크는 <audio>, 그 외 임베드 불가 링크는 새 탭으로 처리.
//
// props
//   music : { provider, originalUrl, embedUrl, canEmbed, title } | { src, title }(옛 형태)
//   tone  : 'scrapbook' | 'romantic' | 'classic' | 'default'
//
// 자동재생은 절대 하지 않음. iframe 은 사용자가 재생 버튼을 누른 뒤에만 마운트된다.
// 모바일 데이터 절약 + 브라우저 자동재생 정책 회피.

const AUDIO_EXT_RE = /\.(mp3|m4a|wav|ogg|aac|flac)(\?|#|$)/i

function normalize(music) {
  if (!music) return null
  // 새 형태
  if (music.provider) {
    return {
      provider: music.provider,
      originalUrl: music.originalUrl || '',
      embedUrl: music.embedUrl || null,
      canEmbed: !!music.canEmbed,
      title: music.title || ''
    }
  }
  // 옛 형태 — src 만 있음
  const src = music.src || ''
  if (!src) return null
  if (AUDIO_EXT_RE.test(src)) {
    return {
      provider: 'audio',
      originalUrl: src,
      embedUrl: src,
      canEmbed: true,
      title: music.title || ''
    }
  }
  return {
    provider: 'unknown',
    originalUrl: src,
    embedUrl: null,
    canEmbed: false,
    title: music.title || ''
  }
}

const TONES = {
  scrapbook: {
    wrap: 'rgba(253, 248, 238, 0.92)',
    border: 'rgba(74, 51, 32, 0.18)',
    label: '#7A5A3D',
    title: '#4A3320',
    button: '#4A3320',
    buttonText: '#FDF8EE',
    record: { outer: '#3B2A1C', inner: '#1A120A' },
    centerDot: '#C47A4E'
  },
  romantic: {
    wrap: 'rgba(255, 252, 248, 0.94)',
    border: 'rgba(197, 127, 134, 0.32)',
    label: '#A84E5C',
    title: '#4A2E2A',
    button: '#A84E5C',
    buttonText: '#FFF6F7',
    record: { outer: '#5C2E33', inner: '#2A0F12' },
    centerDot: '#F2A4AC'
  },
  classic: {
    wrap: 'rgba(251, 247, 238, 0.94)',
    border: 'rgba(42, 36, 29, 0.16)',
    label: '#5A5246',
    title: '#2A241D',
    button: '#2A241D',
    buttonText: '#FBF7EE',
    record: { outer: '#2C2620', inner: '#0F0C09' },
    centerDot: '#A09684'
  },
  default: {
    wrap: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(120, 95, 70, 0.18)',
    label: '#86705E',
    title: '#3D2E22',
    button: '#3D2E22',
    buttonText: '#FDF8EE',
    record: { outer: '#4a4036', inner: '#1a1612' },
    centerDot: '#D88FA8'
  }
}

export default function RecordPlayer({ music, tone = 'default' }) {
  const m = normalize(music)
  const t = TONES[tone] || TONES.default
  const audioRef = useRef(null)
  // playing : 사용자가 재생 토글한 상태 (UI 의 회전/일시정지 표기 기준)
  // embedOpen : iframe 펼침 여부 (한 번 펼치면 접지 않는 한 유지)
  const [playing, setPlaying] = useState(false)
  const [embedOpen, setEmbedOpen] = useState(false)

  // 임베드 불가 링크를 외부로 열었을 때 시각 피드백 — 잠깐 회전 후 정지.
  useEffect(() => {
    if (!playing) return
    if (!m) return
    if (m.provider !== 'unknown') return
    const id = window.setTimeout(() => setPlaying(false), 5000)
    return () => window.clearTimeout(id)
  }, [playing, m])

  // audio 태그 자체 pause/ended 시 UI 동기화
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onEnded = () => setPlaying(false)
    const onPause = () => setPlaying(false)
    a.addEventListener('ended', onEnded)
    a.addEventListener('pause', onPause)
    return () => {
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('pause', onPause)
      try { a.pause() } catch {}
    }
  }, [m?.originalUrl])

  if (!m || !m.originalUrl) return null

  const isAudio = m.provider === 'audio'
  const isEmbed = m.canEmbed && (m.provider === 'youtube' || m.provider === 'spotify')

  const toggle = async () => {
    if (isAudio) {
      const a = audioRef.current
      if (!a) return
      if (playing) {
        a.pause()
        setPlaying(false)
      } else {
        try {
          await a.play()
          setPlaying(true)
        } catch {
          setPlaying(false)
        }
      }
      return
    }
    if (isEmbed) {
      // 임베드는 사용자가 직접 재생 — 펼치고 회전 표기만 토글.
      if (!embedOpen) setEmbedOpen(true)
      setPlaying((p) => !p)
      return
    }
    // unknown — 외부 새 탭
    if (m.originalUrl) {
      window.open(m.originalUrl, '_blank', 'noopener')
      setPlaying(true)
    }
  }

  const openExternal = () => {
    if (!m.originalUrl) return
    window.open(m.originalUrl, '_blank', 'noopener')
  }

  const subtitle =
    m.title ||
    (isAudio
      ? '함께 듣기'
      : describeMusic(m) + (isEmbed ? ' · 탭하면 펼쳐져요' : ' · 새 탭에서 열려요'))

  return (
    <div
      className="w-full"
      style={{
        background: t.wrap,
        border: `1px solid ${t.border}`,
        borderRadius: 18,
        padding: 12,
        boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(80, 60, 40, 0.10)'
      }}
    >
      <div className="flex items-center gap-3">
        {/* 레코드판 */}
        <motion.div
          className="relative flex-shrink-0"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `radial-gradient(circle at 50% 50%, ${t.record.outer} 0 18%, ${t.record.inner} 18% 100%)`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.14)'
          }}
          animate={{ rotate: playing ? 360 : 0 }}
          transition={
            playing
              ? { duration: 4.5, repeat: Infinity, ease: 'linear' }
              : { duration: 0.5, ease: 'easeOut' }
          }
        >
          {/* 동심원 — 레코드 홈 표현 */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 6,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 12,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 18,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          {/* 중앙 라벨 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 18,
              height: 18,
              marginLeft: -9,
              marginTop: -9,
              borderRadius: '50%',
              background: t.centerDot,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.32)'
            }}
          >
            <div
              style={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: '#FFFFFF'
              }}
            />
          </div>
          {/* 바늘 — 작은 사선 */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 22,
              height: 4,
              background: 'linear-gradient(90deg, transparent 0%, rgba(120, 95, 70, 0.6) 35%, rgba(120, 95, 70, 0.8) 100%)',
              transform: 'rotate(-26deg)',
              transformOrigin: '100% 50%',
              borderRadius: 2,
              pointerEvents: 'none'
            }}
          />
        </motion.div>

        {/* 정보 + 컨트롤 */}
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              color: t.label,
              textTransform: 'uppercase'
            }}
          >
            함께 듣는 음악
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.title,
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {subtitle}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? '잠시 멈추기' : '노래 재생'}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: t.button,
              color: t.buttonText,
              border: 'none',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              cursor: 'pointer'
            }}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          {(isEmbed || m.provider === 'unknown') && (
            <button
              type="button"
              onClick={openExternal}
              aria-label="노래 열기"
              style={{
                fontSize: 11,
                color: t.label,
                background: 'transparent',
                border: `1px dashed ${t.border}`,
                borderRadius: 999,
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              노래 열기
            </button>
          )}
        </div>
      </div>

      {/* 임베드 iframe — 사용자가 재생 토글로 펼친 뒤에만 마운트 */}
      <AnimatePresence>
        {isEmbed && embedOpen && (
          <motion.div
            key="embed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ overflow: 'hidden', marginTop: 10 }}
          >
            {m.provider === 'youtube' && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={m.embedUrl}
                  title="음악 플레이어"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                    borderRadius: 12
                  }}
                />
              </div>
            )}
            {m.provider === 'spotify' && (
              <iframe
                src={m.embedUrl}
                title="음악 플레이어"
                loading="lazy"
                allow="encrypted-media; clipboard-write"
                style={{
                  width: '100%',
                  height: 152,
                  border: 0,
                  borderRadius: 12
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isAudio && (
        <audio ref={audioRef} src={m.originalUrl} preload="metadata" playsInline />
      )}
    </div>
  )
}
