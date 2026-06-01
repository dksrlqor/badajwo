import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getUserByUsername } from '../utils/storage'
import MotionButton from '../components/MotionButton'
import ProfileAvatar from '../components/ProfileAvatar'
import { OrnamentLine, PaperStamp, Postmark } from '../components/VintageMail'

// /u/:username — 특정 사용자의 공개 편지 프로필.
// 규칙: URL 의 username 이 곧 편지 받는 사람.
//        로그인 사용자와 무관하게, 이 페이지에서 절대 receiver 가 바뀌지 않는다.
// /me 의 "친구가 보는 화면 미리보기" 는 ?preview=1 으로 들어옴.
export default function UserProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const receiver = useMemo(() => getUserByUsername(username), [username])
  const previewMode =
    new URLSearchParams(location.search).get('preview') === '1'

  if (!receiver) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-12 text-center"
      >
        <div className="text-5xl mb-4">📭</div>
        <h1
          className="text-[18px] font-bold mb-2"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          앗, 이 편지함을 찾을 수 없어요.
        </h1>
        <p className="text-[12px] mb-8 px-4" style={{ color: '#86705E' }}>
          다시 한 번 아이디를 확인해주세요.
          <br />
          <span style={{ color: '#B3987B' }}>/u/{username}</span>
        </p>
        <MotionButton variant="soft" onClick={() => navigate('/write/id')}>
          다른 아이디로 찾아보기
        </MotionButton>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="pt-4"
    >
      {previewMode && (
        <motion.div
          initial={{ opacity: 0, y: -6, rotate: -0.6 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6 }}
          transition={{ duration: 0.4 }}
          className="mx-1 mb-5 px-4 py-3 text-[12px] leading-relaxed"
          style={{
            background: '#FCF096',
            color: '#3D2E22',
            borderRadius: '4px 6px 5px 7px',
            boxShadow: '0 1px 3px rgba(92,62,40,0.18)',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          <b>미리보기</b>
          <br />
          친구들이 보게 될 화면을 미리 확인하는 용도예요. 이 화면에서는 실제 편지를
          보낼 수 없어요.
        </motion.div>
      )}

      {/* 프로필 카드 — 사진 + @username + 편지 쓰기 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="paper-noise relative mx-1 mb-6 text-center"
        style={{
          background: '#FDF8EE',
          padding: '38px 22px 30px',
          borderRadius: '10px 7px 12px 8px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(92,62,40,0.10), 0 18px 38px rgba(92,62,40,0.14)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-sage"
          style={{
            width: 90,
            height: 20,
            top: -10,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        />
        <div aria-hidden style={{ position: 'absolute', top: 18, right: 18 }}>
          <PaperStamp variant="leaf" size={46} rotation={6} />
        </div>
        <div aria-hidden style={{ position: 'absolute', top: 70, left: 14 }}>
          <Postmark size={56} rotation={-12} city="LETTER" date={new Date(receiver.createdAt || Date.now())} />
        </div>

        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 18 }}
          >
            <ProfileAvatar user={receiver} size={88} />
          </motion.div>

          <div
            className="mt-4 text-[20px] font-bold"
            style={{
              color: '#3D2E22',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic'
            }}
          >
            @{receiver.username}
          </div>

          <div className="flex justify-center mt-2 mb-2">
            <OrnamentLine width={110} color="#86705E" />
          </div>

          <p
            className="text-[12px] leading-relaxed px-2"
            style={{
              color: '#5A4538',
              fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
            }}
          >
            이 편지함의 주인이에요.
            <br />
            보내는 편지는 모두 @{receiver.username} 님의 받은 편지함에 도착해요.
          </p>
        </div>
      </motion.div>

      {/* 편지 쓰기 버튼 */}
      <div className="mx-1 mb-5">
        {previewMode ? (
          <MotionButton variant="primary" disabled>
            편지 쓰기 (미리보기에서는 비활성)
          </MotionButton>
        ) : (
          <MotionButton
            variant="primary"
            onClick={() => navigate(`/u/${receiver.username}/write`)}
          >
            편지 쓰기
          </MotionButton>
        )}
      </div>

      {/* 개인정보 안내 */}
      <div
        className="text-[11px] leading-relaxed mx-2 mb-3"
        style={{ color: '#86705E' }}
      >
        로그인하지 않아도 편지를 보낼 수 있어요. 익명으로 보낸 편지는 작성자의 이름,
        이메일, Google 계정 정보가 공개되지 않아요. 자세한 내용은{' '}
        <Link
          to="/privacy"
          className="underline"
          style={{ color: '#5A4538', textUnderlineOffset: 3 }}
        >
          개인정보 처리방침
        </Link>{' '}
        에서.
      </div>
    </motion.div>
  )
}
