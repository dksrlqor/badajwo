import { motion } from 'framer-motion'

export default function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-16 text-center px-4"
    >
      <div className="text-6xl mb-5">{icon}</div>
      <h2 className="text-base font-bold text-ink-900 mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-ink-500 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
