import { motion } from 'framer-motion'

// 받아줘 종이 카드. 비대칭 모서리 + 종이 결 + 가장자리 wear + 부드러운 그림자.
// paper.css 의 .paper-card 가 모든 시각 효과를 담당.
export default function SoftCard({
  children,
  className = '',
  hover = false,
  tilt = null, // 'left' | 'right' | null
  ...props
}) {
  const hoverProps = hover
    ? {
        whileHover: { y: -4 },
        transition: { type: 'spring', stiffness: 300, damping: 22 }
      }
    : {}
  const tiltClass =
    tilt === 'left'
      ? 'paper-card-tilt-left'
      : tilt === 'right'
      ? 'paper-card-tilt-right'
      : ''
  return (
    <motion.div
      {...hoverProps}
      className={`paper-card ${tiltClass} p-6 sm:p-7 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
