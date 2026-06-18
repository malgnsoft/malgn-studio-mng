# 에이전트 성장 기록 시스템 (Agent Growth Records)

맑은스튜디오 에이전트 팀의 **성장 정본**이다. 각 에이전트의 누적 **메모리·룰·스킬**을 한 파일에 기록하고,
세션을 거듭하며 보강해 에이전트를 **성장**시킨다.

## 두 종류의 파일 — 정의 vs 성장 기록

| 종류 | 위치 | 역할 | 누가 로드 |
|---|---|---|---|
| **정의(Definition)** | `.claude/agents/<name>.md` | 에이전트의 시스템 프롬프트(정체성·도구·즉시 적용 규칙). 짧고 안정적. | Claude Code가 세션 시작 시 자동 로드 |
| **성장 기록(Growth Record)** | `docs/agents/<name>.md` | 누적 메모리·룰·스킬·성장 로그. 길고 계속 자란다. | 사람·에이전트가 필요 시 Read |

> 정의는 "지금 이 에이전트가 누구인가", 성장 기록은 "이 에이전트가 무엇을 알고/배웠고/어떻게 더 잘할 것인가".
> 성장 기록에서 **안정화된 지식은 정의로 승격**(요약·반영)한다. 정의는 가볍게 유지한다.

## 성장 루프 (어떻게 키우나)

```
작업 수행 → 회고(무엇을 배웠나/무엇이 막혔나)
   → 해당 에이전트 성장 기록 §6 성장 로그에 append
   → 반복 등장하면 §2 메모리 / §3 룰 / §4 스킬 로 승격
   → 충분히 안정화되면 .claude/agents/<name>.md 정의에 1~2줄 반영
```

- **growth-keeper** 에이전트가 이 루프를 운영한다(회고 수집 → 승격 → 정합 유지). 정의: `.claude/agents/growth-keeper.md`.
- 각 에이전트는 자기 작업이 끝나면 성장 로그에 **날짜·학습·다음 개선**을 남긴다.

## 기록 구조 (템플릿)

정본 템플릿: [_TEMPLATE.md](./_TEMPLATE.md). 모든 성장 기록은 다음 6절을 가진다.

1. **정체성·범위** — 역할/담당 레포/책임 경계/비책임
2. **메모리(Memory)** — 누적 지식·결정·맥락·함정·교훈 (사실 위주, 출처 표기)
3. **룰(Rules)** — 반드시 지키는 운영 규칙 (공통+영역 특화+금지)
4. **스킬(Skills)** — 사용하는 Claude Code 스킬 + 도메인 플레이북(절차)
5. **협업 인터페이스** — 입력/출력/핸드오프 규약
6. **성장 로그(Growth Log)** — 날짜별 append (학습·개선)

## 팀 명부 (11)

| 에이전트 | 역할 | 정의 | 성장 기록 |
|---|---|---|---|
| planner | 기획 정본·정책 | [def](../../.claude/agents/planner.md) | [rec](./planner.md) |
| instructional-designer | 교수설계(ID) 정렬·학습 품질 기준 ⟵ 신규 | [def](../../.claude/agents/instructional-designer.md) | [rec](./instructional-designer.md) |
| api-developer | 백엔드 + AI 생성 파이프라인 | [def](../../.claude/agents/api-developer.md) | [rec](./api-developer.md) |
| frontend-developer | 스튜디오 앱 | [def](../../.claude/agents/frontend-developer.md) | [rec](./frontend-developer.md) |
| admin-developer | 운영자 콘솔 | [def](../../.claude/agents/admin-developer.md) | [rec](./admin-developer.md) |
| lms-developer | LMS | [def](../../.claude/agents/lms-developer.md) | [rec](./lms-developer.md) |
| dba | 스키마·마이그레이션·벡터 | [def](../../.claude/agents/dba.md) | [rec](./dba.md) |
| qa | 검증·회귀·출처 정합 | [def](../../.claude/agents/qa.md) | [rec](./qa.md) |
| security-reviewer | 보안·PII·격리·인젝션 | [def](../../.claude/agents/security-reviewer.md) | [rec](./security-reviewer.md) |
| deployer | 배포/DevOps | [def](../../.claude/agents/deployer.md) | [rec](./deployer.md) |
| growth-keeper | 팀 성장 기록 큐레이션 ⟵ 신규 | [def](../../.claude/agents/growth-keeper.md) | [rec](./growth-keeper.md) |

> 표준 작업 흐름·역할 경계는 [../AGENT_TEAM.md](../AGENT_TEAM.md) 참조. 서비스 기획 정본은 [../planning/](../planning/).
</content>
