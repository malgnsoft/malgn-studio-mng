# 기술 스택 · 레포 토폴로지

맑은스튜디오 관리 허브(`malgn-studio-mng`)의 스택과, 함께 관리하는 형제 레포 구성을 정리한다.

> 작성일: 2026-06-17

## 1. 관리 허브 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Nuxt 3 | `future.compatibilityVersion: 4`, `<script setup lang="ts">`, strict TS |
| UI | Nuxt UI v3 | Reka UI + Tailwind v4. 자체 컴포넌트 `App*`, Nuxt UI `U*`. `@nuxtjs/tailwindcss` 금지 |
| 콘텐츠 | @nuxt/content v3 | `docs/` 마크다운 → D1(`_content_docs`) **런타임 조회** |
| DB | Cloudflare D1 | SQLite 호환 엣지 DB |
| ORM | Drizzle ORM + drizzle-kit | 스키마 정본 `server/db/schema.ts`, 마이그레이션 `server/db/migrations/` |
| 첨부 | Cloudflare R2 | 이슈 이미지(`/api/uploads` 경유, 로그인 게이트) |
| 상태 | Pinia | 필요 시 |
| 배포 | Cloudflare Pages(Functions/SSR) | Nitro `cloudflare-pages` 프리셋 |
| 패키지 매니저 | pnpm | — |

**렌더링 전략**: 인증 게이트 때문에 **전 라우트 SSR**(프리렌더 끔). 문서·이력·WBS도 매 요청 SSR 하여 `server/middleware/auth.ts`가 세션을 검사한다. `@nuxt/content`는 정적 덤프가 아니라 D1에서 런타임 조회되므로 SSR 가능. 문서 덤프 인증 게이트(`/dump.docs.sql`→`/login`, `/__nuxt_content/**`→세션 401)는 `nuxt.config.ts` 주석 참조.

**데이터 정본 2종**
1. 구조화(진척·작업·회원·이슈) = **D1**
2. 문서/이력 = `docs/` **마크다운**(@nuxt/content)

### D1 스키마 엔티티

`board_meta`(프로젝트 메타) · `stage`(WBS 단계) · `task`(작업) · `wbs_item`(간트 항목) · `member`(참여자·SSO 연동) · `issue`(이슈/정책 게시판) · `issue_comment`(이슈 답글). 상세는 `server/db/schema.ts`.

## 2. 레포 토폴로지

이 레포는 **관리 허브**이고, 실제 서비스는 형제 레포 4종이 구현한다.

```
malgn-studio-mng  ← (이 레포) 프로젝트 관리 허브: 대시보드·WBS·이슈·문서·이력
   │  조망·관리
   ├── malgn-studio        사용자 스튜디오 앱
   ├── malgn-studio-admin  운영자 콘솔
   ├── malgn-studio-api    백엔드 + AI 생성 파이프라인
   └── malgn-studio-lms    학습 관리(LMS)
```

| 레포 | 역할 | 스택 방향(예정) |
|---|---|---|
| `malgn-studio` | 소스 업로드·생성 워크스페이스·산출물 편집·출처·검수·발행 | Nuxt 3 + Nuxt UI v3 |
| `malgn-studio-admin` | 회원·콘텐츠·권한·과금·사용량·스킬 택소노미 | Nuxt 3 + Nuxt UI v3 |
| `malgn-studio-api` | 인제스트·RAG·LLM 오케스트레이션·외부 미디어 API | 백엔드 + AI 파이프라인 |
| `malgn-studio-lms` | 코스·수강·진도·평가(xAPI/LRS) | LMS |

> 형제 레포 4종은 기획 시작 단계다. 스택·URL 확정 시 본 문서와 대시보드 바로가기를 갱신한다. 서비스 기획 정본은 `docs/planning/`(특히 `09-ARCHITECTURE.md`).
