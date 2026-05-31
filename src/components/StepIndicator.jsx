export default function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i + 1 <= current
        return (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              filled ? 'bg-accent-pinkDeep' : 'bg-cream-200'
            }`}
          />
        )
      })}
    </div>
  )
}
