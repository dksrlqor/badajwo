// 받아줘 메인 레이아웃 — 크림 핑크 + 하트 패턴(body) 위의 중앙 컬럼.
// 픽셀 세계관에서는 별도 종이 장식 없이 윈도우/카드가 곧 무대.
export default function Layout({ children }) {
  return (
    <div className="min-h-full w-full flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen px-4 pt-6 pb-14 sm:pt-10">
        {children}
      </div>
    </div>
  )
}
