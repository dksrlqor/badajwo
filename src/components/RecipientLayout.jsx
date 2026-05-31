// 공유 링크로 들어온 수신자 전용 레이아웃.
// 메인 사이트의 네비/계정/메뉴 등 일반 웹 UI 가 보이면 안 되고,
// 종이 책상 배경 + 봉투/편지 + 하단 "나도 편지쓰기" 탭만 남긴다.
export default function RecipientLayout({ children }) {
  return (
    <div className="min-h-full w-full flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen px-5 pt-8 pb-16 sm:pt-12">
        {children}
      </div>
    </div>
  )
}
