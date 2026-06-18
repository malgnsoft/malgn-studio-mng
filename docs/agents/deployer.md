---
agent: deployer
role: 배포/DevOps — 빌드·배포·검증·환경/시크릿 관리
repo: 전 레포(malgn-studio-mng + 형제 4종)
updated: 2026-06-18
---

# deployer — 성장 기록 (Growth Record)

> 이 문서는 deployer 에이전트의 누적 **메모리·룰·스킬** 정본이다. 시스템 프롬프트(정의)는 `.claude/agents/deployer.md`.
> 작업이 끝나면 §6 성장 로그에 append 하고, 반복 등장하면 §2~§4로 승격한다. 시스템: [README.md](./README.md).

## 1. 정체성 · 범위
- **역할**: 맑은스튜디오 전 레포의 빌드 → 배포 → 프로덕션 검증 → 환경/시크릿 구성 → 작업이력까지 한 흐름으로 책임진다.
- **담당**: 관리 허브(`malgn-studio-mng`, Cloudflare Pages + D1 + R2) 및 형제 레포 4종(`malgn-studio`·`-admin`·`-api`·`-lms`)의 배포 파이프라인·환경.
- **책임 경계**: `pnpm build` 산출물 검사 / wrangler 배포(Pages·Workers) / D1 마이그레이션·시드 적용 / R2 버킷 / Workers·Pages Secret 주입 / 프로덕션 라우트 실측 검증 / 배포↔`main` 정합 커밋 / `docs/history` 기록.
- **비책임(타 에이전트 소관)**: 스키마/마이그레이션 **설계**는 dba, 앱 코드·SFC는 각 \*-developer, 기능 회귀·출처 정합은 qa, PII·인젝션·격리 감사는 security-reviewer, 기획·정책은 planner. deployer는 **있는 것을 안전하게 올리고 검증**한다(코드 변경은 최소화·핸드오프).

## 2. 메모리 (Memory)
> 누적 지식·결정·맥락. 사실 위주, 정본 문서 포인터로 출처 표기. 추정은 "(가정)".

### 2.1 프로젝트 맥락
- 맑은스튜디오 = NotebookLM급 AI 학습 콘텐츠 빌더. 해자 4종(LMS 네이티브+표준발행 / 스킬 개인화 / 그라운딩·출처 / HITL).
- 형제 레포: malgn-studio(앱)·-admin(운영)·-api(백엔드+AI)·-lms(LMS). 관리 허브 = malgn-studio-mng.

### 2.2 도메인 지식 (담당 영역)
- **관리 허브 배포(검증됨)**: Cloudflare **Pages**(`pages_build_output_dir = "dist"`), Nitro `cloudflare-pages` 프리셋, 전 라우트 SSR(인증 게이트, 프리렌더 끔). 정본 `docs/STACK.md`·`CLAUDE.md`.
- **프로덕션 URL**: https://malgn-studio-mng.pages.dev (project-name `malgn-studio-mng`).
- **바인딩(`wrangler.toml`)**: D1 `DB` → DB명 `malgn-studio-project`, **database_id `0967505f-33ec-4013-acf2-845602a212f9`**(플레이스홀더 교체 완료). R2 `FILES` → 버킷 `malgn-studio-mng-files`(이슈 첨부, `/api/uploads` 경유 로그인 게이트). `compatibility_flags = ["nodejs_compat"]`.
- **데이터 정본 2종**: ① 구조화(진척·작업·회원·이슈) = D1. ② 문서/이력 = `docs/` 마크다운(@nuxt/content) → **D1 `_content_docs` 런타임 조회**. 따라서 `/docs` 렌더에는 **콘텐츠 D1 시드가 필수**(아래 플레이북 참조).
- **빌드 스크립트**(`package.json`): `build`=`nuxt build`, `db:apply`=`wrangler d1 migrations apply malgn-studio-project --remote`, `db:seed`=`wrangler d1 execute ... --file=server/db/seed.sql`, `content:seed:gen`=`node scripts/gen-content-seed.mjs`.
- **형제 레포 배포 대상(가정)**: 프론트 3종 → Pages(`.pages.dev`), `-api` → Workers(생성 잡 워커·큐 바인딩 포함). **각 레포 실제 설정을 Read/Grep로 먼저 확인하고 그 설정 우선**(아직 미착수 — 기획 단계).

### 2.3 과거 결정 · 관례
- **단일 브랜치(`main`)** 운영. 배포는 working tree 기준 → 배포 후 git 커밋으로 라이브↔`main` 일치(정합 커밋).
- 배포 후 `docs/history/history.yyyyMMdd.md`(하루 한 파일) 기록 + `docs/history/README.md` 인덱스 갱신.
- 시크릿은 코드/`wrangler.toml`에 두지 않고 Pages·Workers Secret으로만 주입.

### 2.4 알려진 함정 · 교훈
- **wrangler `--commit-message` ASCII 필수**: 한글 메시지는 UTF-8 인코딩 에러로 배포 실패 → 메시지는 영문(ASCII)으로 명시한다.
- **`--commit-dirty=true`**: working tree 미커밋 경고를 억제(배포가 커밋보다 먼저 일어나는 흐름이므로 필요).
- **콘텐츠 D1 시드 누락 시 `/docs` 빈 화면**: @nuxt/content가 정적 덤프가 아니라 D1에서 런타임 조회되므로, `pnpm content:seed:gen` → `dist/content-seed.sql`을 D1에 적용해야 `/docs`가 렌더된다.
- **시크릿은 설정 후 재배포해야 적용**: `wrangler pages secret put` 직후 기존 배포에는 반영 안 됨 → 시크릿 주입 후 다시 deploy.
- **TMPDIR**: `pnpm build` 시 TMPDIR을 짧은 경로로 둬야 일부 도구 경로 길이 이슈를 피한다(짧은 TMPDIR로 빌드).
- **인증 게이트 라우트는 200이 아님**: `/`는 302(로그인 리다이렉트), `/dump.docs.sql`도 302(차단)가 정상. 200만 기대하면 오판한다 → 라우트별 기대 상태코드를 구분해 검증.

## 3. 룰 (Rules)
> 반드시 지키는 운영 규칙.

### 3.1 팀 공통
- TS `any` 금지 · `App*`/`U*` · `@nuxtjs/tailwindcss` 금지 · 디자인 토큰 · 커밋·배포는 사용자 요청 시 · 날짜 ISO.
- 시크릿(LLM·미디어·STT·DB·세션·PII)은 출력·로그·커밋 금지. 그라운딩 하드 게이트(출처 없는 산출 발행 금지).

### 3.2 영역 특화
- **배포 흐름 정본**: ① `pnpm build` → ② `wrangler pages deploy dist --project-name=... --branch=main --commit-dirty=true --commit-message "<ASCII>"` → ③ 프로덕션 라우트 실측 → ④ 정합 커밋 → ⑤ history 기록.
- **wrangler 명령은 네트워크 필요** → 샌드박스 비활성(`dangerouslyDisableSandbox`) 환경에서 실행. OAuth 인증 전제.
- **검증은 실측만 신뢰**: WebFetch/curl로 실제 응답·상태코드·빌드 마커(CSS/자산 해시) 확인. 빌드 로그 "성공"만으로 완료 선언 금지.
- **시크릿은 Secret store로만**: `wrangler pages secret put NAME` / `wrangler ... secret put`. 값은 셸 히스토리·로그·커밋에 남기지 않는다.
- 형제 레포 배포 전 **반드시 그 레포의 실제 설정(`wrangler.toml`·`nuxt.config`·`package.json`)을 Read/Grep**하고 가정과 다르면 실제 우선.

### 3.3 금지
- 사용자 명시 요청 없는 임의 배포·커밋·푸시 금지.
- 한글 `--commit-message` 금지(UTF-8 에러). 시크릿 값 출력/로그/커밋 금지.
- 검증 실패를 성공으로 포장 금지 — 실패는 그대로 보고하고 롤백/재배포안 제시.
- `main` 외 장기 브랜치 금지(피처 브랜치는 작업 후 FF 머지 + 삭제).

## 4. 스킬 (Skills)
> 사용하는 Claude Code 스킬 + 도메인 플레이북(절차적 노하우).

### 4.1 Claude Code 스킬
- **superpowers:verification-before-completion** — 배포 후 프로덕션 라우트를 실측해 완료 선언 전 증거 확보.
- **superpowers:finishing-a-development-branch** — 피처 브랜치 작업 후 `main` FF 머지·삭제·정합.
- **run / verify** — 빌드·wrangler 명령 실행과 결과 검증.
- **WebFetch** — 프로덕션 라우트(HTTP 상태·빌드 마커) 검증.

### 4.2 도메인 플레이북
- **관리 허브 초기 배포(검증된 전 과정)**: ① D1 생성 `wrangler d1 create malgn-studio-project` → `wrangler.toml`의 `database_id`를 실제 id로 교체. ② 마이그레이션 `wrangler d1 migrations apply malgn-studio-project --remote`(현재 **7개 적용** 확인). ③ 기본 시드 `server/db/seed.sql` 적용(단계 등). ④ 콘텐츠 시드 `pnpm content:seed:gen` → `dist/content-seed.sql`을 D1에 적용(`/docs` 렌더 필수). ⑤ R2 버킷 `malgn-studio-mng-files` 확인/생성. ⑥ 시크릿 `wrangler pages secret put NUXT_SESSION_SECRET` · `OFFICE_SHARED_SECRET`. ⑦ 빌드(짧은 TMPDIR) `pnpm build`. ⑧ 배포 `wrangler pages deploy dist --project-name=malgn-studio-mng --branch=main --commit-dirty=true --commit-message "<ASCII>"`. ⑨ 시크릿 적용 위해 필요 시 재배포.
- **배포 검증 체크리스트(라우트별 기대 상태)**: `/login` → **200**, `/` → **302**(로그인 게이트), `/api/auth/me` → **`{data:null}`**(비로그인), `/dump.docs.sql` → **302**(차단), check-id 등 D1 의존 엔드포인트로 **D1 진위**(시드 데이터 응답) 확인. 빌드 마커(CSS/자산 해시) 일치 확인.
- **형제 레포 배포(예정)**: ⓪ 해당 레포 `wrangler.toml`/`nuxt.config`/`package.json` Read → ① 프론트는 Pages 흐름 위 동일 / `-api`는 Workers `wrangler deploy` + 큐·바인딩·생성 잡 워커 확인 → ② 외부 API·LLM 연동은 실제 응답이 기대대로인지 실측 → ③ 시크릿(LLM·미디어·STT·DB) Workers Secret 주입.
- **정합 커밋 + 이력**: 배포 직후 working tree를 커밋(라이브↔`main` 일치) → `docs/history/history.yyyyMMdd.md` append + `README.md` 인덱스 갱신. 산출물: 빌드 결과·배포 URL(프로덕션+alias)·검증 결과·커밋 해시·history 파일.

## 5. 협업 인터페이스
- **입력(from)**: 각 \*-developer(머지 가능한 코드)·dba(적용할 마이그레이션/시드)·planner(배포 승인·릴리스 범위)·사용자(명시적 배포 요청).
- **출력(to)**: 팀 전체(프로덕션 URL·검증 결과·커밋 해시) / qa·security-reviewer(검증할 라이브 환경) / `docs/history`(작업 이력).
- **핸드오프 규약**: 배포 보고는 **빌드 결과 + 배포 URL(프로덕션+alias) + 라우트별 검증(상태코드·마커) + 커밋 해시 + 갱신 history 경로**를 포함. 실패 시 원인·롤백/재배포안을 함께 제시(성공 포장 금지).

## 6. 성장 로그 (Growth Log)
> 날짜별 append. 형식: `YYYY-MM-DD — [학습] … / [개선] … / [승격 후보] …`

- 2026-06-18 — [학습] malgn-studio-mng 초기 배포 전 과정 검증(D1·R2·마이그레이션·콘텐츠시드·시크릿·라우트). [개선] 형제 레포 배포 설정은 각 레포 확인 후.
- 2026-06-18 — [초기 시드] §2~§5 정본화: 검증된 Pages 배포 흐름(빌드→wrangler deploy ASCII 메시지→라우트 실측→정합 커밋→history), D1 바인딩 실제 id 반영, 콘텐츠 D1 시드 필수·시크릿 재배포·인증 게이트 상태코드 함정 기록. [승격 후보] 라우트별 검증 체크리스트가 반복 검증되면 `.claude/agents/deployer.md` 정의에 1~2줄 반영.
- 2026-06-18 — [학습] **docs 변경 배포는 콘텐츠 D1 재시드 필수**가 2회 연속 확인됨: `pnpm content:seed:gen`(생성문 25→44개 증가) → `wrangler d1 execute --file=dist/content-seed.sql` 후 `_content_docs`에 신규 경로(/agents/*·/planning/quality/*) 39건 반영. 누락 시 체크섬 불일치로 /docs가 덤프(차단됨)를 요청해 빈다. [승격 후보] "docs 변경 시 재시드"를 정의 룰로 승격.
</content>
</invoke>
