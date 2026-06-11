import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Footer from './Footer'

// 정책·약관 등 법적/안내성 문서 전용 레이아웃.
// 사이트의 픽셀 세계관과 달리 여기서는 정보 전달이 우선이다:
//   - 픽셀 폰트 대신 시스템 산세리프
//   - 본문 15px 이상 / line-height 1.7
//   - 장식은 헤더의 작은 하트 하나로 제한, 본문에는 적용하지 않는다

export const DOC_FONT =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif"

const INK = '#3F3236'
const INK_SOFT = '#6B5A5E'

export function DocSection({ title, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: INK,
          marginBottom: 8
        }}
      >
        {title}
      </h2>
      <div style={{ color: INK }}>{children}</div>
    </section>
  )
}

export default function DocPage({ title, intro, updatedAt, children }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-full w-full flex justify-center">
      <div
        className="relative w-full max-w-[760px] min-h-screen flex flex-col px-4 pt-6 pb-0 sm:px-6 sm:pt-10"
        style={{ fontFamily: DOC_FONT }}
      >
        <div className="flex-1">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="text-[14px] px-1 py-1 -ml-1 mb-5"
            style={{
              fontFamily: DOC_FONT,
              color: INK_SOFT,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 4
            }}
          >
            ← 뒤로
          </button>

          <header style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: INK }}>
              <span aria-hidden style={{ color: 'var(--px-heart)', fontSize: 16 }}>
                ♥
              </span>{' '}
              {title}
            </h1>
            {intro && (
              <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.7, color: INK_SOFT }}>
                {intro}
              </p>
            )}
            {updatedAt && (
              <p style={{ marginTop: 6, fontSize: 13, color: INK_SOFT }}>{updatedAt}</p>
            )}
          </header>

          <article
            className="doc-card"
            style={{
              background: '#FFFDF8',
              border: '1px solid rgba(158, 92, 100, 0.28)',
              borderRadius: 12,
              boxShadow: '0 2px 10px rgba(158, 92, 100, 0.08)',
              padding: '26px 22px 30px',
              fontSize: 15.5,
              lineHeight: 1.7,
              color: INK,
              wordBreak: 'keep-all',
              overflowWrap: 'break-word'
            }}
          >
            {children}
          </article>
        </div>

        <Footer />
      </div>
    </div>
  )
}
