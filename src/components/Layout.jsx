import Footer from './Footer'

// 받아줘 메인 레이아웃 — 크림 핑크 + 하트 패턴(body) 위의 중앙 컬럼.
// 픽셀 세계관에서는 별도 종이 장식 없이 윈도우/카드가 곧 무대.
// footer 는 모든 일반 페이지 하단에 공통으로 붙는다.
export default function Layout({ children }) {
  return (
    <div className="min-h-full w-full flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen flex flex-col px-4 pt-6 sm:pt-10">
        <div className="flex-1 pb-10">{children}</div>
        <Footer />
      </div>
    </div>
  )
}
