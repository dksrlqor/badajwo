import Footer from './Footer'

// 수신자 전용 레이아웃 — 메인 네비 없이 같은 픽셀 세계관 안에서 편지만.
// 편지 감성을 해치지 않게 footer 는 최소형 한 줄만.
export default function RecipientLayout({ children }) {
  return (
    <div className="min-h-full w-full flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen flex flex-col px-4 pt-6 sm:pt-10">
        <div className="flex-1 pb-12">{children}</div>
        <Footer variant="minimal" />
      </div>
    </div>
  )
}
