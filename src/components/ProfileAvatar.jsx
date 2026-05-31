// 받아줘 프로필 아바타.
// user.profileImage 있으면 사진, 없으면 빈티지 종이/우표 톤 기본 아바타.
export default function ProfileAvatar({ user, size = 48, className = '' }) {
  const hasImage = user?.profileImage
  const initial =
    (user?.username && user.username[0]) ||
    (user?.displayName && user.displayName[0]) ||
    '?'
  if (hasImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.username || 'profile'}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          background: '#F8EFD8',
          boxShadow:
            '0 1px 2px rgba(92,62,40,0.18), 0 6px 14px rgba(92,62,40,0.10)',
          border: '2px solid #FDF8EE'
        }}
      />
    )
  }
  // 기본 아바타 — 작은 우표/스탬프 톤
  return (
    <div
      className={className}
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 30% 30%, #FCF6E6 0%, #F2DCB8 60%, #D8BF93 100%)',
        boxShadow:
          '0 1px 2px rgba(92,62,40,0.20), 0 6px 14px rgba(92,62,40,0.12), inset 0 0 0 2px #FDF8EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#5A4538',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: size * 0.45,
        textTransform: 'lowercase',
        userSelect: 'none'
      }}
    >
      {initial}
    </div>
  )
}
