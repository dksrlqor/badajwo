// 받아줘 Supabase 클라이언트.
// 환경변수가 모두 있을 때만 client 인스턴스를 생성한다.
// 없으면 storage.js 가 localStorage fallback 으로 동작 — 디바이스 간 공유는 안 되지만 앱 자체는 깨지지 않는다.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

let client = null
if (url && key) {
  client = createClient(url, key, {
    auth: {
      // 받아줘는 우리 자체 Google OAuth + username 흐름을 쓰기 때문에
      // supabase 의 세션을 유지하지 않는다.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: { 'x-application-name': 'badajwo' }
    }
  })
} else if (typeof window !== 'undefined') {
  // 개발 중 환경변수 누락 빠르게 인지하도록 한 번만 알림.
  console.warn(
    '[badajwo] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 비어 있어요. ' +
      'simple letter 가 localStorage 로만 저장됩니다 (디바이스 간 공유 X).'
  )
}

export const supabase = client
export const hasSupabase = !!client

export const SIMPLE_LETTERS_TABLE = 'simple_letters'
export const LETTER_PHOTOS_BUCKET = 'letter-photos'
export const RPC_INCREMENT_VIEW = 'increment_letter_view'
