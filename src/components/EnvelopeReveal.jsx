import { useState } from 'react'
import { motion } from 'framer-motion'
import MotionButton from './MotionButton'

// 받아줘 수신 화면. 닫힌 봉투 + 봉투에서 살짝 빠져나온 반접힌 편지.
// 받아보기 클릭 시 다음 타임라인으로 진행한다.
//   0ms      : opening 시작
//   120ms    : 봉투 전체가 살짝 떠오름
//   180ms    : 플랩이 rotateX -176deg 로 펼쳐짐
//   520ms    : 편지지가 봉투에서 위로 천천히 올라옴
//   850ms    : 접힘선이 부드럽게 사라짐 (unfolding)
//   1150ms   : 부모에 onRevealed 콜백 → 본문 phase 로 전환
// duration·easing 은 cubic-bezier(0.22, 1, 0.36, 1) 기준으로 통일.
// prefers-reduced-motion 이면 회전/슬라이드 건너뛰고 즉시 본문으로 전환.

const EASING = [0.22, 1, 0.36, 1]

const C = {
  envBack:   '#E5D2B8', // tailwind envelope.back
  envFront:  '#E2CFB3', // envelope.front
  envFlap:   '#DDC9AC', // envelope.flap
  envLiner:  '#F4E5CC', // envelope.liner
  envFold:   '#D2B898', // envelope.fold
  paper:     '#FDF8EE', // paper.ivory
  paperEdge: '#F4E6D0', // paper.sand
  paperFold: 'rgba(112, 76, 48, 0.10)',
  paperLine: 'rgba(120, 85, 60, 0.10)',
  wax:       '#B8755D'
}

// 봉투 표면 결 — 미세 noise SVG (multiply 블렌드)
const ENV_NOISE_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.28  0 0 0 0 0.20  0 0 0 0 0.13  0 0 0 0.055 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export default function EnvelopeReveal({ onRevealed, reduceMotion = false }) {
  const [opening, setOpening] = useState(false)

  const handleClick = () => {
    if (opening) return
    setOpening(true)
    if (reduceMotion) {
      window.setTimeout(() => onRevealed?.(), 100)
      return
    }
    window.setTimeout(() => onRevealed?.(), 1150)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center pt-6 pb-2"
    >
      <p className="text-sm text-ink-500 mb-1 text-center">
        당신에게 도착한 편지가 있어요
      </p>
      <p className="text-xs text-ink-300 mb-10 text-center">
        조심히 열어볼까요?
      </p>

      <EnvelopeStage opening={opening} reduceMotion={reduceMotion} />

      <div className="mt-10 w-full max-w-[280px]">
        <MotionButton
          variant="accent"
          onClick={handleClick}
          disabled={opening}
          aria-label="편지 받아보기"
        >
          {opening && !reduceMotion ? '편지를 꺼내는 중...' : '받아보기'}
        </MotionButton>
      </div>
    </motion.div>
  )
}

function EnvelopeStage({ opening, reduceMotion }) {
  return (
    <motion.div
      style={{
        '--env-w': 'clamp(280px, 80vw, 340px)',
        '--env-h': 'calc(var(--env-w) * 100 / 155)',
        '--peek-up': '30px',
        '--letter-w': 'calc(var(--env-w) * 0.62)',
        width: 'var(--env-w)',
        height: 'calc(var(--env-h) + var(--peek-up))',
        position: 'relative',
        perspective: 900
      }}
      animate={
        opening && !reduceMotion
          ? { y: -8 }
          : reduceMotion
          ? {}
          : { y: [0, -3, 0] }
      }
      transition={
        opening
          ? { duration: 0.45, delay: 0.12, ease: EASING }
          : reduceMotion
          ? { duration: 0 }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      {/* envelope-shadow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -16,
          left: '6%',
          right: '6%',
          height: 24,
          background:
            'radial-gradient(ellipse at center, rgba(92, 62, 40, 0.22) 0%, rgba(92, 62, 40, 0) 70%)',
          filter: 'blur(3px)',
          zIndex: 0
        }}
      />

      {/* envelope-back (+ 종이 결 overlay) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'var(--peek-up)',
          left: 0,
          right: 0,
          height: 'var(--env-h)',
          background: `${ENV_NOISE_BG}, linear-gradient(135deg, ${C.envBack} 0%, #E0CCAE 100%)`,
          backgroundBlendMode: 'multiply, normal',
          borderRadius: 10,
          boxShadow:
            '0 18px 36px rgba(92, 62, 40, 0.16), 0 4px 12px rgba(92, 62, 40, 0.10)',
          zIndex: 1
        }}
      />

      {/* envelope-inner (라이너) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'calc(var(--peek-up) + 5px)',
          left: 5,
          right: 5,
          height: 'calc(var(--env-h) - 10px)',
          background: `linear-gradient(180deg, ${C.envLiner} 0%, #f1ddc7 100%)`,
          borderRadius: 6,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 6px rgba(92,62,40,0.08)',
          zIndex: 2
        }}
      />

      {/* envelope-letter-peek (반접힌 편지) */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 'calc((var(--env-w) - var(--letter-w)) / 2)',
          width: 'var(--letter-w)',
          height: 'calc(var(--peek-up) + var(--env-h) * 0.62)',
          background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paperEdge} 100%)`,
          borderRadius: 4,
          zIndex: 3,
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.75), 0 2px 4px rgba(92,62,40,0.14)'
        }}
        animate={
          opening && !reduceMotion
            ? { y: -42, scale: 1.02 }
            : { y: 0, scale: 1 }
        }
        transition={{
          duration: 0.6,
          delay: opening ? 0.52 : 0,
          ease: EASING
        }}
      >
        {/* 접힘선 — 봉투 입구 부근 */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            top: 'var(--peek-up)',
            left: 0,
            right: 0,
            height: 5,
            background: `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, ${C.paperFold} 50%, transparent 100%)`,
            pointerEvents: 'none'
          }}
          animate={
            opening && !reduceMotion ? { opacity: 0 } : { opacity: 1 }
          }
          transition={{ duration: 0.3, delay: 0.85 }}
        />
        {/* 줄 라인 (살짝) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 'calc(var(--peek-up) + 14px)',
            left: '10%',
            right: '10%',
            bottom: '18%',
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 14px, ${C.paperLine} 14px, ${C.paperLine} 15px)`,
            opacity: 0.8,
            pointerEvents: 'none'
          }}
        />
      </motion.div>

      {/* envelope-front-pocket (아래 삼각형) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'var(--peek-up)',
          left: 0,
          right: 0,
          height: 'var(--env-h)',
          background: `${ENV_NOISE_BG}, linear-gradient(180deg, ${C.envFront} 0%, ${C.envBack} 100%)`,
          backgroundBlendMode: 'multiply, normal',
          clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)',
          borderRadius: '0 0 10px 10px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
          zIndex: 4
        }}
      />

      {/* envelope-left-fold (왼쪽 삼각형) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'var(--peek-up)',
          left: 0,
          right: 0,
          height: 'var(--env-h)',
          background: `linear-gradient(90deg, ${C.envFold} 0%, ${C.envBack} 100%)`,
          clipPath: 'polygon(0 0, 50% 50%, 0 100%)',
          borderRadius: '10px 0 0 10px',
          opacity: 0.85,
          zIndex: 4.2
        }}
      />

      {/* envelope-right-fold (오른쪽 삼각형) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'var(--peek-up)',
          left: 0,
          right: 0,
          height: 'var(--env-h)',
          background: `linear-gradient(270deg, ${C.envFold} 0%, ${C.envBack} 100%)`,
          clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)',
          borderRadius: '0 10px 10px 0',
          opacity: 0.85,
          zIndex: 4.2
        }}
      />

      {/* envelope-flap (위 삼각형, 회전으로 펼쳐짐) */}
      <motion.div
        style={{
          position: 'absolute',
          top: 'var(--peek-up)',
          left: 0,
          right: 0,
          height: 'var(--env-h)',
          background: `${ENV_NOISE_BG}, linear-gradient(180deg, ${C.envFlap} 0%, ${C.envBack} 100%)`,
          backgroundBlendMode: 'multiply, normal',
          clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
          borderRadius: '10px 10px 0 0',
          transformOrigin: 'top center',
          transformStyle: 'preserve-3d',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 6px rgba(92,62,40,0.08)',
          zIndex: 5,
          backfaceVisibility: 'hidden'
        }}
        animate={
          opening && !reduceMotion ? { rotateX: -176 } : { rotateX: 0 }
        }
        transition={{
          duration: 0.65,
          delay: opening ? 0.18 : 0,
          ease: EASING
        }}
      >
        {/* seal-wax */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            top: '36%',
            left: '50%',
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            background: `radial-gradient(circle at 40% 35%, #d18b6c 0%, ${C.wax} 50%, #8a543e 100%)`,
            borderRadius: '50%',
            boxShadow:
              '0 1px 3px rgba(60,30,15,0.30), inset 0 1px 1px rgba(255,255,255,0.35)'
          }}
          animate={
            opening && !reduceMotion
              ? { scale: 0, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.25, delay: opening ? 0.05 : 0 }}
        />
      </motion.div>

      {/* 빈티지 우표 — pocket 위쪽, flap 영역 밖이라 봉투 닫힘/열림 모두 보임 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'calc(var(--peek-up) + var(--env-h) * 0.55)',
          right: 'calc(var(--env-w) * 0.06)',
          width: 32,
          height: 40,
          padding: 3,
          background: `${ENV_NOISE_BG}, ${C.envLiner}`,
          backgroundBlendMode: 'multiply, normal',
          border: '1px dashed rgba(255,255,255,0.85)',
          outline: '1px solid rgba(92, 62, 40, 0.18)',
          boxShadow: '0 1px 3px rgba(92,62,40,0.20)',
          transform: 'rotate(-4deg)',
          zIndex: 6
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(160deg, #C7443E 0%, #A23B36 55%, #2C3E5A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FDF8EE',
            fontSize: 14,
            lineHeight: 1
          }}
        >
          ✉
        </div>
      </div>

      {/* 소인 (postmark) — 우표 왼쪽, 둥근 점선 도장 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'calc(var(--peek-up) + var(--env-h) * 0.52)',
          right: 'calc(var(--env-w) * 0.20)',
          width: 42,
          height: 42,
          border: '1.5px dashed rgba(78, 107, 138, 0.55)',
          borderRadius: '50%',
          color: 'rgba(78, 107, 138, 0.65)',
          fontSize: 8,
          fontFamily: 'Georgia, "Times New Roman", serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-14deg)',
          letterSpacing: '0.06em',
          zIndex: 6
        }}
      >
        <div style={{ fontSize: 8, fontWeight: 600 }}>BADAJWO</div>
        <div
          style={{
            width: '70%',
            height: 1,
            background: 'rgba(78, 107, 138, 0.5)',
            margin: '2px 0'
          }}
        />
        <div style={{ fontSize: 7 }}>POSTED</div>
      </div>
    </motion.div>
  )
}
