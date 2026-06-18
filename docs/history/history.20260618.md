# 작업 이력 — 2026-06-18

**한 줄 요약**: 맑은스튜디오 관리 허브를 Cloudflare에 **실배포**하고(첫 관리자 부트스트랩 포함), 에이전트 **성장 기록 시스템**(신규 2종 포함 11종)과 **교수설계 품질 정본**을 구축했다.

---

## 1. Cloudflare 실배포

관리 허브를 프로덕션에 올렸다 — **https://malgn-studio-mng.pages.dev**.

- **D1**: `wrangler d1 create malgn-studio-project` → `database_id`(`0967505f-…a212f9`)로 `wrangler.toml` 갱신·커밋.
- **R2**: 버킷 `malgn-studio-mng-files` 생성.
- **마이그레이션**: `wrangler d1 migrations apply --remote` → 7개 전부 적용(board_meta·stage·task·wbs_item·member·issue·issue_comment).
- **시드**: `seed.sql`(9단계 + board_meta + 대표작업) + **콘텐츠 D1 시드**(`pnpm content:seed:gen` → `dist/content-seed.sql`, `/docs` 렌더용).
- **시크릿**: `NUXT_SESSION_SECRET`·`OFFICE_SHARED_SECRET` 설정(설정 후 재배포해야 적용).
- **검증(실측)**: `/login` 200 · `/`·`/docs` 302(인증 게이트) · `/api/auth/me` `{"data":null}` · `/dump.docs.sql` 302(덤프 차단) · `check-id`로 D1 진위 확인.

## 2. 첫 관리자 부트스트랩 + 자동승인

- 가입은 `status='pending'`(관리자 승인 필요)인데 최초엔 승인할 관리자가 없는 딜레마 → **최초 가입자를 자동 `active`+`admin`으로 생성**하도록 `server/api/auth/signup.post.ts` 변경(부트스트랩).
- 기존 `dotype`(김도형)은 변경 배포 전 가입돼 `pending`·`member`였으므로 D1에서 직접 `active`+`admin` 승격. → `dotype`으로 관리자 로그인 가능.

## 3. 에이전트 성장 기록 시스템 + 신규 2종

`docs/agents/`에 각 에이전트의 누적 **메모리·룰·스킬**을 기록하는 성장 시스템을 구축했다(나중에 에이전트를 성장시키는 정본).

- **2종 파일 구분**: 정의(`.claude/agents/<name>.md`, 시스템 프롬프트) ↔ 성장 기록(`docs/agents/<name>.md`, 누적·확장).
- **성장 루프**: 작업→회고→성장 로그 append→반복 검증 시 메모리/룰/스킬 승격→안정화 시 정의 반영.
- **신규 에이전트 2종**: `instructional-designer`(교수설계 정렬 — 핵심 차별화) · `growth-keeper`(성장 기록 큐레이션, 메타). 팀 **9→11종**.
- 11종 성장 기록을 **각 에이전트가 직접 작성**(팀 병렬 투입). `docs/agents/README.md`(시스템) + `_TEMPLATE.md`(6절 구조).

## 4. 교수설계 품질 정본

신규 `instructional-designer`를 본업에 투입해 `docs/planning/quality/` 5문서를 작성했다.

- **01 학습목표·블룸** / **02 목표-평가 정합 매트릭스** / **03 산출물 8종 품질 루브릭** / **04 HITL 검수 체크리스트** + README.
- 핵심: 정확성·출처는 전 루브릭 **하드 게이트**(출처 없는 산출 발행 차단), 블룸 L5~6은 HITL 채점 분기.

## 5. 산출물

- 프로덕션 배포: https://malgn-studio-mng.pages.dev (D1 `malgn-studio-project` 라이브, 회원 1명 dotype/admin).
- `server/api/auth/signup.post.ts`(최초 가입자 자동 관리자).
- `docs/agents/`(성장 시스템 + 11 기록) · `.claude/agents/`(신규 2종) · `docs/AGENT_TEAM.md`(11종).
- `docs/planning/quality/`(교수설계 품질 정본 5문서).
- 커밋: `a9c3512`·`71a97ec`·`ccc0436`·`24acd14` (+ 본 이력).

## 6. 다음 단계

- **형제 레포 P0 착수**: `malgn-studio`(스튜디오 앱)·`-api`·`-admin`·`-lms` 개발 시작.
- api-developer가 품질 루브릭을 생성 프롬프트 설계에 반영(교수설계자 후속 협의).
- planner가 블룸 정합 규칙·stale 전파 수준 확정, `docs/pages/*` 도메인 상세화.
- growth-keeper로 세션 회고 수집·승격 루프 가동.
</content>
