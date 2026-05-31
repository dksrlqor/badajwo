import { motion } from 'framer-motion'
import { useMemo } from 'react'

const SYMBOLS = ['♥', '✿', '❀', '✦', '♡']
const COLORS = ['#E89AB4', '#F7C9D9', '#D7C7F0', '#A98FE0', '#F5C28A']

export default function ParticleBurst({ count = 28 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6
      const distance = 90 + Math.random() * 130
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      const symbol = SYMBOLS[i % SYMBOLS.length]
      const color = COLORS[i % COLORS.length]
      const size = 12 + Math.random() * 16
      const delay = Math.random() * 0.12
      const duration = 0.8 + Math.random() * 0.6
      const rotate = (Math.random() - 0.5) * 120
      return { x, y, color, symbol, size, delay, duration, rotate, id: i }
    })
  }, [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 1.1,
            rotate: p.rotate
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            color: p.color,
            fontSize: p.size,
            textShadow: '0 1px 4px rgba(255,255,255,0.5)'
          }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  )
}
