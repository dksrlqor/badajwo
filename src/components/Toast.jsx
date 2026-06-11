import { motion, AnimatePresence } from 'framer-motion'

// 받아줘 — 8비트 픽셀 라벨 toast. 화면 하단 중앙 고정, 2~3초 표시는 호출자가 제어.
export default function Toast({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.16, ease: 'linear' }}
          className="fixed left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-[400px]"
          style={{ bottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}
          role="status"
          aria-live="polite"
        >
          <div className="px-toast mx-auto">{message}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
