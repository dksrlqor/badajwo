import { useEffect, useState } from 'react'
import { validateNickname } from '../utils/validation'
import { checkNicknameDuplicate } from '../utils/userDirectory'

function useDebounced(value, delay) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export default function NicknameInput({
  value,
  onChange,
  excludeUserId,
  onValidityChange
}) {
  const local = validateNickname(value)
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
    checkNicknameDuplicate(debounced, excludeUserId)
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
    msg = '한글·영문·숫자 2~12자로 입력해주세요.'
  } else if (!local.valid) {
    msg = local.message
    tone = 'text-accent-pinkDeep'
  } else if (remote === 'checking') {
    msg = '확인 중...'
  } else if (remote === 'ok') {
    msg = '사용 가능한 닉네임이에요.'
    tone = 'text-accent-lavenderDeep'
  } else if (remote === 'dup') {
    msg = '이미 사용 중인 닉네임이에요.'
    tone = 'text-accent-pinkDeep'
  } else if (remote === 'error') {
    msg = '확인이 잠시 어려워요. 다시 시도해주세요.'
    tone = 'text-accent-pinkDeep'
  }

  return (
    <div>
      <label className="label">닉네임</label>
      <input
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="별명이나 이름"
        maxLength={12}
      />
      <p className={`text-xs mt-2 leading-relaxed ${tone}`}>{msg}</p>
    </div>
  )
}
