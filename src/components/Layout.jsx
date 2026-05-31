import BotanicDecor from './BotanicDecor'
import PaperScraps from './PaperScraps'

// 받아줘 메인 레이아웃 — 데스크 (body) 위에 scrapbook page 한 장.
// PaperScraps 는 page 안쪽에 absolute 로 깔려 가장자리에서 살짝 보인다.
export default function Layout({ children }) {
  return (
    <>
      <BotanicDecor />
      <div className="min-h-full w-full flex justify-center">
        <div
          className="scrapbook-page relative w-full max-w-[480px] min-h-screen px-5 pt-8 pb-10 sm:pt-12 sm:my-6"
          style={{ borderRadius: '10px 6px 12px 8px' }}
        >
          <PaperScraps />
          {children}
        </div>
      </div>
    </>
  )
}
