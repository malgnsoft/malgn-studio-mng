# 작업 이력 — 2026-06-17

**한 줄 요약**: 맑은스튜디오 관리 허브를 신규 스캐폴드하고, 경쟁분석을 반영한 서비스 기획 패키지(00~12)와 Claude Code 에이전트팀(9종)을 구축했다.

---

## 1. 경쟁분석 반영 서비스 기획 패키지 (00~12)

`docs/planning/`에 맑은스튜디오 서비스 기획 정본 13문서를 작성했다.

- **00 개요·비전** — 한 줄 정의, 4대 해자(① LMS 네이티브 발행+표준 SCORM/xAPI ② 스킬 기반 개인화 ③ 소스 그라운딩·출처표기 ④ 사람 검수 HITL), MVP 가치 체인.
- **01 경쟁 환경 분석**(입력 정본) — 글로벌·국내 경쟁사 및 시사점. "생성은 평준화, 통합 빌더는 빈자리, 속도가 경쟁력".
- **02 차별화 전략** / **03 기능 정의·범위**(MVP/후속 매트릭스).
- **04 인제스트·그라운딩** / **05 AI 생성 엔진(8종 산출물 + HITL)** / **06 미디어(외부 API)**.
- **07 스킬·개인화** / **08 발행·LMS(SCORM/xAPI)** / **09 기술 아키텍처(형제 레포·데이터 모델)**.
- **10 IA·플로우** / **11 로드맵·WBS(9단계, 가중치 합 100)** / **12 NFR**.

## 2. 에이전트팀 9종 구축

`docs/AGENT_TEAM.md` + `.claude/agents/*.md`에 형제 레포로 매핑한 서브에이전트팀을 정의했다.

- planner(기획) · api-developer(`-api`: 백엔드 + AI 생성 파이프라인) · frontend-developer(`malgn-studio`) · admin-developer(`-admin`) · **lms-developer(`-lms`, 신규)** · dba(D1/스키마) · qa · security-reviewer · deployer(전 레포).
- 역할 경계: 외부 API/모델·키는 `-api`에만, 프론트 풀스택(SFC), 스키마는 dba가, 검증 두 렌즈(qa·security). 퍼블리셔·별도 API 분석가는 두지 않음.

## 3. 원본 이식·리브랜딩 스캐폴드

`malgn-noti-mng`(메시징 관리 허브)의 구조·메뉴·스키마·디자인·재사용 엔진 코드를 이식하고, 브랜드·문구·시드·기획 문서 등 "내용"은 맑은스튜디오로 새로 채웠다. 스펙: `docs/superpowers/specs/2026-06-17-malgn-studio-mng-scaffold-design.md`.

- **스택**: Nuxt 3 + Nuxt UI v3 + @nuxt/content + Cloudflare Pages/D1 + Drizzle + R2. 전 라우트 SSR(인증 게이트).
- **메뉴(IA)**: 대시보드 · WBS · 주간작업 · 이슈 · 문서 · 작업이력 · 참여자(관리자).
- **D1 스키마**: `board_meta` · `stage` · `task` · `wbs_item` · `member` · `issue` · `issue_comment`.
- **디자인**: Relay-inspired 저밀도 라이트(ink 11단 + 그린 단일 액센트, 1px hairline, 카드 radius 12px) — 토큰 계승, 브랜드만 치환.
- **리브랜딩**: 원본 도메인 문구(메시징 고유) 제거, 단계 시드·문구를 맑은스튜디오로 교체. D1 `database_id`는 플레이스홀더.

## 4. 산출물

- `docs/planning/` 서비스 기획 패키지 00~12 + 인덱스 `README.md`.
- `docs/AGENT_TEAM.md` + `.claude/agents/*.md`(9종).
- 앱 스캐폴드: `app/`(페이지·컴포넌트·레이아웃) · `server/`(API·미들웨어·D1 스키마/시드) · 루트 설정(`nuxt.config.ts`·`wrangler.toml`·`package.json` 등).
- 루트·운영 문서: `CLAUDE.md` · `docs/STACK.md` · `docs/DESIGN.md` · `docs/history/`(인덱스 + 본 이력).

## 5. 다음 단계

- **실제 D1 생성**: `wrangler d1 create malgn-studio-project` → `wrangler.toml`·`package.json`의 `database_id`/이름 갱신.
- **배포**: 마이그레이션 적용(`pnpm db:apply`)·시드(`pnpm db:seed`) → Cloudflare Pages 배포(사용자 명시 요청 시).
- **형제 레포 착수**: `malgn-studio`·`-admin`·`-api`·`-lms` 개발 시작, 대시보드 바로가기 URL 확정·교체.
- planner가 WBS 단계·가중치 정본화 및 `docs/pages/*` 도메인 기획 상세화.
