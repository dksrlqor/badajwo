import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="bg-ink-900/95 text-white text-sm px-5 py-3 rounded-full shadow-card whitespace-nowrap">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
