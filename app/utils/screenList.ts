// 화면 진척 데이터 — docs/planning/10-IA-FLOWS.md(IA 정본)에서 도출한 화면 골격(읽기전용).
// 각 페이지(P) 아래 모달을 modals[]로 중첩, 모달에도 화면ID(부모ID-P0n) 배정.
// 형제 앱이 그린필드라 design·publish·dev·test 모두 false에서 시작(상태는 D1 screen_status에 저장·머지).

export interface ScreenItem {
  id: string; name: string; group: string
  design: boolean; publish: boolean; dev: boolean; test: boolean
  mockupUrl?: string; devUrl?: string
  modals?: ScreenItem[]
}
export interface ScreenArea { key: string; label: string; source: string; screens: ScreenItem[]; pending?: boolean }

export const screenAreas: ScreenArea[] = [
  {
    key: 'studio',
    label: '스튜디오 앱 (malgn-studio)',
    source: '기획 IA · 10-IA-FLOWS',
    screens: [
      // ── 그룹 01: 온보딩·인증 ──
      {
        id: 'S-ST01-0101-001', name: '로그인', group: '온보딩·인증',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-ST01-0101-002', name: '조직 선택', group: '온보딩·인증',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 02: 대시보드 ──
      {
        id: 'S-ST01-0201-001', name: '대시보드(내 프로젝트·검수 큐·사용량)', group: '대시보드',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 03: 프로젝트·소스 ──
      {
        id: 'S-ST01-0301-001', name: '프로젝트 목록(필터·검색)', group: '프로젝트·소스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-ST01-0301-001-P01', name: '새 프로젝트 생성 모달', group: '프로젝트·소스',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-ST01-0301-002', name: '소스 패널(업로드·연결·인덱싱 상태)', group: '프로젝트·소스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-ST01-0301-002-P01', name: '소스 업로드 모달(문서·PPT·텍스트)', group: '프로젝트·소스',
            design: false, publish: false, dev: false, test: false,
          },
          {
            id: 'S-ST01-0301-002-P02', name: 'URL 연결 모달(웹·영상)', group: '프로젝트·소스',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-ST01-0301-003', name: '소스 상세(인덱싱 진행·청크 미리보기)', group: '프로젝트·소스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 04: 생성 워크스페이스 ──
      {
        id: 'S-ST01-0401-001', name: '생성 워크스페이스(3패널: 소스·생성·출처)', group: '생성 워크스페이스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-ST01-0401-001-P01', name: '생성 옵션 모달(산출물 선택·난이도·길이·톤)', group: '생성 워크스페이스',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-ST01-0401-002', name: '산출물 편집기 — 요약', group: '생성 워크스페이스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-ST01-0401-003', name: '산출물 편집기 — 슬라이드', group: '생성 워크스페이스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-ST01-0401-004', name: '산출물 편집기 — 퀴즈', group: '생성 워크스페이스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-ST01-0401-005', name: '출처 패널(citation·무출처 플래그)', group: '생성 워크스페이스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-ST01-0401-006', name: '스킬 태깅 탭(택소노미 검색·매핑)', group: '생성 워크스페이스',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 05: 검수·발행 ──
      {
        id: 'S-ST01-0501-001', name: '검수(HITL) 화면(미리보기·코멘트·승인/반려)', group: '검수·발행',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-ST01-0501-001-P01', name: '반려 사유 입력 모달', group: '검수·발행',
            design: false, publish: false, dev: false, test: false,
          },
          {
            id: 'S-ST01-0501-001-P02', name: '버전 비교(diff) 모달', group: '검수·발행',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-ST01-0501-002', name: '발행 화면(포맷 선택·패키징 검증)', group: '검수·발행',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-ST01-0501-002-P01', name: '발행 설정 모달(SCORM/xAPI·포함 산출물)', group: '검수·발행',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-ST01-0501-003', name: '발행 이력', group: '검수·발행',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 06: 계정·설정 ──
      {
        id: 'S-ST01-0601-001', name: '프로젝트 설정(목표 학습자·기본 스킬·협업자)', group: '계정·설정',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-ST01-0601-002', name: '내 계정·환경설정', group: '계정·설정',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
    ],
  },
  {
    key: 'admin',
    label: '운영자 콘솔 (malgn-studio-admin)',
    source: '기획 IA · 10-IA-FLOWS',
    screens: [
      // ── 그룹 01: 대시보드 ──
      {
        id: 'S-AD01-0101-001', name: '운영 대시보드(사용량·발행·과금 요약)', group: '대시보드',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-AD01-0101-002', name: '관리자 로그인', group: '대시보드',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 02: 회원·권한 ──
      {
        id: 'S-AD01-0201-001', name: '회원 관리(계정·조직·상태)', group: '회원·권한',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-AD01-0201-001-P01', name: '회원 초대 모달', group: '회원·권한',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-AD01-0201-002', name: '권한 관리(역할 정의·매핑·4-eyes 정책)', group: '회원·권한',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-AD01-0201-002-P01', name: '권한 편집 모달(역할-사용자 매핑)', group: '회원·권한',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      // ── 그룹 03: 콘텐츠·검수 ──
      {
        id: 'S-AD01-0301-001', name: '콘텐츠 관리(발행물·버전·배포 상태·회수)', group: '콘텐츠·검수',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-AD01-0301-002', name: '배포 관리(코스 편성·대상 그룹·공개 일정)', group: '콘텐츠·검수',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-AD01-0301-002-P01', name: '배포 설정 모달(대상 그룹·일정)', group: '콘텐츠·검수',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      // ── 그룹 04: 과금·사용량 ──
      {
        id: 'S-AD01-0401-001', name: '과금 관리(요금제·크레딧·청구·결제 이력)', group: '과금·사용량',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-AD01-0401-002', name: '사용량 관리(크레딧 소비·벤더 비용·조직 한도)', group: '과금·사용량',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 05: 스킬 택소노미 ──
      {
        id: 'S-AD01-0501-001', name: '스킬 택소노미 관리(트리 CRUD·매핑 규칙)', group: '스킬 택소노미',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-AD01-0501-001-P01', name: '스킬 편집 모달(이름·코드·상하위·동의어)', group: '스킬 택소노미',
            design: false, publish: false, dev: false, test: false,
          },
          {
            id: 'S-AD01-0501-001-P02', name: '스킬 가져오기 모달(CSV)', group: '스킬 택소노미',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      // ── 그룹 06: 운영 설정 ──
      {
        id: 'S-AD01-0601-001', name: '운영 설정(미디어 벤더 연동·발행 정책·LRS)', group: '운영 설정',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
    ],
  },
  {
    key: 'lms',
    label: 'LMS (malgn-studio-lms)',
    source: '기획 IA · 10-IA-FLOWS',
    screens: [
      // ── 그룹 01: 인증 ──
      {
        id: 'S-LM01-0101-001', name: '학습자 로그인', group: '인증',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 02: 카탈로그·수강 ──
      {
        id: 'S-LM01-0201-001', name: '코스 카탈로그(검색·스킬 필터·추천)', group: '카탈로그·수강',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      {
        id: 'S-LM01-0201-002', name: '코스 상세(개요·커리큘럼·선수 스킬·등록)', group: '카탈로그·수강',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-LM01-0201-002-P01', name: '수강 등록 확인 모달', group: '카탈로그·수강',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      // ── 그룹 03: 학습 플레이어 ──
      {
        id: 'S-LM01-0301-001', name: '수강 플레이어(콘텐츠 뷰어·커리큘럼·진도)', group: '학습 플레이어',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-LM01-0301-001-P01', name: '출처 보기 모달(citation)', group: '학습 플레이어',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-LM01-0301-002', name: '콘텐츠 뷰어(영상·오디오·슬라이드·요약)', group: '학습 플레이어',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 04: 진도·평가 ──
      {
        id: 'S-LM01-0401-001', name: '평가 응시(퀴즈·문제은행·채점·피드백)', group: '진도·평가',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
        modals: [
          {
            id: 'S-LM01-0401-001-P01', name: '응시 제출 확인 모달', group: '진도·평가',
            design: false, publish: false, dev: false, test: false,
          },
        ],
      },
      {
        id: 'S-LM01-0401-002', name: '내 학습(수강 이력·진도·이수증·스킬 성취)', group: '진도·평가',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
      // ── 그룹 05: 마이페이지 ──
      {
        id: 'S-LM01-0501-001', name: '마이페이지(프로필·설정)', group: '마이페이지',
        design: false, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '',
      },
    ],
  },
]
