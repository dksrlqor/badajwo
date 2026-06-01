import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { OrnamentLine, PaperStamp } from '../components/VintageMail'

// /write — 편지 쓰러가기 메인 선택 화면.
// 두 가지 갈래:
//   1. 아이디로 보내기  → /write/id  → /u/:username/write
//   2. 간단 링크 만들기 → /quick/new → /quick/:code
// "나한테 편지 써줘" 자기 프로필 링크는 /me 대시보드에 있음 (여기 아님).
export default function Write() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-6"
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm px-2 py-1 -ml-2"
          style={{
            color: '#5A4538',
            textDecoration: 'underline dashed rgba(92,62,40,0.32)',
            textUnderlineOffset: 4
          }}
        >
          ← 뒤로
        </button>
      </div>

      <div className="text-center mb-7">
        <h1
          className="text-[22px] font-bold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          편지 쓰러가기
        </h1>
        <div className="flex justify-center mt-2 mb-2">
          <OrnamentLine width={120} color="#86705E" />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#86705E' }}>
          상대방의 아이디로 편지를 보내거나,
          <br />
          아이디 없이 간단한 편지 링크를 만들어 마음을 주고받을 수 있어요.
        </p>
      </div>

      <div className="space-y-4 mx-1">
        <ChoiceCard
          tape="sage"
          tapeWidth={86}
          rotate={-0.6}
          stampVariant="leaf"
          title="아이디로 보내기"
          desc={
            <>
              상대방의 받아줘 아이디를 알고 있다면,
              <br />
              아이디를 입력해서 바로 편지를 보낼 수 있어요.
            </>
          }
          button="아이디 입력하기"
          onClick={() => navigate('/write/id')}
          delay={0.12}
        />
        <ChoiceCard
          tape="blue"
          tapeWidth={92}
          rotate={0.6}
          stampVariant="airmail"
          title="간단 링크 만들기"
          desc={
            <>
              아이디를 몰라도 괜찮아요.
              <br />
              편지 링크를 만들어 친구에게 보내고,
              <br />
              그 링크 안에서 간단하게 마음을 주고받을 수 있어요.
            </>
          }
          button="링크 만들기"
          onClick={() => navigate('/quick/new')}
          delay={0.22}
        />
      </div>

      <p
        className="text-[11px] text-center mt-7 leading-relaxed"
        style={{ color: '#86705E' }}
      >
        받아줘 아이디가 있으면{' '}
        <span style={{ color: '#5A4538' }}>나한테 편지 써줘 링크</span> 도 만들 수 있어요.
        <br />
        <button
          onClick={() => navigate('/me')}
          className="underline mt-1 inline-block"
          style={{
            color: '#5A4538',
            textUnderlineOffset: 3,
            textDecorationStyle: 'dashed'
          }}
        >
          내 편지함으로 이동
        </button>
      </p>
    </motion.div>
  )
}

function ChoiceCard({
  tape = 'sage',
  tapeWidth = 86,
  rotate = -0.5,
  stampVariant = 'leaf',
  title,
  desc,
  button,
  onClick,
  delay = 0
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12, rotate }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="paper-noise relative w-full text-left"
      style={{
        background: '#FDF8EE',
        padding: '22px 20px 20px',
        borderRadius: '10px 7px 12px 8px',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.14)',
        cursor: 'pointer',
        display: 'block'
      }}
    >
      <div
        aria-hidden
        className={`masking-tape tape-${tape}`}
        style={{
          width: tapeWidth,
          height: 18,
          top: -9,
          left: '50%',
          transform: 'translateX(-50%) rotate(-2deg)'
        }}
      />
      <div
        aria-hidden
        style={{ position: 'absolute', top: 6, right: 8 }}
      >
        <PaperStamp variant={stampVariant} size={40} rotation={6} />
      </div>

      <h2
        className="text-[17px] font-bold mb-1"
        style={{
          color: '#3D2E22',
          fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
          letterSpacing: '0.01em',
          paddingRight: 50
        }}
      >
        {title}
      </h2>
      <p
        className="text-[12px] leading-relaxed mb-3"
        style={{ color: '#5A4538', paddingRight: 30 }}
      >
        {desc}
      </p>

      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
        style={{
          color: '#3D2E22',
          background: '#FBF0DC',
          padding: '6px 12px',
          borderRadius: '4px 6px 5px 7px',
          border: '1px dashed rgba(92, 62, 40, 0.32)'
        }}
      >
        {button} <span aria-hidden>→</span>
      </span>
    </motion.button>
  )
}
