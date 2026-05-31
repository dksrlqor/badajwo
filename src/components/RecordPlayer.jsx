import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const AUDIO_EXT_RE = /\.(mp3|m4a|wav|ogg|aac|flac)(\?|#|$)/i

export function isPlayableAudio(url) {
  if (!url) return false
  return AUDIO_EXT_RE.test(url)
}

// 직접 재생할 수 없는 외부 링크(YouTube, Spotify)는 재생 버튼 대신
// "링크로 듣기" 로 새 탭을 띄운다. 자동재생은 하지 않음.
export default function RecordPlayer({ music }) {
  const url = music?.src || ''
  const title = music?.title || ''
  const playable = isPlayableAudio(url)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

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
  }, [url])

  const toggle = async () => {
    if (!playable) {
      if (url) window.open(url, '_blank', 'noopener')
      return
    }
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
  }

  const subtitle = playable
    ? title || '재생 가능한 음악'
    : url
    ? title || '링크로 듣기'
    : '음악 없음'

  return (
    <div className="flex items-center gap-3 bg-white/85 backdrop-blur rounded-2xl p-3 pr-4 border border-cream-200 shadow-soft">
      <motion.div
        className="relative w-14 h-14 rounded-full flex-shrink-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, #4a4036 0 18%, #1a1612 18% 100%)'
        }}
        animate={{ rotate: playing ? 360 : 0 }}
        transition={
          playing
            ? { duration: 4, repeat: Infinity, ease: 'linear' }
            : { duration: 0.5, ease: 'easeOut' }
        }
      >
        <div className="absolute inset-1.5 rounded-full border border-white/10" />
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <div className="absolute inset-5 rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-accent-pinkDeep flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </motion.div>
      <button
        type="button"
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-ink-900 text-white text-xs flex items-center justify-center active:scale-95 transition"
        aria-label={playing ? '일시정지' : '재생'}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-ink-500 mb-0.5">함께 듣는 음악</div>
        <div className="text-sm font-semibold text-ink-900 truncate">
          {subtitle}
        </div>
      </div>
      {playable && (
        <audio ref={audioRef} src={url} preload="metadata" playsInline />
      )}
    </div>
  )
}
