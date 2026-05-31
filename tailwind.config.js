/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 기존 cream — 더 따뜻한 베이지 톤으로 조정 (모든 컴포넌트가 자동으로 종이 톤이 됨)
        cream: {
          50:  '#FDF8EE',
          100: '#FAF1E1',
          200: '#F4E6D0',
          300: '#E8D5B8'
        },
        // 잉크 — 검정 대신 따뜻한 다크 브라운 (편지에 펜으로 쓴 느낌)
        ink: {
          900: '#3D2E22',
          700: '#5A4538',
          500: '#86705E',
          300: '#BEAA98',
          100: '#EADFCB'
        },
        // accent — 블러쉬 / 라벤더 (부드러운 파스텔)
        accent: {
          pink:         '#F8D0C7',
          pinkDeep:     '#D89588',
          lavender:     '#DDD0EF',
          lavenderDeep: '#9F89C7'
        },
        // 추가 paper stationery 토큰
        paper: {
          ivory: '#FDF8EE',
          cream: '#FAF1E1',
          sand:  '#F4E6D0',
          kraft: '#E8D5B8',
          deep:  '#D8C0A3'
        },
        blush:    { 100: '#FCE5E0', 300: '#F2BFB8', 500: '#D89588' },
        butter:   { 100: '#FFF7C6', 300: '#F2DA85' },
        sage:     { 100: '#E8EFE2', 300: '#C9D6BD' },
        sky:      { 100: '#E2EDF8', 300: '#B5CDE5' },
        envelope: {
          back:  '#E5D2B8',
          front: '#E2CFB3',
          flap:  '#DDC9AC',
          liner: '#F4E5CC',
          fold:  '#D2B898'
        },
        seal: { wax: '#B8755D' },
        // 항공우편 (airmail) 색 — 빈티지 톤, 너무 채도 높지 않게
        airmail: {
          red:  '#C7443E', // vintage red
          blue: '#4E6B8A', // dusty blue
          navy: '#2C3E5A', // muted navy ink
          ink:  '#3D2E22'  // 본문 잉크 (ink-900 과 동일)
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',
          '"Malgun Gothic"',
          'Pretendard',
          '"Noto Sans KR"',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ]
      },
      boxShadow: {
        // 종이 그림자 — 검정 대신 따뜻한 brown alpha
        'paper-sm': '0 1px 2px rgba(92, 62, 40, 0.06), 0 4px 12px rgba(92, 62, 40, 0.06)',
        paper:      '0 2px 5px rgba(92, 62, 40, 0.08), 0 14px 32px rgba(92, 62, 40, 0.10)',
        'paper-lg': '0 4px 10px rgba(92, 62, 40, 0.10), 0 24px 56px rgba(92, 62, 40, 0.14)',
        // 기존 호환
        soft: '0 8px 30px rgba(92, 62, 40, 0.08)',
        card: '0 12px 40px rgba(92, 62, 40, 0.10), 0 2px 6px rgba(92, 62, 40, 0.06)'
      }
    }
  },
  plugins: []
}
