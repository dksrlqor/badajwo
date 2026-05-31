import BotanicDecor from './BotanicDecor'
import PaperScraps from './PaperScraps'

// 수신자 전용 레이아웃. 메인 네비/계정 없이 데스크 위 종이 한 장 위에 봉투만.
// PaperScraps 도 함께 — 받아보는 화면도 같은 스크랩북 세계관 안에 있어야 한다.
export default function RecipientLayout({ children }) {
  return (
    <>
      <BotanicDecor />
      <div className="min-h-full w-full flex justify-center">
        <div
          className="scrapbook-page relative w-full max-w-[480px] min-h-screen px-5 pt-8 pb-16 sm:pt-12 sm:my-6"
          style={{ borderRadius: '10px 6px 12px 8px' }}
        >
          <PaperScraps variant="minimal" />
          {children}
        </div>
      </div>
    </>
  )
}
