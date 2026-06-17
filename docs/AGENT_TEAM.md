# 에이전트팀 — 맑은스튜디오

맑은스튜디오(AI 학습 콘텐츠 빌더) 프로젝트를 함께 개발하는 **Claude Code 서브에이전트팀** 정의 정본입니다.
각 에이전트는 `malgn-studio-mng/.claude/agents/<name>.md`에 정의되어 있으며, 이 프로젝트에서
`Agent` 툴의 `subagent_type` 또는 description 자동 매칭으로 스폰됩니다.

> 서비스 기획 정본은 [planning/](./planning/), 큰 그림은 [planning/00-OVERVIEW.md](./planning/00-OVERVIEW.md) 참조.

---

## 팀 구성 (9)

| 에이전트 | 역할 | 담당 레포 | 정의 |
| --- | --- | --- | --- |
| **planner** | 기획자 — 도메인 기획·정책·플로우 정본화 | `malgn-studio-mng/docs` | [planner.md](../.claude/agents/planner.md) |
| **api-developer** | 백엔드 + **AI 생성 파이프라인**(인제스트·RAG·LLM 오케스트레이션·외부 미디어 API) | `malgn-studio-api` | [api-developer.md](../.claude/agents/api-developer.md) |
| **frontend-developer** | 사용자단 스튜디오 앱(소스·생성·출처·검수·발행) + 마크업·디자인 시스템 | `malgn-studio` | [frontend-developer.md](../.claude/agents/frontend-developer.md) |
| **admin-developer** | 운영자 콘솔(회원·콘텐츠·권한·과금·스킬 택소노미) + RBAC | `malgn-studio-admin` | [admin-developer.md](../.claude/agents/admin-developer.md) |
| **lms-developer** | LMS(코스·수강·진도·평가·xAPI/LRS) + 발행 콘텐츠 수신 | `malgn-studio-lms` | [lms-developer.md](../.claude/agents/lms-developer.md) |
| **dba** | DBA — 스키마·마이그레이션·인덱스·벡터 정합 | 스튜디오 데이터 저장소 | [dba.md](../.claude/agents/dba.md) |
| **qa** | QA — 검증·테스트·회귀·생성품질/출처 정합·결함 보고 | 전 레포 | [qa.md](../.claude/agents/qa.md) |
| **security-reviewer** | 보안·개인정보 — 키·PII·업로드 격리·프롬프트 인젝션·테넌트 격리 렌즈 | 전 레포 | [security-reviewer.md](../.claude/agents/security-reviewer.md) |
| **deployer** | 배포/DevOps — 빌드·배포·검증·env/시크릿 | 전 레포 | [deployer.md](../.claude/agents/deployer.md) |

> **퍼블리셔는 두지 않는다.** Nuxt 3 Vue SFC에서는 `template`+`script`가 한 `.vue`에 함께 있어
> 마크업·디자인 시스템 준수·반응형·접근성은 각 프론트 개발자(frontend/admin/lms-developer)가 직접 책임진다.
>
> **별도 외부 API 연동 분석가도 두지 않는다.** LLM·미디어·임베딩 문서 분석부터 연동 구현까지 같은
> `malgn-studio-api` 영역이라 **api-developer**가 함께 책임진다.

---

## 표준 작업 흐름

```
planner ──(기획 정본·정책)──► api-developer (외부 API/모델 분석 + 백엔드·생성 파이프라인)
   │                                  │
   ├──► frontend-developer (스튜디오 앱: 소스·생성·출처·검수·발행)
   ├──► admin-developer    (운영자 콘솔: 회원·권한·과금·스킬)
   ├──► lms-developer      (LMS: 수강·진도·평가·xAPI)
   │                                  │
   └──► dba (스키마·마이그레이션·벡터 정합) ◄── api-developer (스키마 요청)
                                      │
                  ┌───────────────────┼───────────────────┐
                  ▼                   ▼                   ▼
                 qa          security-reviewer         deployer
          (동작·회귀·출처 정합)  (키·PII·격리·인젝션)   (빌드·배포·검증)
```

1. **planner**가 기획 정본(`docs/planning/*`·`docs/pages/<NAME>.md`)과 정책·상태 모델·API/DB 연결점을 정의.
2. **api-developer**가 LLM·미디어·임베딩·STT 문서를 직접 분석해 백엔드·생성 파이프라인 구현, 스키마 변경은 **dba**에 위임.
3. **frontend/admin/lms-developer**가 화면 동작·상태·연동과 마크업·디자인 시스템 준수까지 함께 담당(별도 퍼블리셔 없음).
4. **qa**(동작·회귀·출처 정합)와 **security-reviewer**(키·PII·격리·인젝션)가 서로 다른 렌즈로 검증하고 결함을 담당 에이전트에 회신.
5. **deployer**가 사용자 요청 시 빌드→배포→검증→커밋·작업이력까지 처리.

---

## 역할 경계 (책임 분리)

- **외부 API/모델**: `api-developer`가 분석부터 구현까지. 호출 코드·키는 **`malgn-studio-api`에만**. 프론트는 직접 호출 금지(LLM·미디어·STT).
- **프론트 풀스택**: `frontend/admin/lms-developer`가 상태·로직·데이터 **그리고** 마크업·디자인 시스템·반응형·접근성까지 한 사람이 책임(SFC 특성).
- **스키마**: 개발자가 직접 DDL 금지, `dba`가 마이그레이션 작성·적용. 큰 텍스트 컬럼·벡터 인덱스 정합 유의.
- **기획 vs 구현**: `planner`는 정책·플로우·정본 문서, 실제 코드/스키마는 개발자·DBA가.
- **검증 두 렌즈**: `qa`는 동작·회귀·테스트·**출처 정합**, `security-reviewer`는 위협·권한·키·PII·**업로드 격리·프롬프트 인젝션**. 둘 다 직접 수정하지 않고 결함을 재현 절차·심각도와 함께 담당자에게 회신.
- **배포**: `deployer`만 빌드·배포·env/시크릿을 다룬다. 배포는 사용자 명시 요청 시에만.

## 팀 공통 규칙

- TypeScript `any` 금지. 자체 컴포넌트 `App*`, Nuxt UI `U*`. `@nuxtjs/tailwindcss` 추가 설치 금지.
- 디자인 토큰 사용(하드코딩 지양). 교육 콘텐츠 접근성(자막·대비) 유의.
- **그라운딩 하드 게이트**: 모든 산출 단위에 출처(source_refs) 강제, 출처 없는 내용은 발행 차단.
- **provider 추상화**: LLM·미디어·임베딩은 인터페이스 뒤에 두어 벤더 교체 가능하게.
- 시크릿(LLM·미디어·STT·DB·세션 시크릿, 학습자 PII)은 출력·로그·커밋 금지.
- 커밋·푸시·배포는 **사용자가 명시 요청할 때만**. 기본은 분석·구현·검증까지.
- Claude/Anthropic 모델 작업 전 `claude-api` 스킬로 모델 id·파라미터 확인(기억으로 단정 금지).

---

## 스폰 방법

- **자동 위임**: 요청이 에이전트 description과 맞으면 자동 위임(예: "RAG 검색 백엔드" → api-developer, "LMS 수강 화면" → lms-developer, "배포" → deployer).
- **명시 호출**: `Agent` 툴에서 `subagent_type: "<name>"` 지정.
- ⚠️ 에이전트 정의는 **세션 시작 시 로드**된다. 새로 추가한 에이전트는 새 세션부터 "Available agent types"에 노출된다.
</content>
