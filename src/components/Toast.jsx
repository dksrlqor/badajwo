import { motion, AnimatePresence } from 'framer-motion'

// 받아줘 — 종이 라벨 톤의 fixed toast.
// 위치는 항상 화면 하단 중앙. 레이아웃 밀지 않음. 모바일에서도 줄바꿈 허용.
export default function Toast({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-[400px]"
          style={{ bottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}
          role="status"
          aria-live="polite"
        >
          <div
            className="relative mx-auto text-center text-[13px] leading-snug"
            style={{
              background: '#FBF0DC',
              color: '#3D2E22',
              padding: '12px 18px 11px',
              borderRadius: '6px 8px 7px 5px',
              border: '1px dashed rgba(92, 62, 40, 0.32)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 4px rgba(92,62,40,0.12), 0 14px 28px rgba(92,62,40,0.18)',
              transform: 'rotate(-0.4deg)'
            }}
          >
            {/* 상단 마스킹테이프 — 라벨이 책상에 살짝 붙은 느낌 */}
            <span
              aria-hidden
              className="masking-tape tape-sage"
              style={{
                position: 'absolute',
                width: 54,
                height: 12,
                top: -6,
                left: '50%',
                transform: 'translateX(-50%) rotate(-3deg)'
              }}
            />
            <span style={{ fontFamily: "'Apple SD Gothic Neo', Georgia, serif" }}>
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
