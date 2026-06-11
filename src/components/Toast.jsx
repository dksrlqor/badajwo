import { motion, AnimatePresence } from 'framer-motion'

// 받아줘 — 8비트 픽셀 라벨 toast. 화면 하단 중앙 고정, 2~3초 표시는 호출자가 제어.
// 중앙 정렬은 fixed wrapper 의 flex 로 처리한다 — motion.div 가 y 애니메이션을 위해
// inline transform 을 덮어쓰기 때문에 translateX(-50%) 류 정렬은 깨진다.
export default function Toast({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-x-0 flex justify-center pointer-events-none"
          style={{
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            zIndex: 9999
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.16, ease: 'linear' }}
            className="px-4 w-full max-w-[420px] box-border"
            role="status"
            aria-live="polite"
          >
            <div className="px-toast mx-auto">{message}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
