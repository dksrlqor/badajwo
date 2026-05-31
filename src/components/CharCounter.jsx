// 입력창 아래 글자수 + 따뜻한 안내 문구.
// 본문(1600자) 처럼 soft 경고가 필요한 경우 softWarnAt 과 softMessage 를 함께 전달.

export default function CharCounter({
  value,
  max,
  softWarnAt,
  softMessage,
  hardMessage,
  className = ''
}) {
  const len = (value || '').length
  const over = len > max
  const soft = softWarnAt != null && len >= softWarnAt && !over
  return (
    <div className={`mt-2 flex items-start justify-between gap-3 text-xs ${className}`}>
      <div className="flex-1 leading-relaxed">
        {over && (
          <span className="text-accent-pinkDeep">
            {hardMessage || `${max}자까지만 입력할 수 있어요.`}
          </span>
        )}
        {!over && soft && softMessage && (
          <span className="text-accent-lavenderDeep">{softMessage}</span>
        )}
      </div>
      <div
        className={`flex-shrink-0 tabular-nums ${
          over ? 'text-accent-pinkDeep font-semibold' : 'text-ink-500'
        }`}
      >
        {len} / {max}
      </div>
    </div>
  )
}
