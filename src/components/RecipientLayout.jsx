// 수신자 전용 레이아웃 — 메인 네비 없이 같은 픽셀 세계관 안에서 편지만.
export default function RecipientLayout({ children }) {
  return (
    <div className="min-h-full w-full flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen px-4 pt-6 pb-16 sm:pt-10">
        {children}
      </div>
    </div>
  )
}
