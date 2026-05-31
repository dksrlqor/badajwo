import { motion } from 'framer-motion'

// 받아줘 종이 라벨 버튼.
// SaaS primary 컬러 대신 잉크/종이/마스킹테이프 톤으로 통일.
// 모든 variant 는 paper.css 의 .stationery-button / .tape-button 톤을 따른다.
const variants = {
  // 잉크 라벨 (primary CTA)
  primary: {
    className:
      'inline-flex items-center justify-center w-full text-base font-semibold select-none disabled:cursor-not-allowed disabled:opacity-60',
    style: {
      background: '#3D2E22',
      color: '#FDF8EE',
      border: '1.5px dashed rgba(255, 248, 235, 0.20)',
      borderRadius: '6px 4px 8px 5px',
      padding: '14px 22px',
      boxShadow:
        '0 1px 0 rgba(255,255,255,0.12) inset, 0 2px 4px rgba(92, 62, 40, 0.18), 0 14px 32px rgba(92, 62, 40, 0.18)'
    }
  },
  // 빈티지 핑크 마스킹테이프 (감성 CTA)
  accent: {
    className:
      'inline-flex items-center justify-center w-full font-semibold text-base text-ink-900 select-none disabled:cursor-not-allowed disabled:opacity-60',
    style: {
      background:
        'repeating-linear-gradient(135deg, rgba(248, 200, 215, 0.92) 0 8px, rgba(255,255,255,0.32) 8px 16px)',
      color: '#3D2E22',
      border: 'none',
      borderRadius: 0,
      padding: '14px 22px',
      boxShadow:
        '0 2px 5px rgba(92, 62, 40, 0.18), 0 8px 22px rgba(92, 62, 40, 0.12)',
      transform: 'rotate(-1deg)'
    }
  },
  // 종이 카드 라벨 (secondary)
  soft: {
    className:
      'inline-flex items-center justify-center w-full font-semibold text-base select-none disabled:cursor-not-allowed disabled:opacity-60',
    style: {
      background: '#FDF8EE',
      color: '#3D2E22',
      border: '1.5px dashed rgba(92, 62, 40, 0.28)',
      borderRadius: '5px 8px 4px 6px',
      padding: '14px 22px',
      boxShadow:
        '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 4px rgba(92, 62, 40, 0.10), 0 10px 24px rgba(92, 62, 40, 0.08)'
    }
  },
  // 텍스트 + dashed underline (조용한 액션)
  ghost: {
    className:
      'inline-flex items-center justify-center w-full text-sm font-medium select-none disabled:cursor-not-allowed disabled:opacity-60',
    style: {
      background: 'transparent',
      color: '#5A4538',
      border: 'none',
      padding: '12px 16px',
      textDecoration: 'underline dashed rgba(92, 62, 40, 0.40)',
      textUnderlineOffset: 6,
      textDecorationThickness: 1
    }
  },
  // 노란 마스킹테이프 (Tape 변종)
  tape: {
    className:
      'inline-flex items-center justify-center w-full font-semibold text-base text-ink-900 select-none disabled:cursor-not-allowed disabled:opacity-60',
    style: {
      background:
        'repeating-linear-gradient(135deg, rgba(255, 232, 130, 0.92) 0 8px, rgba(255,255,255,0.32) 8px 16px)',
      color: '#3D2E22',
      border: 'none',
      borderRadius: 0,
      padding: '14px 22px',
      boxShadow:
        '0 2px 5px rgba(92, 62, 40, 0.18), 0 8px 22px rgba(92, 62, 40, 0.12)',
      transform: 'rotate(1deg)'
    }
  }
}

export default function MotionButton({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled,
  style: extraStyle = {},
  ...props
}) {
  const v = variants[variant] || variants.primary
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className={`${v.className} ${className}`}
      style={{ ...v.style, ...extraStyle }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
