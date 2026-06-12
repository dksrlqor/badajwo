import DocPage, { DocSection } from '../components/DocPage'
import { SNS_LINKS } from '../config/site'

// 개인정보 처리방침 — 정식 버전 (2026-06-13 확정).
// 운영 방식이 바뀌면 본문과 개정일을 함께 갱신할 것. 문의는 인스타그램 DM.
// 디자인 원칙: 픽셀 폰트·장식 없이 일반 문서처럼 읽기 쉽게 (DocPage).

export default function Privacy() {
  return (
    <DocPage
      title="개인정보 처리방침"
      intro="받아줘는 사용자의 편지, 프로필, 계정 정보를 소중히 다룹니다. 이 문서는 받아줘가 어떤 정보를 수집하고, 왜 사용하며, 어떻게 보호하는지 설명합니다."
      updatedAt="시행일 2026년 6월 1일 · 최종 개정 2026년 6월 13일"
    >
      <DocSection title="1. 수집하는 개인정보">
        <p className="mb-2">
          받아줘는 서비스 제공을 위해 필요한 최소한의 정보만 수집합니다.
        </p>
        <p className="mb-1 font-semibold">Google 로그인 시 수집되는 정보</p>
        <ul className="list-disc pl-5 mb-3">
          <li>Google 계정 고유 식별값</li>
          <li>이메일 주소</li>
          <li>이름 또는 닉네임</li>
          <li>Google 프로필 사진</li>
          <li>로그인 기록</li>
        </ul>
        <p className="mb-1 font-semibold">사용자가 직접 입력하는 정보</p>
        <ul className="list-disc pl-5 mb-3">
          <li>사용자 아이디</li>
          <li>프로필 이름</li>
          <li>프로필 사진</li>
          <li>편지 내용 (받은 편지·일회성 편지 포함)</li>
          <li>편지에 첨부한 사진</li>
          <li>편지 작성 시 입력한 이름</li>
          <li>답장 내용</li>
          <li>공개 여부 선택 정보</li>
          <li>보관 또는 삭제 상태</li>
        </ul>
        <p className="mb-1 font-semibold">자동으로 생성되거나 저장되는 정보</p>
        <ul className="list-disc pl-5">
          <li>편지 작성 시간</li>
          <li>편지 수신 시간</li>
          <li>일회성 편지의 만료 시각 (작성 후 24시간)</li>
          <li>공개 여부</li>
          <li>보관 여부</li>
          <li>신고 기록</li>
          <li>서비스 이용 기록</li>
          <li>오류 기록</li>
        </ul>
      </DocSection>

      <DocSection title="2. 개인정보를 수집하는 목적">
        <ul className="list-disc pl-5">
          <li>Google 로그인 제공</li>
          <li>사용자 계정 생성 및 관리</li>
          <li>사용자 고유 아이디 생성</li>
          <li>프로필 링크 생성</li>
          <li>편지 작성 및 전달</li>
          <li>일회성 편지 전용 링크 생성 및 만료 관리</li>
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
      </DocSection>

      <DocSection title="3. 편지와 익명성에 대한 안내">
        <p className="mb-2">
          받아줘에서는 로그인하지 않은 사람도 편지를 보낼 수 있습니다. 사용자가
          이름을 입력하지 않고 익명으로 편지를 보내는 경우, 받은 사람에게 작성자의
          계정 정보나 이메일 주소를 공개하지 않습니다.
        </p>
        <p className="mb-2">
          다만 다음의 경우 서비스 안전을 위해 필요한 기록이 내부적으로 보관될 수
          있습니다.
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
      </DocSection>

      <DocSection title="4. 프로필 정보 공개 범위">
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
      </DocSection>

      <DocSection title="5. 개인정보의 보관 기간">
        <ul className="list-disc pl-5 mb-3">
          <li>계정 정보: 사용자가 계정을 유지하는 동안</li>
          <li>받은 편지: 사용자가 삭제하기 전까지</li>
          <li>공개 편지: 사용자가 공개를 해제하거나 삭제하기 전까지</li>
          <li>보관 편지: 사용자가 삭제하기 전까지</li>
          <li>
            일회성 편지(전용 링크 편지): 작성 후 24시간 동안만 열람할 수 있으며,
            만료된 편지는 링크로 더 이상 열람할 수 없습니다. 만료된 편지 데이터는
            운영 과정에서 순차적으로 삭제될 수 있습니다.
          </li>
        </ul>
        <p>
          사용자는 내 편지함(/me) 하단의 <b>계정 삭제하기</b>를 통해 직접 본인의
          계정과 데이터를 삭제할 수 있습니다. 삭제 시 받은 편지, 보관함, 내가 만든
          일회성 편지 링크와 그 안의 메시지가 함께 사라지며, 다른 사람에게 보낸
          편지의 내 신원 정보는 익명으로 처리됩니다. 받은 사람의 편지지 자체는 그
          사람의 소유이므로 그대로 보존됩니다. 삭제는 되돌릴 수 없습니다.
        </p>
      </DocSection>

      <DocSection title="6. 개인정보의 제3자 제공">
        <p className="mb-2">
          받아줘는 사용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다음의
          경우에만 예외로 합니다.
        </p>
        <ul className="list-disc pl-5">
          <li>사용자가 직접 동의한 경우</li>
          <li>법령에 따라 요청이 있는 경우</li>
          <li>서비스의 안전을 위해 필요한 범위에서 확인이 필요한 경우</li>
        </ul>
      </DocSection>

      <DocSection title="7. 개인정보 처리 위탁 및 외부 서비스">
        <p className="mb-2">받아줘가 현재 사용하는 외부 서비스는 다음과 같습니다.</p>
        <ul className="list-disc pl-5 mb-3">
          <li>Google: OAuth 로그인 인증 (계정 식별값, 이메일, 이름, 프로필 사진 수신)</li>
          <li>
            Supabase: 일회성 편지(전용 링크 편지)의 내용과 첨부 사진 저장
            (데이터베이스·파일 저장소)
          </li>
          <li>GitHub Pages: 정적 웹 호스팅 (코드와 정적 자산만 제공)</li>
        </ul>
        <p className="mb-2">
          받은 편지함(내 편지함)의 편지와 계정 정보는 현재 사용자 본인 브라우저
          저장소(localStorage)에 저장되며, 별도의 서버로 전송되지 않습니다. 일회성
          편지의 내용과 사진만 전용 링크 공유를 위해 Supabase 에 저장됩니다.
        </p>
        <p>
          향후 분석 도구 등 외부 서비스를 추가로 도입할 경우 이 항목에 구체적인
          업체명과 처리 목적을 추가하고 변경 사항을 공지합니다.
        </p>
      </DocSection>

      <DocSection title="8. 개인정보 보호를 위한 조치">
        <ul className="list-disc pl-5">
          <li>Google OAuth 인증을 통한 계정 보호</li>
          <li>사용자별 편지함 접근 권한 분리 — 받은 편지는 본인만 열람 가능</li>
          <li>받는 사람을 URL 기준으로 고정하여 오배송 방지</li>
          <li>받은 편지 기본 비공개 처리 — 사용자가 직접 공개를 선택해야 외부 노출</li>
          <li>일회성 편지는 링크를 아는 사람만 열람 가능하며 24시간 후 자동 만료</li>
          <li>익명 편지의 작성자 식별 정보가 받는 사람에게 표시되지 않도록 강제</li>
          <li>필요하지 않은 개인정보 수집 최소화</li>
        </ul>
      </DocSection>

      <DocSection title="9. 사용자의 권리">
        <ul className="list-disc pl-5">
          <li>개인정보 열람 요청</li>
          <li>개인정보 수정 요청</li>
          <li>개인정보 삭제 요청</li>
          <li>계정 삭제 요청</li>
          <li>공개 편지 비공개 전환</li>
          <li>프로필 정보 수정</li>
          <li>동의 철회 요청</li>
        </ul>
      </DocSection>

      <DocSection title="10. 브라우저 저장소 사용">
        <p className="mb-2">
          받아줘는 현재 쿠키를 사용하지 않으며, 로그인 상태와 받은 편지함 데이터를
          브라우저의 localStorage 에 저장합니다.
        </p>
        <p>
          사용자는 브라우저 설정을 통해 localStorage 내용을 직접 삭제할 수 있습니다.
          삭제할 경우 로그인 상태, 받은 편지, 보관 편지 등이 함께 사라지며 복구할 수
          없습니다. 일회성 편지는 Supabase 에 저장되므로 브라우저 저장소 삭제와
          무관하게 만료 시각까지 링크로 열람할 수 있습니다.
        </p>
      </DocSection>

      <DocSection title="11. 처리방침 변경">
        <p>
          이 개인정보 처리방침은 서비스 운영 방식, 법령, 기능 변경에 따라 수정될 수
          있습니다. 처리방침이 변경되는 경우 서비스 내 공지 또는 개인정보 처리방침
          페이지를 통해 안내합니다.
        </p>
      </DocSection>

      <DocSection title="12. 문의">
        <p className="mb-2">
          개인정보에 관한 문의(열람·수정·삭제 요청 포함)는 아래 인스타그램 DM 으로
          보내주세요. 확인 후 빠르게 답변드립니다.
        </p>
        <ul className="list-disc pl-5">
          {SNS_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </DocSection>
    </DocPage>
  )
}
