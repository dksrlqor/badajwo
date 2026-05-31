import BotanicDecor from './BotanicDecor'

// 수신자 전용 레이아웃. 메인 네비/계정 없이 데스크 위 종이 한 장 위에 봉투만.
export default function RecipientLayout({ children }) {
  return (
    <>
      <BotanicDecor />
      <div className="min-h-full w-full flex justify-center">
        <div
          className="scrapbook-page relative w-full max-w-[480px] min-h-screen px-5 pt-8 pb-16 sm:pt-12 sm:my-6"
          style={{ borderRadius: '10px 6px 12px 8px' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
