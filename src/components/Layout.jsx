import BotanicDecor from './BotanicDecor'
import PaperScraps from './PaperScraps'

// 받아줘 메인 레이아웃 — 데스크 (body) 위에 scrapbook page 한 장 더.
// PaperScraps 가 화면 모서리에 책장 조각/티켓/우표 콜라주를 깔아준다.
export default function Layout({ children }) {
  return (
    <>
      <PaperScraps />
      <BotanicDecor />
      <div className="min-h-full w-full flex justify-center">
        <div
          className="scrapbook-page relative w-full max-w-[480px] min-h-screen px-5 pt-8 pb-10 sm:pt-12 sm:my-6"
          style={{ borderRadius: '10px 6px 12px 8px' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
