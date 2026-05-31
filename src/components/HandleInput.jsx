import { useEffect, useState } from 'react'
import { validateHandle } from '../utils/validation'
import { checkHandleDuplicate } from '../utils/userDirectory'

function useDebounced(value, delay) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export default function HandleInput({
  value,
  onChange,
  excludeUserId,
  onValidityChange
}) {
  const local = validateHandle(value)
  const [remote, setRemote] = useState('idle') // idle | checking | ok | dup | error
  const debounced = useDebounced(value, 450)

  useEffect(() => {
    if (!local.valid) {
      setRemote('idle')
      onValidityChange?.(false)
      return
    }
    let cancelled = false
    setRemote('checking')
    checkHandleDuplicate(debounced, excludeUserId)
      .then((dup) => {
        if (cancelled) return
        const next = dup ? 'dup' : 'ok'
        setRemote(next)
        onValidityChange?.(next === 'ok')
      })
      .catch(() => {
        if (cancelled) return
        setRemote('error')
        onValidityChange?.(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, local.valid])

  let msg = ''
  let tone = 'text-ink-500'
  if (!value) {
    msg = '영문 소문자·숫자·_ 로 3~16자.'
  } else if (local.code === 'reserved') {
    msg = '예약된 아이디라 사용할 수 없어요.'
    tone = 'text-accent-pinkDeep'
  } else if (!local.valid) {
    msg = local.message
    tone = 'text-accent-pinkDeep'
  } else if (remote === 'checking') {
    msg = '확인 중...'
  } else if (remote === 'ok') {
    msg = '사용 가능한 아이디예요.'
    tone = 'text-accent-lavenderDeep'
  } else if (remote === 'dup') {
    msg = '이미 누군가 사용 중인 아이디예요.'
    tone = 'text-accent-pinkDeep'
  } else if (remote === 'error') {
    msg = '확인이 잠시 어려워요. 다시 시도해주세요.'
    tone = 'text-accent-pinkDeep'
  }

  return (
    <div>
      <label className="label">아이디</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none select-none">
          @
        </span>
        <input
          className="field pl-9"
          value={value}
          onChange={(e) => {
            const cleaned = e.target.value
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '')
            onChange(cleaned)
          }}
          placeholder="letterboy"
          maxLength={16}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>
      <p className={`text-xs mt-2 leading-relaxed ${tone}`}>{msg}</p>
      {value && local.valid && remote === 'ok' && (
        <p className="text-xs text-ink-500 mt-1">
          내 아이디는{' '}
          <span className="font-semibold text-accent-lavenderDeep">
            @{value}
          </span>{' '}
          로 보여요.
        </p>
      )}
    </div>
  )
}
