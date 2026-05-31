import BotanicDecor from './BotanicDecor'

export default function Layout({ children }) {
  return (
    <>
      <BotanicDecor />
      <div className="min-h-full w-full flex justify-center">
        <div className="relative w-full max-w-[480px] min-h-screen px-5 pt-8 pb-10 sm:pt-12">
          {children}
        </div>
      </div>
    </>
  )
}
