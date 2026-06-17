# CLAUDE.md — 맑은스튜디오 관리 허브

이 레포(`malgn-studio-mng`)에서 작업할 때 Claude가 따르는 가이드다. 간결함을 우선한다.

## 1. 이 레포는 무엇인가

- **목적**: 맑은스튜디오 서비스를 구성하는 **형제 레포 4종의 개발을 조망·관리하는 프로젝트 관리 허브**(대시보드·WBS·주간작업·이슈·문서·작업이력·참여자). 서비스 자체 코드는 형제 레포에 있고, 이 레포는 그 진척·문서·이력·이슈를 모은다.
- **맑은스튜디오(서비스 한 줄 정의)**: 각종 자료(문서·텍스트·PPT·웹링크·영상)를 입력받아 **NotebookLM 수준**의 AI로 학습 콘텐츠(영상·오디오·슬라이드·커리큘럼·콘티·퀴즈·문제은행·요약)를 제작하는 통합 빌더.

### 형제 레포

| 레포 | 역할 |
|---|---|
| `malgn-studio` | 사용자 스튜디오 앱 — 소스 업로드·생성 워크스페이스·산출물 편집·출처·검수·발행 |
| `malgn-studio-admin` | 운영자 콘솔 — 회원·콘텐츠·권한·과금·사용량·스킬 택소노미 |
| `malgn-studio-api` | 백엔드 + AI 생성 파이프라인(인제스트·RAG·LLM 오케스트레이션·외부 미디어 API) |
| `malgn-studio-lms` | 학습 관리 — 코스·수강·진도·평가(xAPI/LRS) |

## 2. 스택·구조

- **프레임워크**: Nuxt 3(`future.compatibilityVersion: 4`, `<script setup lang="ts">`, strict TS)
- **UI**: Nuxt UI v3(Reka UI + Tailwind v4)
- **콘텐츠**: `@nuxt/content` v3 — `docs/` 마크다운을 D1(`_content_docs`)에서 **런타임 조회**
- **DB/ORM**: Cloudflare **D1** + **Drizzle ORM** + `drizzle-kit`
- **첨부**: Cloudflare **R2**(이슈 이미지 — `/api/uploads` 경유, 로그인 게이트)
- **배포**: Cloudflare Pages(Functions/SSR), Nitro `cloudflare-pages` 프리셋
- **패키지 매니저**: pnpm

**렌더링**: 인증 게이트 때문에 **전 라우트 SSR**(프리렌더 끔). 문서·이력·WBS도 매 요청 SSR 하여 전역 미들웨어(`server/middleware/auth.ts`)가 세션을 검사한다. `/dump.docs.sql`·`/__nuxt_content/**` 비로그인 노출 차단(`nuxt.config.ts` 주석 참조).

**디렉터리**
- `app/` — 페이지·컴포넌트·레이아웃·composables·미들웨어(프론트엔드)
- `server/` — API 핸들러(`server/api/`)·미들웨어·D1 유틸·스키마(`server/db/`)
- `docs/` — 마크다운 정본(기획·운영 문서·작업 이력). `@nuxt/content` 소스

**D1 스키마 엔티티**(`server/db/schema.ts`): `board_meta` · `stage` · `task` · `wbs_item` · `member` · `issue` · `issue_comment`.

## 3. 메뉴(IA)

대시보드 `/` → WBS `/wbs` → 주간 작업 `/weekly` → 이슈 `/issues` → 문서 `/docs` → 작업 이력 `/history` → 참여자 `/members`(관리자 전용).

## 4. 컨벤션

- TypeScript `any` 금지(strict).
- 자체 컴포넌트 `App*`, Nuxt UI 컴포넌트 `U*`. `@nuxtjs/tailwindcss` 추가 설치 금지(Nuxt UI가 Tailwind v4 내장).
- 색·간격·radius는 **디자인 토큰** 사용(하드코딩 지양). 정본은 `docs/DESIGN.md` + `app/assets/css/main.css`.
- 날짜는 ISO(`YYYY-MM-DD` / ISO8601).
- 커밋·푸시·배포는 **사용자가 명시 요청할 때만**. 기본은 분석·구현·검증까지.

## 5. 정본 포인터

- **서비스 기획**: `docs/planning/`(00~12, 큰 그림은 `docs/planning/00-OVERVIEW.md`)
- **에이전트팀**: `docs/AGENT_TEAM.md`
- **스캐폴드 스펙**: `docs/superpowers/specs/`
- **스택·디자인**: `docs/STACK.md` · `docs/DESIGN.md`
- **작업 이력**: `docs/history/`

## 6. 배포

Cloudflare Pages + D1. `wrangler.toml`의 `database_id`는 현재 **플레이스홀더**(`PLACEHOLDER_RUN_WRANGLER_D1_CREATE`)다.

```
wrangler d1 create malgn-studio-project   # 실제 database_id 확보 후 wrangler.toml 갱신
pnpm db:apply                              # 마이그레이션 적용(--remote)
pnpm db:seed                               # 단계 시드
```

배포는 사용자 명시 요청 시에만 진행한다.
