import { useState } from 'react'
import { motion } from 'framer-motion'
import MotionButton from './MotionButton'

// ─── 받아줘 수신 화면 ───────────────────────────────────────
// "받아보기" 클릭 시 진짜 종이 편지를 봉투에서 꺼내 읽는 듯한 7단계 시퀀스:
//   0.00s  press        — 봉투가 살짝 눌림 (0.12s)
//   0.18s  flap         — 플랩 rotateX 0→-176deg (0.35s)
//   0.32s  peek-rise(a) — 반접힌 편지 윗부분이 천천히 등장 (0.25s)
//   0.57s  letter-rise  — 반접힌 편지가 봉투 위로 인출 (0.45s)
//   1.02s  pause        — 잠깐 호흡 (0.10s)
//   1.12s  unfold       — bottom panel 이 rotateX -180→0 으로 펼침 (0.55s)
//   1.67s  settle       — 정착 (0.20s)
//   1.87s  onRevealed() → 부모가 content phase 로 전환
// 모든 모션은 cubic-bezier(0.22, 1, 0.36, 1) — 조용하고 느리게.
// prefers-reduced-motion 이면 시퀀스 건너뛰고 100ms 후 즉시 본문.

const EASING = [0.22, 1, 0.36, 1]

const C = {
  envBack:   '#E5D2B8',
  envFront:  '#E2CFB3',
  envFlap:   '#DDC9AC',
  envLiner:  '#F4E5CC',
  envFold:   '#D2B898',
  paper:     '#FDF8EE',
  paperEdge: '#F4E6D0',
  paperFold: 'rgba(112, 76, 48, 0.10)',
  paperLine: 'rgba(120, 85, 60, 0.10)',
  wax:       '#B8755D'
}

const ENV_NOISE_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.28  0 0 0 0 0.20  0 0 0 0 0.13  0 0 0 0.055 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

// 타이밍 토큰 (사용자 명세)
const T_PRESS  = { duration: 0.12, ease: EASING }
const T_FLAP   = { duration: 0.35, delay: 0.18, ease: EASING }
const T_PEEK   = { duration: 0.25, delay: 0.32, ease: EASING }
const T_RISE   = { duration: 0.45, delay: 0.57, ease: EASING }
const T_UNFOLD = { duration: 0.55, delay: 1.12, ease: EASING }
// total ≈ 1.87s

export default function EnvelopeReveal({ onRevealed, reduceMotion = false }) {
  const [opening, setOpening] = useState(false)

  const handleClick = () => {
    if (opening) return
    setOpening(true)
    if (reduceMotion) {
      window.setTimeout(() => onRevealed?.(), 100)
      return
    }
    window.setTimeout(() => onRevealed?.(), 1870)
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

      {/* press 반응 — 클릭 시 봉투 살짝 눌림 */}
      <motion.div
        animate={
          opening && !reduceMotion ? { scale: [1, 0.985, 1] } : { scale: 1 }
        }
        transition={T_PRESS}
        style={{ width: 'auto' }}
      >
        <EnvelopeStage opening={opening} reduceMotion={reduceMotion} />
      </motion.div>

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
        '--panel-h': 'calc(var(--peek-up) + var(--env-h) * 0.4)',
        width: 'var(--env-w)',
        height: 'calc(var(--env-h) + var(--peek-up))',
        position: 'relative',
        perspective: 1200,
        overflow: 'visible'
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
      {/* 그림자 */}
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

      {/* envelope-back */}
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

      {/* envelope-inner */}
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

      {/* ─── 반접힌 편지 (top + bottom panel) ───
       *   - 인출(rise) 모션은 컨테이너 motion.div 에 적용 → top + bottom 함께 위로
       *   - 펼침(unfold) 은 bottom panel 의 rotateX 변화 → top edge 축 회전
       *   - 펼치기 전 bottom 은 rotateX -180 으로 top 위에 덮임 (backface hidden)
       */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 'calc((var(--env-w) - var(--letter-w)) / 2)',
          width: 'var(--letter-w)',
          height: 'var(--panel-h)',
          zIndex: 3,
          transformStyle: 'preserve-3d',
          pointerEvents: 'none'
        }}
        animate={
          opening && !reduceMotion ? { y: -260 } : reduceMotion ? {} : { y: 0 }
        }
        transition={T_RISE}
      >
        {/* top panel — 봉투 안에서 살짝 보이는 윗부분 */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paperEdge} 100%)`,
            borderRadius: '4px 4px 0 0',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.75), 0 2px 6px rgba(92,62,40,0.16)'
          }}
          // 처음에 살짝 불투명 → flap 열린 직후 또렷이 보이는 등장감
          animate={
            opening && !reduceMotion ? { opacity: [0.85, 1] } : { opacity: 1 }
          }
          transition={T_PEEK}
        >
          <PanelInk />
        </motion.div>

        {/* bottom panel — 반접혀서 top 위에 덮임 → 펼침 시 자연 위치로 회전 */}
        <motion.div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(180deg, ${C.paperEdge} 0%, ${C.paper} 100%)`,
            borderRadius: '0 0 4px 4px',
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            // 위쪽 가장자리에 fold 그림자 (편지를 한 번 접었던 자국)
            boxShadow:
              'inset 0 4px 6px -2px rgba(110, 80, 50, 0.18), 0 2px 6px rgba(92,62,40,0.14)'
          }}
          initial={{ rotateX: -180 }}
          animate={
            opening && !reduceMotion ? { rotateX: 0 } : { rotateX: -180 }
          }
          transition={T_UNFOLD}
        >
          <PanelInk reverse />
        </motion.div>
      </motion.div>

      {/* envelope-front-pocket (편지의 아래쪽을 봉투 안에 가둠) */}
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

      {/* envelope-left-fold */}
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

      {/* envelope-right-fold */}
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

      {/* envelope-flap (위 삼각형) */}
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
        transition={T_FLAP}
      >
        {/* 봉인 왁스 — 플랩 열림 직전 작게 사라짐 */}
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
          transition={{ duration: 0.18, delay: opening ? 0.06 : 0 }}
        />
      </motion.div>

      {/* 빈티지 우표 — 플랩 영역 밖, 봉투 닫힘/열림 모두 보임 */}
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

      {/* 소인 */}
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

// panel 안에 줄과 작은 항공우편 가장자리 줄을 살짝 그려 종이임을 인지시킴.
function PanelInk({ reverse = false }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: '10px 10px 12px 10px',
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 13px, ${C.paperLine} 13px 14px)`,
        opacity: 0.75,
        pointerEvents: 'none',
        transform: reverse ? 'scaleY(-1)' : 'none' // bottom panel 의 줄 방향도 자연스럽게
      }}
    />
  )
}
