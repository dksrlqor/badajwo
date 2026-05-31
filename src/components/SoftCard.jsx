import { motion } from 'framer-motion'

// 받아줘 종이 카드. 흰색 카드가 아니라 따뜻한 아이보리 종이 결.
// paper-texture 클래스가 pseudo-element 로 빛 spot 2개를 얹어준다.
export default function SoftCard({
  children,
  className = '',
  hover = false,
  ...props
}) {
  const hoverProps = hover
    ? {
        whileHover: { y: -4 },
        transition: { type: 'spring', stiffness: 300, damping: 22 }
      }
    : {}
  return (
    <motion.div
      {...hoverProps}
      className={`relative bg-paper-ivory rounded-3xl shadow-paper p-6 sm:p-7 paper-texture ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
