import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { OrnamentLine } from '../components/VintageMail'

// 개인정보 처리방침 — MVP 초안.
// 실제 배포 전 운영자 이메일/위탁 업체명/시행일 수정 필요.

function Section({ title, children }) {
  return (
    <section className="mb-7">
      <h2
        className="text-[15px] font-bold mb-2"
        style={{
          color: '#3D2E22',
          fontFamily: "'Apple SD Gothic Neo', Georgia, serif",
          letterSpacing: '0.01em'
        }}
      >
        {title}
      </h2>
      <div
        className="text-[13px] leading-[1.85]"
        style={{ color: '#5A4538' }}
      >
        {children}
      </div>
    </section>
  )
}

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-4"
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="text-sm px-2 py-1 -ml-2"
          style={{
            color: '#5A4538',
            textDecoration: 'underline dashed rgba(92,62,40,0.32)',
            textUnderlineOffset: 4
          }}
        >
          ← 뒤로
        </button>
      </div>

      <header className="text-center mb-7">
        <h1
          className="text-[22px] font-bold"
          style={{
            color: '#3D2E22',
            fontFamily: "'Apple SD Gothic Neo', Georgia, serif"
          }}
        >
          개인정보 처리방침
        </h1>
        <div className="flex justify-center mt-2">
          <OrnamentLine width={120} color="#86705E" />
        </div>
        <p className="text-[11px] mt-2" style={{ color: '#86705E' }}>
          MVP 초안 · 배포 전 실제 운영 정보로 갱신
        </p>
      </header>

      {/* 종이 한 장 위에 적힌 처리방침 */}
      <div
        className="paper-noise relative mx-1"
        style={{
          background: '#FDF8EE',
          padding: '24px 22px 28px',
          borderRadius: '8px 6px 10px 7px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.12)'
        }}
      >
        <div
          aria-hidden
          className="masking-tape tape-kraft"
          style={{
            width: 90,
            height: 18,
            top: -9,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        />

        <p className="text-[13px] leading-[1.85] mb-6" style={{ color: '#5A4538' }}>
          받아줘는 사용자의 편지, 프로필, 계정 정보를 소중하게 다룹니다. 이 문서는
          받아줘가 어떤 정보를 수집하고, 왜 사용하며, 어떻게 보호하는지 설명합니다.
          본 처리방침은 서비스 정식 운영 전 MVP 기준의 초안이며, 실제 배포 전 관련
          법령과 운영 방식에 맞게 수정될 수 있습니다.
        </p>

        <Section title="1. 수집하는 개인정보">
          <p className="mb-2">
            받아줘는 서비스 제공을 위해 필요한 최소한의 정보만 수집합니다.
          </p>
          <p className="mb-1 font-semibold" style={{ color: '#3D2E22' }}>
            Google 로그인 시 수집되는 정보
          </p>
          <ul className="list-disc pl-5 mb-3">
            <li>Google 계정 고유 식별값</li>
            <li>이메일 주소</li>
            <li>이름 또는 닉네임</li>
            <li>Google 프로필 사진</li>
            <li>로그인 기록</li>
          </ul>
          <p className="mb-1 font-semibold" style={{ color: '#3D2E22' }}>
            사용자가 직접 입력하는 정보
          </p>
          <ul className="list-disc pl-5 mb-3">
            <li>사용자 아이디</li>
            <li>프로필 이름</li>
            <li>프로필 사진</li>
            <li>편지 내용</li>
            <li>편지 작성 시 입력한 이름</li>
            <li>답장 내용</li>
            <li>공개 여부 선택 정보</li>
            <li>보관 또는 삭제 상태</li>
          </ul>
          <p className="mb-1 font-semibold" style={{ color: '#3D2E22' }}>
            자동으로 생성되거나 저장되는 정보
          </p>
          <ul className="list-disc pl-5">
            <li>편지 작성 시간</li>
            <li>편지 수신 시간</li>
            <li>공개 여부</li>
            <li>보관 여부</li>
            <li>신고 기록</li>
            <li>서비스 이용 기록</li>
            <li>오류 기록</li>
          </ul>
        </Section>

        <Section title="2. 개인정보를 수집하는 목적">
          <ul className="list-disc pl-5">
            <li>Google 로그인 제공</li>
            <li>사용자 계정 생성 및 관리</li>
            <li>사용자 고유 아이디 생성</li>
            <li>프로필 링크 생성</li>
            <li>편지 작성 및 전달</li>
            <li>받은 편지함 제공</li>
            <li>공개 편지함 제공</li>
            <li>보관함 제공</li>
            <li>답장 기능 제공</li>
            <li>부정 이용 방지</li>
            <li>신고 및 안전 관리</li>
            <li>서비스 오류 확인 및 개선</li>
          </ul>
          <p className="mt-3">
            받아줘는 위 목적과 관계없는 방식으로 개인정보를 사용하지 않습니다.
          </p>
        </Section>

        <Section title="3. 편지와 익명성에 대한 안내">
          <p className="mb-2">
            받아줘에서는 로그인하지 않은 사람도 편지를 보낼 수 있습니다. 사용자가
            이름을 입력하지 않고 익명으로 편지를 보내는 경우, 받은 사람에게 작성자의
            계정 정보나 이메일 주소를 공개하지 않습니다.
          </p>
          <p className="mb-2">
            다만 다음의 경우 서비스 안전을 위해 필요한 기록이 내부적으로 보관될 수 있습니다.
          </p>
          <ul className="list-disc pl-5 mb-2">
            <li>욕설, 괴롭힘, 스팸 등 부정 이용이 의심되는 경우</li>
            <li>신고가 접수된 경우</li>
            <li>서비스 보안이나 안정성 확인이 필요한 경우</li>
            <li>법령에 따라 확인이 필요한 경우</li>
          </ul>
          <p>
            익명 편지는 받은 사람에게 익명으로 표시되지만, 서비스를 악용하는 행위까지
            보호한다는 의미는 아닙니다.
          </p>
        </Section>

        <Section title="4. 프로필 정보 공개 범위">
          <p className="mb-2">사용자의 프로필 링크에는 다음 정보가 표시될 수 있습니다.</p>
          <ul className="list-disc pl-5 mb-3">
            <li>사용자 아이디</li>
            <li>프로필 이름</li>
            <li>프로필 사진</li>
            <li>공개 편지 일부</li>
          </ul>
          <p>
            단, 받은 편지는 기본적으로 비공개입니다. 받은 편지가 공개되는 경우는
            사용자가 직접 “공개하기”를 선택한 경우에 한정됩니다. 받아줘는 사용자의 받은
            편지를 자동으로 공개하지 않습니다.
          </p>
        </Section>

        <Section title="5. 개인정보의 보관 기간">
          <ul className="list-disc pl-5 mb-3">
            <li>계정 정보: 사용자가 계정을 유지하는 동안</li>
            <li>받은 편지: 사용자가 삭제하기 전까지</li>
            <li>공개 편지: 사용자가 공개를 해제하거나 삭제하기 전까지</li>
            <li>보관 편지: 사용자가 삭제하기 전까지</li>
            <li>신고 및 안전 관련 기록: 서비스 안전 관리를 위해 필요한 기간</li>
          </ul>
          <p>
            사용자가 계정 삭제를 요청하는 경우, 관련 법령 또는 서비스 안전을 위해
            필요한 경우를 제외하고 개인정보를 삭제하거나 더 이상 식별할 수 없도록
            처리합니다.
          </p>
        </Section>

        <Section title="6. 개인정보의 제3자 제공">
          <p className="mb-2">
            받아줘는 사용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
          </p>
          <ul className="list-disc pl-5">
            <li>사용자가 직접 동의한 경우</li>
            <li>법령에 따라 요청이 있는 경우</li>
            <li>서비스의 안전을 위해 필요한 범위에서 확인이 필요한 경우</li>
          </ul>
        </Section>

        <Section title="7. 개인정보 처리 위탁">
          <p className="mb-2">예상되는 외부 서비스는 다음과 같습니다.</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Google: 로그인 인증</li>
            <li>데이터베이스/서버 제공 서비스: 계정 및 편지 데이터 저장</li>
            <li>이미지 저장 서비스: 프로필 사진 저장</li>
            <li>분석 또는 오류 확인 도구: 서비스 안정성 개선</li>
          </ul>
          <p>
            실제 사용하는 외부 서비스가 확정되면 이 항목에 구체적인 업체명과 처리 목적을
            추가합니다.
          </p>
        </Section>

        <Section title="8. 개인정보 보호를 위한 조치">
          <ul className="list-disc pl-5">
            <li>로그인 인증을 통한 계정 보호</li>
            <li>사용자별 편지함 접근 권한 분리</li>
            <li>받는 사람을 URL 기준으로 고정하여 오배송 방지</li>
            <li>받은 편지 기본 비공개 처리</li>
            <li>공개 여부를 사용자가 직접 선택하도록 설계</li>
            <li>신고 및 차단 기능 확장 가능 구조 마련</li>
            <li>필요하지 않은 개인정보 수집 최소화</li>
            <li>관리자 접근 제한</li>
            <li>데이터베이스 보안 규칙 적용</li>
          </ul>
        </Section>

        <Section title="9. 사용자의 권리">
          <ul className="list-disc pl-5">
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정 요청</li>
            <li>개인정보 삭제 요청</li>
            <li>계정 삭제 요청</li>
            <li>공개 편지 비공개 전환</li>
            <li>프로필 정보 수정</li>
            <li>동의 철회 요청</li>
          </ul>
          <p className="mt-3">
            위 요청은 서비스 내 기능 또는 운영자 문의를 통해 처리할 수 있습니다.
          </p>
        </Section>

        <Section title="10. 쿠키 및 자동 수집 정보">
          <p>
            받아줘는 로그인 상태 유지, 서비스 안정성 확인, 사용성 개선을 위해 쿠키 또는
            유사한 기술을 사용할 수 있습니다. 사용자는 브라우저 설정을 통해 쿠키 저장을
            거부하거나 삭제할 수 있습니다. 다만 쿠키를 제한할 경우 로그인 유지 등 일부
            기능이 정상적으로 작동하지 않을 수 있습니다.
          </p>
        </Section>

        <Section title="11. 아동 및 청소년 보호">
          <p className="mb-2">
            받아줘는 편지 기반 소통 서비스이므로, 사용자가 불쾌하거나 위험한 내용을 받지
            않도록 안전 기능을 중요하게 다룹니다.
          </p>
          <ul className="list-disc pl-5 mb-2">
            <li>신고하기</li>
            <li>차단하기</li>
            <li>부적절한 표현 필터링</li>
            <li>공개 편지 관리</li>
            <li>민감한 개인정보 입력 경고</li>
          </ul>
          <p>
            사용자는 편지에 전화번호, 주소, 학교, SNS 아이디 등 민감한 개인정보를 적지
            않도록 안내받아야 합니다.
          </p>
        </Section>

        <Section title="12. 문의">
          <ul className="list-disc pl-5">
            <li>서비스명: 받아줘</li>
            <li>문의 이메일: hpq7khgyqd@privaterelay.appleid.com</li>
            <li>운영자: 받아줘 운영자</li>
          </ul>
        </Section>

        <Section title="13. 처리방침 변경">
          <p>
            이 개인정보 처리방침은 서비스 운영 방식, 법령, 기능 변경에 따라 수정될 수
            있습니다. 처리방침이 변경되는 경우 서비스 내 공지 또는 개인정보 처리방침
            페이지를 통해 안내합니다.
          </p>
          <p className="mt-3" style={{ color: '#86705E' }}>
            시행일: 2026년 6월 1일
          </p>
        </Section>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/')}
          className="text-[13px]"
          style={{
            color: '#5A4538',
            textDecoration: 'underline dashed rgba(92,62,40,0.32)',
            textUnderlineOffset: 4
          }}
        >
          홈으로
        </button>
      </div>
    </motion.div>
  )
}
