# 맑은스튜디오 프로젝트 관리 허브 — 스캐폴드 설계 스펙

> `malgn-noti-mng`(맑은 메시징 프로젝트 관리 허브)의 **구조·메뉴·스키마·디자인·재사용 엔진 코드**를 그대로 가져오고,
> **브랜드·문구·시드 데이터·기획 문서 등 "내용"은 맑은스튜디오(AI 학습 콘텐츠 제작 플랫폼)에 맞게** 새로 채운 관리 허브를
> `/Users/dotype/Projects/malgn-studio-mng`에 구축한다.
>
> 정본 참조: 원본 블루프린트 `malgn-noti-mng/docs/PROJECT_MANAGEMENT_BLUEPRINT.md`, 에이전트팀 `malgn-noti-mng/docs/AGENT_TEAM.md`.
>
> **작성일**: 2026-06-17

---

## 1. 대상 도메인 — 맑은스튜디오 (정본)

**한 줄 정의**: 각종 자료(문서·텍스트·PPT·홈페이지 링크·영상)를 입력받아 **NotebookLM 수준**으로 학습 콘텐츠를 **AI로 제작**하는 플랫폼.

**입력 소스**: 문서 · 텍스트 · PPT · 웹/홈페이지 링크 · 영상.

**AI 산출물(학습 콘텐츠)**: 학습 영상 · 학습 오디오 · 슬라이드 · 커리큘럼 · 콘티(스토리보드) · 퀴즈 · 문제은행 · 학습 요약.

**시스템 구성(형제 레포)**:
| 레포 | 역할 |
|---|---|
| `malgn-studio` | 사용자단 스튜디오 앱(소스 업로드·AI 산출물 생성·편집·내보내기) |
| `malgn-studio-admin` | 운영자 콘솔(회원·콘텐츠·권한·과금 관리) |
| `malgn-studio-api` | 백엔드 + AI 생성 파이프라인(인제스트·LLM·미디어 합성·외부 모델 호출) |
| `malgn-studio-lms` | 학습 관리 시스템 연동(산출물 배포·수강·진도) |

> 위 4개 형제 레포는 현재 비어 있음(기획 시작 단계). 이 관리 허브가 그 개발을 조망·관리한다.

---

## 2. 치환 토큰

| 토큰 | 원본 값 | 맑은스튜디오 값 |
|---|---|---|
| 앱/레포명 | `malgn-noti-mng` | `malgn-studio-mng` |
| 표시명(PROJECT) | 맑은노티(맑은 메시징) | **맑은스튜디오** |
| GNB 브랜드 | 맑은 · message · 프로젝트 관리 | 맑은 · **studio** · 프로젝트 관리 |
| 앱 타이틀(head) | 맑은노티 관리 | **맑은스튜디오 관리** |
| 설명(meta) | 맑은노티 프로젝트 문서·작업 이력 관리 | **맑은스튜디오(AI 학습 콘텐츠 제작) 프로젝트 문서·작업 이력 관리** |
| D1 이름 | `malgn-noti-project` | `malgn-studio-project` |
| D1 database_id | `3c8c37e3-…` | **플레이스홀더**(`PLACEHOLDER_RUN_WRANGLER_D1_CREATE`) — `wrangler d1 create malgn-studio-project` 후 채움 |
| R2 버킷 | `malgn-noti-mng-files` | `malgn-studio-mng-files` |
| 푸터 카피 | 맑은노티 … 작업 이력 | **맑은스튜디오 프로젝트 문서·작업 이력** |
| 상위 시스템(SSO) | 맑은오피스 | **맑은오피스** (유지 — 동일 SSO 발급자) |

> ⚠️ **"맑은노티/맑은 메시징/message/노티/NHN·토스·NICE" 등 원본 도메인 문구가 코드·문서·시드에 남으면 안 됨.** 모든 산출물은 grep 점검(§8) 통과 필수.

---

## 3. 아키텍처 — 원본과 동일(재사용)

- **프레임워크**: Nuxt 3 (`future.compatibilityVersion: 4`, `<script setup lang="ts">`, strict TS)
- **UI**: Nuxt UI v3 (Reka UI + Tailwind v4). `@nuxtjs/tailwindcss` 설치 금지. 자체 컴포넌트 `App*`, Nuxt UI `U*`.
- **콘텐츠**: `@nuxt/content` v3 + `better-sqlite3`
- **DB/ORM**: Cloudflare **D1** + **Drizzle ORM** + `drizzle-kit`
- **첨부**: Cloudflare **R2**(이슈 이미지 업로드 — `/api/uploads` 경유, 로그인 게이트)
- **상태**: Pinia(필요 시)
- **배포**: Cloudflare Pages(Functions/SSR), Nitro `cloudflare-pages` 프리셋
- **패키지 매니저**: pnpm

**렌더링 전략**: 인증 게이트 때문에 **전 라우트 SSR**(프리렌더 끔). `@nuxt/content`는 D1(`_content_docs`)에서 런타임 조회. 문서 덤프 인증 게이트(`/dump.docs.sql`→`/login`, `/__nuxt_content/**`→세션 401) 동일 적용.

**데이터 정본 2종**: ① 구조화(진척·작업·회원·이슈) = D1, ② 문서/이력 = `docs/` 마크다운(@nuxt/content).

---

## 4. 메뉴(IA) — 원본과 동일

GNB(고정 56px): `[로고 맑은studio]` + 네비 + (우측) 회원명/로그아웃(비로그인 시 로그인).

순서: **대시보드 → WBS → 주간 작업 → 이슈 → 문서 → 작업 이력 → 참여자(관리자 전용)**
- 대시보드 `/` `i-lucide-layout-dashboard`
- WBS `/wbs` `i-lucide-gantt-chart`
- 주간 작업 `/weekly` `i-lucide-calendar-days`
- 이슈 `/issues` `i-lucide-message-square-warning`
- 문서 `/docs` `i-lucide-book-text`
- 작업 이력 `/history` `i-lucide-history`
- 참여자 `/members` `i-lucide-users` (`adminOnly` — 관리자만 노출)

---

## 5. 빌드 방식 (확정)

- **구조·설정·스키마·페이지 골격·브랜드/문구·docs·시드** → 맑은스튜디오로 **새로 작성**.
- **복잡한 재사용 엔진 코드**(WBS 간트 렌더링, 인증 암호 PBKDF2/HMAC, D1 유틸, 마크다운 렌더 등 도메인 무관 로직) → 원본에서 **이식·각색**(brand/문구만 치환). 0부터 재구현하지 않음.
- 시드 데이터는 맑은스튜디오 초기값(아래 §6) 또는 빈 상태. **원본 노티 데이터는 일절 이식하지 않음.**

---

## 6. 맑은스튜디오 "내용" 정의 (시드·문구 정본)

### 6.1 대시보드
- **목표 카드**: "다양한 소스(문서·PPT·웹·영상)로부터 **NotebookLM급 AI**로 학습 콘텐츠(영상·오디오·슬라이드·커리큘럼·콘티·퀴즈·문제은행·요약)를 제작하는 스튜디오".
  - 핵심 키워드 칩: `AI 콘텐츠 생성` · `멀티 소스 인제스트` · `미디어 합성` · `LMS 연동`.
- **방향 카드(불릿)**: ① 멀티소스 인제스트·정규화 ② 생성 품질(정확도·교육적 구조) ③ 산출물 다양성(8종) ④ LMS 배포 연동.
- **바로가기**: `malgn-studio`(스튜디오 앱) · `malgn-studio-admin`(운영자) · `malgn-studio-api`(API) · `malgn-studio-lms`(LMS) — URL은 플레이스홀더(`#`)로 두고 확정 시 교체.

### 6.2 WBS 단계(stage) — 초기 제안 (planner 에이전트가 정본화·가중치 확정)
1. **소스 인제스트·정규화** — 문서/PPT/웹/영상 → 텍스트·청크·임베딩
2. **AI 생성 엔진** — 요약·커리큘럼·콘티·슬라이드·퀴즈·문제은행 생성(LLM 파이프라인)
3. **미디어 합성** — 학습 영상·오디오(TTS/렌더)·슬라이드 내보내기
4. **스튜디오 UX (`malgn-studio`)** — 소스 업로드·산출물 편집·내보내기
5. **운영자 콘솔 (`malgn-studio-admin`)** — 회원·콘텐츠·권한·과금
6. **LMS 연동 (`malgn-studio-lms`)** — 산출물 배포·수강·진도
7. **인프라·QA·배포** — (가중치 0 가능, 표시용)

> 가중치 합 100 권장. WBS 초기 작업(`wbs_item`)은 **빈 상태로 시작**(화면 CRUD로 채움)하거나 단계별 대표 작업 1~2건만 시드.

### 6.3 이슈 게시판
- `type` enum: `policy|issue|notice|discussion` (한글 라벨: 정책·이슈·공지·논의) — 원본 유지.
- `status` enum: `open|in_progress|resolved|hold` — 원본 유지.
- 본문 마크다운 + R2 이미지 첨부 — 원본 유지.

### 6.4 docs/ 문서 트리 (맑은스튜디오 기획 정본으로 교체)
- `PROJECT_MANAGEMENT_BLUEPRINT.md` — 블루프린트(맑은스튜디오 버전으로 토큰 치환).
- `STACK.md` · `DESIGN.md` · `FRONTEND.md` — 스택/디자인/프론트 가이드(맑은스튜디오 브랜드).
- `AGENT_TEAM.md` — §7 에이전트팀(맑은스튜디오 레포 매핑).
- `WBS.md` · `PAGES.md` — WBS 정의 + 화면 인덱스.
- `MEMBERSHIP.md` — 회원/SSO 정책(상위 시스템 맑은오피스 유지).
- `pages/` — 맑은스튜디오 도메인 기획 문서: `INGEST.md`(소스 인제스트), `GENERATION.md`(AI 생성 엔진), `MEDIA.md`(미디어 합성), `STUDIO.md`(스튜디오 UX), `LMS.md`(LMS 연동), `ADMIN.md`(운영자) 등 — **골격(목적·플로우·상태·API/DB 연결점 헤더)만**, 상세는 planner 후속.
- `history/` — `history.20260617.md`(스캐폴드 구축 이력) 1건 + `README.md` 인덱스. **원본 노티 이력은 이식 안 함.**

> ⚠️ NICE 본인인증(`NICE_AUTH.md`)·결제/과금(`BILLING`·`CARDS`·`CREDIT`·`CONTRACT`)·SMS발송 등 **맑은노티 고유 도메인 문서는 가져오지 않음**.

---

## 7. 파일 인벤토리 (생성 대상) — 웨이브/에이전트 배정

원본 파일 트리를 그대로(브랜드/내용 치환) 재현. `.DS_Store`·`node_modules`·`.nuxt`·`dist`·`.wrangler`·`.data`·`project-mng-starter.zip`은 제외.

### W1 — 기반 (3 에이전트, 병렬)
**infra**(설정/구성):
- 루트: `package.json`(name 치환·스크립트 D1명 치환) · `nuxt.config.ts` · `wrangler.toml` · `content.config.ts` · `drizzle.config.ts` · `tsconfig.json` · `eslint.config.mjs` · `.npmrc` · `.editorconfig` · `.gitignore`
- `app/app.vue` · `app/app.config.ts`
- `scripts/gen-content-seed.mjs`
- `.claude/settings.json`(원본 참고, 시크릿 제외)
- `git init`(레포 초기화)

**schema**(D1/시드):
- `server/db/schema.ts`(원본 동일 구조: `board_meta`·`stage`·`task`·`wbs_item`·`member`·`issue`·`issue_comment` 등) · `server/db/migrations/**`(drizzle 재생성 또는 원본 이식) · `server/db/seed.sql`(맑은스튜디오 단계 시드, §6.2) · `server/db/issue.sql`
- `server/utils/db.ts`(이식)

**design**(디자인/레이아웃/브랜드):
- `app/assets/css/main.css`(Relay-inspired 토큰 이식) · `app/assets/css/prose.css`(이식)
- `app/layouts/default.vue`(브랜드 "맑은studio"·nav·푸터 치환)
- `app/components/AppLogoMark.vue`(로고 마크 — studio 브랜드)

### W2 — 기능 (4 에이전트, 병렬; W1 기반 의존)
**auth**(회원 시스템):
- `server/utils/auth.ts`·`members.ts`(이식: PBKDF2 100k·HMAC 세션) · `server/api/auth/*`(check-id·signup·login·logout·me·sso) · `server/api/account/*` · `server/api/integration/office/upsert.post.ts` · `server/api/members.get.ts`·`members/[id].patch|delete.ts`
- `app/pages/login.vue`·`signup/index.vue`·`signup/complete.vue`·`account.vue`·`members.vue`
- `app/composables/useAuth.ts` · `app/plugins/auth.ts` · `app/middleware/01.require-auth.global.ts` · `app/utils/extractError.ts`
- `server/middleware/auth.ts`·`no-cache.ts`

**core-pages**(대시보드·WBS·주간):
- `app/pages/index.vue`(대시보드 — §6.1 내용) · `wbs.vue`(간트 이식) · `weekly.vue`
- `app/components/AppWbsOverview.vue` · `app/composables/useWbs.ts` · `app/utils/wbsData.ts`(단계 메타 §6.2)
- `server/api/wbs.get.ts`·`wbs.post.ts`·`wbs/[id].patch|delete.ts` · `server/api/board`(있으면)

**issues**(이슈 게시판):
- `app/pages/issues/index.vue`·`new.vue`·`[id]/index.vue`·`[id]/edit.vue`
- `app/components/AppIssueForm.vue`·`AppMarkdownEditor.vue` · `app/utils/issueMeta.ts`·`markdown.ts`
- `server/api/issues/**`(index get/post·[id] get/patch/delete·comments·uploads) · `server/utils/issues.ts`·`issueComments.ts`·`uploads.ts` · `server/api/uploads/*`

**docs-content**(문서/이력):
- `app/pages/docs/index.vue`·`docs/[...slug].vue`·`history/index.vue` · `app/composables/useDocs.ts` · `server/api/docs.get.ts`·`doc.get.ts`
- `docs/**` 맑은스튜디오 문서 트리(§6.4)

### W3 — 마감 (순차)
- `.claude/agents/*.md`(맑은스튜디오 에이전트팀 — §아래) · `docs/AGENT_TEAM.md`
- `CLAUDE.md`(맑은스튜디오 목적·스택·구조·컨벤션) · `README.md`(있으면)
- 정합 점검: `pnpm install` → `pnpm typecheck`(또는 lint) → grep 잔여 "노티" 스캔(§8).

### 맑은스튜디오 에이전트팀 (.claude/agents) — 레포 매핑 치환
원본 8 에이전트를 맑은스튜디오 레포로 매핑하여 정의:
- `planner` — 기획(docs)
- `api-developer` — `malgn-studio-api`(백엔드 + **AI 생성 파이프라인**: 인제스트·LLM·미디어 합성·외부 모델)
- `frontend-developer` — `malgn-studio`(스튜디오 앱)
- `admin-developer` — `malgn-studio-admin`(운영자 콘솔)
- **`lms-developer`** — `malgn-studio-lms`(LMS 연동) *(원본에 없던 신규 — 형제 레포 반영)*
- `dba` — D1/스키마
- `qa` · `security-reviewer` · `deployer` — 전 레포

---

## 8. 검증 (완료 기준)

1. **구조 일치**: 위 §7 파일이 모두 생성됨(원본 트리와 1:1, 제외 목록 제외).
2. **타입/린트**: `pnpm install` 후 `pnpm typecheck`(또는 `pnpm lint`) 통과 — 이식 코드가 컴파일됨.
3. **브랜드 치환 완료**: 다음 grep이 **0건**(코드·docs·시드):
   - `grep -ri "노티\|맑은노티\|맑은 메시징\|message\b\|malgn-noti" --include=*.ts --include=*.vue --include=*.md --include=*.sql --include=*.toml --include=*.json` → 의도된 잔존(예: `i-lucide-message-square-warning` 아이콘명)만 허용, 도메인 문구는 0.
4. **시드 정합**: `seed.sql`의 단계가 §6.2와 일치, 날짜는 ISO(`YYYY-MM-DD`).
5. **에이전트팀**: `.claude/agents/*.md` 9종 + `docs/AGENT_TEAM.md`가 맑은스튜디오 레포로 매핑됨.
6. **시크릿 없음**: 원본의 실제 `database_id`·시크릿·`.data`·`.wrangler`·빌드 산출물 미이식.

> **배포는 범위 밖**(별도 요청 시): `wrangler d1 create malgn-studio-project`로 실제 id 확보 → `wrangler.toml`·`package.json` 갱신 → 마이그레이션 적용 → Pages 배포.

---

## 9. 진행(에이전트 팀) 절차

- **W1**(infra·schema·design) 병렬 → 완료 후
- **W2**(auth·core-pages·issues·docs-content) 병렬 → 완료 후
- **W3**(agent-team·CLAUDE·정합 점검) 순차.
- 각 에이전트는 원본 해당 파일을 읽어 **이식하되 브랜드/문구/시드만 맑은스튜디오로 치환**. 도메인 신규 문구는 본 스펙 §6을 정본으로 사용.
- 커밋·푸시·배포는 사용자 명시 요청 시에만.

---

## 10. 알려진 한계·후속

- D1 `database_id`는 플레이스홀더 — 실제 생성 전까지 원격 D1 동작 불가(dev 인메모리/시드 폴백으로 화면 확인).
- `docs/pages/*` 기획 문서는 **골격만** — 상세 정책·상태 모델·API/DB 연결점은 planner 후속.
- WBS 단계·가중치는 초기 제안 — planner가 맑은스튜디오 실제 마일스톤으로 정본화.
- 형제 레포 4종 URL·실제 스펙 미확정 — 바로가기/연동은 플레이스홀더.
- AI 생성 파이프라인(LLM·미디어 합성) 상세는 `malgn-studio-api` 영역 — 본 허브는 조망·관리만.
</content>
