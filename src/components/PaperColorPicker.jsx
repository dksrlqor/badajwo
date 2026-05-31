import { PAPER_COLORS, PAPER_COLOR_KEYS } from './LetterPaper'

export default function PaperColorPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {PAPER_COLOR_KEYS.map((key) => {
        const p = PAPER_COLORS[key]
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="aspect-square rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{
              background: p.bg,
              border: active
                ? `2px solid ${p.edge}`
                : '1px solid rgba(0,0,0,0.06)',
              transform: active ? 'scale(1.06)' : 'scale(1)',
              boxShadow: active ? '0 6px 16px rgba(80,60,50,0.14)' : 'none'
            }}
            aria-label={p.label}
            title={p.label}
          >
            {active && (
              <span className="text-ink-700 text-sm" aria-hidden>
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
