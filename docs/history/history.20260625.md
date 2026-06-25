# 작업 이력 — 2026-06-25

**한 줄 요약**: 쏠쏠(solsol-mng) 관리 사이트의 최신 기능인 **화면 진척(/screens)** 을 맑은스튜디오 허브로 이식하고(검증페이지 제외), 허브 폭을 1200px로 통일하며 GNB에서 대시보드 메뉴를 제거(로고→대시보드)했다.

---

## 1. 화면 진척(/screens) 기능 이식 — 검증페이지 제외

solsol-mng와 전수 비교해 신규 기능(화면 진척·검증) 중 **화면 진척만** 이식하고 **검증페이지(`/validation`)는 제외**했다(`116b751`).

- **페이지** `/screens`: 영역(앱)별 화면 목록 + 디자인·퍼블리싱·개발·테스트 진척, 상태 클릭 토글(D1 저장), 목업/개발 URL ✎ 편집, 모달 중첩 표시.
- **API**: `GET /api/screens`(정본 골격 + D1 상태 머지) · `PATCH /api/screens/:id`(토글·링크, 세션 필수).
- **DB**: `screen_status` 테이블 + 마이그레이션 `0006`(화면ID별 상태/링크 오버라이드). 유틸 `screenStatus.ts`(D1 + dev 인메모리 폴백).
- **화면 목록 정본** `app/utils/screenList.ts`: solsol/검증 콘텐츠가 아니라 **맑은스튜디오 IA(10-IA-FLOWS)에서 새로 도출** — studio/admin/lms 3영역, 36페이지·17모달, 모두 그린필드 시작(전 단계 false).
- **GNB**: 네비에 '화면'(`i-lucide-layout-list`) 추가. 검증 메뉴는 두지 않음.

## 2. 허브 폭 1200px 통일 + GNB 대시보드 제거

solsol 최신 IA에 맞춰 허브 UI를 정리했다(`718a3fb`).

- **폭 1200px**: GNB(`gnb-inner`) + 허브 콘텐츠 페이지 9곳(`max-width: 1080px → 1200px`) — 대시보드·WBS·주간작업·이슈(목록/상세)·문서·작업이력·참여자. 화면은 이미 1200px. (로그인·가입·계정·이슈 작성/수정 등 폼·인증 페이지는 의도된 좁은 폭 유지.)
- **대시보드 메뉴 제거**: GNB nav를 WBS·주간작업·이슈·문서·작업이력·화면·참여자(관리자)로 정리. **대시보드는 로고 클릭(NuxtLink to="/")으로 이동**.

## 3. /screens 페이지명 변경

`/screens` 페이지 제목을 "화면 진척" → **"화면"** 으로 변경(h1 + `useHead` 타이틀)했다(`35ec529`). GNB 라벨과 일치.

## 4. 산출물

- 프로덕션: https://malgn-studio-mng.pages.dev/screens (studio/admin/lms 화면 진척).
- 신규/변경: `app/pages/screens.vue` · `app/utils/screenList.ts` · `server/api/screens/*` · `server/utils/screenStatus.ts` · `server/db/schema.ts`(screenStatus) · `server/db/migrations/0006_screen_status.sql` · `app/layouts/default.vue`(폭·nav) + 허브 페이지 8종(폭).
- D1: 마이그레이션 `0006` 적용(`screen_status` 테이블).
- 커밋: `116b751`·`718a3fb`·`35ec529`(+ 본 이력).

## 5. 다음 단계

- 화면 진척 초기 상태 입력(디자인 착수 시 토글·목업/개발 링크).
- 형제 레포 P0 착수(`malgn-studio`·`-api`·`-admin`·`-lms`).
- (선택) WBS 9단계 배포 로드맵을 7~12월 일정으로 간트에 배치.
</content>
