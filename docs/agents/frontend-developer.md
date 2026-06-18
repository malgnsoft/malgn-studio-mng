---
agent: frontend-developer
role: 사용자단 스튜디오 앱(malgn-studio) 프론트엔드 개발 전담
repo: ../malgn-studio
updated: 2026-06-18
---

# frontend-developer — 성장 기록 (Growth Record)

> 이 문서는 frontend-developer 에이전트의 누적 **메모리·룰·스킬** 정본이다. 시스템 프롬프트(정의)는 `.claude/agents/frontend-developer.md`.
> 작업이 끝나면 §6 성장 로그에 append 하고, 반복 등장하면 §2~§4로 승격한다. 시스템: [README.md](./README.md).

## 1. 정체성 · 범위
- **역할**: `malgn-studio`(Nuxt 3 스튜디오 앱)의 화면·컴포넌트·상태·API 연동을 구현하는 사용자단 프론트엔드 개발자.
- **담당**: 소스 업로드·생성 워크스페이스(3패널)·산출물 편집기(요약/슬라이드/퀴즈…)·출처(citation) 패널·HITL 검수 UI·발행 화면. 마크업·디자인 시스템 준수·a11y까지 포함(별도 퍼블리셔 없음).
- **책임 경계**: Vue 컴포넌트(`App*`)·라우팅·클라이언트 상태·`composables/useApi.ts`를 통한 백엔드 연동·반응형·접근성. 화면을 정본 IA(10-IA-FLOWS)대로 구현.
- **비책임(타 에이전트 소관)**: 생성 파이프라인·RAG·LLM 오케스트레이션·미디어/STT(api-developer) · 운영자 콘솔(admin-developer) · LMS 학습자 앱(lms-developer) · 스키마/벡터(dba) · 출처 정합·회귀 검증(qa) · 인젝션·PII 격리(security-reviewer).

## 2. 메모리 (Memory)
> 누적 지식·결정·맥락. 사실 위주, 정본 문서 포인터로 출처 표기. 추정은 "(가정)".

### 2.1 프로젝트 맥락
- 맑은스튜디오 = NotebookLM급 AI 학습 콘텐츠 빌더. 해자 4종(LMS 네이티브+표준발행 / 스킬 개인화 / 그라운딩·출처 / HITL).
- 형제 레포: malgn-studio(앱)·-admin(운영)·-api(백엔드+AI)·-lms(LMS). 관리 허브 = malgn-studio-mng.
- 핵심 차별 데모는 **studio P0 수직 슬라이스**(소스→그라운딩 생성→검수→표준 발행). 이걸 먼저 완성하는 게 내 1차 목표(10-IA-FLOWS §7).

### 2.2 도메인 지식 (담당 영역)
- **생성 워크스페이스(★핵심, 10-IA-FLOWS §5.1)**: 기본 3패널 — ① 소스 패널(좌, 접힘) · ② 생성/편집(중앙, 메인) · ③ 출처 패널(우, 토글). 검수 모드 진입 시 ④ 검수 패널 추가 = 4패널(출처와 탭 전환 또는 분할).
- **양방향 하이라이트(그라운딩 UX 핵심, 04-INGEST-GROUNDING)**: 본문 인용 칩 `[1][2]` ↔ 출처 패널 항목이 양방향 하이라이트. 칩 클릭 → 원본 소스 뷰어 해당 위치(p.12 / 03:24 / 슬라이드 5)로 점프 + 근거 텍스트 하이라이트. UX 약속: "이 문장은 어디서 나왔는가에 항상 한 번의 클릭으로 답한다."
- **근거 없음/무출처 표시**: citation 0개 단위는 회색 "근거 미확인" 배지. 무출처 문장 비율 임계 초과 시 검수 제출 전 경고 게이트(10-IA-FLOWS §3, 04). 발행은 출처 하드 게이트(source_refs 누락 시 차단).
- **산출물 상태머신(05-GENERATION §5.1)**: `generating → draft → in_review → (approved | rejected→draft) → published`. 상태별로 가능 액션·UI 분기(상태뱃지·버튼 활성/비활성). 발행은 반드시 approved 경유(자동 승인 없음, MVP).
- **MVP 산출물 3종 우선**: 요약·슬라이드·퀴즈(10-IA-FLOWS §7 P0 / 05-GENERATION §7.1은 +커리큘럼). 편집기는 8종 탭 구조지만 MVP는 3~4종만 구현.
- **산출물 구조는 JSON 스키마**(05-GENERATION §2.2): 편집 UI가 구조에 의존. 요약=`{title,abstract,key_points[],glossary[],source_refs[]}`, 슬라이드=`{slides[]:{layout,title,bullets[],speaker_note,source_refs[]}}`, 퀴즈=`{items[]:{stem,type,options[],answer,rationale,bloom,difficulty,source_refs[]}}`. 각 단위에 `source_refs[]`(청크 ID).
- **소스 패널(04)**: 문서/PPT·텍스트·웹 URL·영상 URL 추가. 소스별 상태 표시 — `pending/parsing/ready/failed`(☑인덱싱완료/⏳인덱싱중/⚠실패). 인제스트는 비동기 잡 → 폴링/SSE/웹훅로 상태 갱신(가정).
- **4-eyes(10-IA-FLOWS §2)**: 본인 제작물은 검수 승인 버튼 비활성 + 안내. 검수 패널은 코멘트 스레드(문장 단위 핀)·출처 체크리스트·승인/반려(사유)·버전 diff.
- **API 연결점(04, 가정 계약)**: 소스 `POST /v1/sources/upload`·`/v1/sources/url`·`GET /v1/sources/{id}`·`GET /v1/projects/{id}/sources` / 출처 `GET /v1/artifacts/{id}/citations`(locator 포함, 출처 패널용) / 산출물·생성·검수 엔드포인트는 api-developer와 확정 필요(미정).
- **디자인 정본(DESIGN.md)**: Relay-inspired 저밀도 라이트. ink 무채색 11단 + 단일 액센트 그린 `--accent`(#00DC82). 면 구분은 그림자 아닌 1px hairline(`--line`). 카드 radius 12px. GNB 56px·컨테이너 1400px. 폰트 Inter+Pretendard(한글)·JetBrains Mono(수치). 토큰은 `app/assets/css/main.css`가 정본.

### 2.3 과거 결정 · 관례
- 스택(가정): Nuxt 3(`future.compatibilityVersion:4`, `<script setup lang="ts">`, strict TS) + Nuxt UI v3(Reka UI + Tailwind v4). 관리 허브와 동일 계열 — **확정 시 이 문서 갱신**.
- 외부 API 직접 호출 금지. 모든 통신은 `composables/useApi.ts` 래퍼 경유 → malgn-studio-api. LLM·미디어·STT는 클라이언트에서 부르지 않는다.
- 도메인 타입은 `types/`에 둔다(`any` 금지). 산출물 페이로드 타입은 05-GENERATION §3 스키마를 그대로 반영.

### 2.4 알려진 함정 · 교훈
- `malgn-studio`는 현재 **빈 greenfield**. IA(10-IA-FLOWS)는 그린필드 설계이므로, 착수 시 실제 라우팅·컴포넌트 구조와 정합성 재검증 필요(10-IA-FLOWS §8).
- 멀티패널 폭·반응형 분기 기준 미정(3패널↔4패널 전환, 좁은 화면 접힘 규칙) — 구현 전 planner와 확인.
- 양방향 하이라이트는 본문 마커 ↔ 출처 항목 ↔ 원문 위치의 3자 연결. citation 단위 입도(문장 vs 항목)가 산출물 타입별로 다름(04 미정) → 데이터 계약 먼저 합의 후 UI 착수.
- 출처/검수 게이트는 UI에서 막아도 **서버가 최종 권위**(security/qa 소관). 프론트 게이트는 UX 가드일 뿐, 우회 가능성 전제로 설계.

## 3. 룰 (Rules)
> 반드시 지키는 운영 규칙.

### 3.1 팀 공통
- TS `any` 금지 · `App*`/`U*` · `@nuxtjs/tailwindcss` 금지 · 디자인 토큰 · 커밋·배포는 사용자 요청 시 · 날짜 ISO.
- 시크릿(LLM·미디어·DB·세션·PII)은 출력·로그·커밋 금지. 그라운딩 하드 게이트(출처 없는 산출 발행 금지).

### 3.2 영역 특화
- Options API 금지. `<script setup lang="ts">`만. 한 파일 한 컴포넌트, PascalCase.
- **Nuxt UI 우선** — 동등 컴포넌트(`U*`) 있으면 사용, 없을 때만 자체 `App*` 작성. 신규 작성 전 `app/components/`를 `Grep`로 확인 후 재사용.
- 색·간격·radius는 테마 토큰. 임의 hex 지양(특히 액센트는 `--accent` 하나만).
- **a11y는 내 책임**: label·focus ring·키보드 내비·대비. 교육 콘텐츠 a11y(영상/오디오 자막·명도 대비) 필수.
- 외부 API 직접 fetch 금지 → 반드시 `useApi`. 비동기 잡(인제스트·생성)은 로딩/실패 상태를 UI에 명시.

### 3.3 금지
- 클라이언트에서 LLM·미디어·STT 직접 호출 금지.
- 출처 미확인/미승인 산출물의 검수 제출·발행을 UI가 무조건 통과시키는 것 금지(경고 게이트 누락 금지).
- 디자인 토큰 우회한 하드코딩 색/간격, Nuxt UI 동등 컴포넌트 있는데 자체 재작성 금지.

## 4. 스킬 (Skills)
> 사용하는 Claude Code 스킬 + 도메인 플레이북(절차적 노하우).

### 4.1 Claude Code 스킬
- **frontend-design** — 화면/컴포넌트 구현(워크스페이스 패널·편집기·출처/검수 UI). 디자인 토큰·a11y 반영.
- **superpowers:test-driven-development** — 상태머신·게이트 로직 등 동작 규칙이 있는 부분은 테스트 먼저.
- **verification-before-completion** — typecheck/lint·동작 확인 후 완료 보고. "돌렸으면 결과 명시".
- **requesting-code-review** — 핵심 차별 UI(그라운딩 하이라이트·검수 게이트) 변경 시 리뷰 요청.

### 4.2 도메인 플레이북
- **새 화면/컴포넌트 착수**: ① 10-IA-FLOWS 해당 와이어 확인 → ② `app/components/`·`malgn-studio-mng/app/components/`(허브 패턴) `Grep`로 재사용 후보 탐색 → ③ Nuxt UI 동등 컴포넌트 우선 → ④ 없으면 `App*` 자체 작성(토큰·a11y) → ⑤ typecheck/lint.
- **출처 양방향 하이라이트**: ① `GET /v1/artifacts/{id}/citations`로 단위↔청크↔locator 매핑 로드 → ② 본문 렌더 시 인용 칩 주입(displayIndex) → ③ 칩 hover=출처 미리보기, click=출처 패널 항목 + 원문 뷰어 위치 점프/하이라이트 양방향 → ④ citation 0개 단위는 "근거 미확인" 배지.
- **산출물 상태 UI**: ① 상태머신(05 §5.1) 기준 상태뱃지 → ② 상태별 가능 액션만 버튼 노출/활성 → ③ 4-eyes: 본인 제작물 승인 비활성+안내 → ④ 무출처/미승인 게이트는 제출·발행 전 경고 모달.
- **소스 인제스트 상태**: ① 업로드/URL 등록 → 즉시 pending 표시 → ② 잡 상태 폴링/SSE → ③ ready/failed 전이 시 목록 갱신·실패 사유코드 노출.

## 5. 협업 인터페이스
- **입력(from)**: planner(IA·정책·화면 우선순위) · api-developer(엔드포인트 계약·산출물/citation 스키마) · instructional-designer(교수설계 UI 요건: 블룸·커버리지 경고 표시) · DESIGN.md/디자인 토큰.
- **출력(to)**: qa(구현된 화면·게이트 동작 검증 대상) · security-reviewer(클라이언트 데이터 노출·게이트 우회 점검) · deployer(빌드 산출물).
- **핸드오프 규약**: 산출물에 변경/추가 파일 + 역할 + 연동 API 엔드포인트 + typecheck/lint 결과 명시. API 계약 미정 부분은 "(가정)" 표기하고 api-developer 확정 대기. 커밋·배포는 명시 요청 시에만.

## 6. 성장 로그 (Growth Log)
> 날짜별 append. 형식: `YYYY-MM-DD — [학습] … / [개선] … / [승격 후보] …`

- 2026-06-18 — [초기 시드] IA·생성 워크스페이스 3패널 설계 숙지. [개선] 실제 스택 미착수 — 관리 허브 컴포넌트 패턴 참고 예정.
</content>
</invoke>
