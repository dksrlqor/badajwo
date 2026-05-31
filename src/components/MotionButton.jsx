import { motion } from 'framer-motion'

// 받아줘 종이 라벨 버튼.
// SaaS primary 컬러 대신 잉크/블러쉬/종이 톤으로 통일.
// hover 시 살짝 떠오르고, tap 시 종이가 살짝 눌리는 느낌.
const styles = {
  // 잉크 라벨 — primary CTA
  primary:
    'bg-ink-900 text-paper-ivory border border-ink-900/15 shadow-paper hover:bg-ink-700 disabled:bg-ink-300 disabled:border-transparent',
  // 블러쉬 종이 라벨 — accent (감성 CTA)
  accent:
    'bg-accent-pinkDeep text-white border border-blush-500/35 shadow-paper hover:brightness-[1.04] disabled:bg-accent-pink disabled:border-transparent',
  // 종이 카드 버튼 — soft secondary
  soft:
    'bg-paper-ivory text-ink-700 border border-ink-900/10 shadow-paper-sm hover:bg-paper-cream hover:shadow-paper',
  // 텍스트 + 부드러운 underline — ghost
  ghost:
    'bg-transparent text-ink-500 hover:text-ink-900 underline underline-offset-[6px] decoration-ink-900/20 hover:decoration-ink-900/40 decoration-1 font-medium shadow-none'
}

export default function MotionButton({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center w-full rounded-2xl px-5 py-4 text-base font-semibold transition-colors select-none disabled:cursor-not-allowed'
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
