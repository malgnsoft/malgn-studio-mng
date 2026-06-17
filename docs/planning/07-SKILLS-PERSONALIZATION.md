# 스킬·개인화 — 스킬 택소노미 + 적응형 + 생성형 변주

> 담당 해자: **② 스킬 기반 개인화**(스킬 택소노미 + 적응형 + 생성형 변주)
> 정본 참조: [01-COMPETITION.md](./01-COMPETITION.md) · 형제 문서: [05-GENERATION.md](./05-GENERATION.md)(생성 엔진), [08-PUBLISHING-LMS.md](./08-PUBLISHING-LMS.md)(발행)
> 기준 시점: 2026-06

---

## [목적]

- 스킬 택소노미(스킬맵)는 **엔터프라이즈 LXP의 기본 입장권**이다(Docebo·Cornerstone이 자동 태깅·스킬맵 기본 탑재, 정본 1.3/3-④). 미보유 시 개인화 자체가 성립하지 않으므로 **MVP 단계에서 최소 스킬맵 + 콘텐츠 스킬 태깅을 반드시 확보**한다.
- 다만 큐레이션 추천(스킬맵 기반 콘텐츠 매칭)은 경쟁사도 하는 평준화 영역. 우리의 차별점은 **"큐레이션 + 생성형 변주"** — 동일 학습목표를 학습자 수준·역할별로 **재생성**하는 것(정본 4. 차별화 표).
- 즉 본 문서의 전략 우선순위: ① 스킬맵·태깅으로 입장권 확보 → ② 스킬 갭으로 적응형 경로 → ③ **생성 엔진(05)과 결합한 생성형 변주로 격차 벌리기**.

### 차별화 포지셔닝 요약

| 축 | 경쟁사(Docebo·Cornerstone) | 맑은스튜디오 |
|---|---|---|
| 스킬맵 | 5만+ 스킬 그래프(Cornerstone) | 자체 코어 + 외부 표준 매핑(가정) |
| 자동 태깅 | 기존 콘텐츠에 스킬 태깅 | **생성 시점에 스킬 부여**(생성 메타와 결합) |
| 적응형 | 격차 식별 → 경로/난이도 조정 | 동일(입장권) + 그라운딩 신뢰성 |
| 개인화 출력 | 기존 콘텐츠 **큐레이션/추천** | **생성형 변주(재생성)** + 큐레이션 결합 |

---

## [접근]

1. **스킬 택소노미 = 코어 + 매핑 레이어**: 자체 코어 스킬맵을 정본으로 두고, 외부 표준(가정)을 동의어·매핑으로 연결. 외부 표준 종속 없이 시작하되 상호운용성 확보.
2. **태깅은 생성 파이프라인에 인라인**: 콘텐츠를 사후 분류하지 않고, AI 생성(05) 시점에 학습목표·소스로부터 스킬을 부여(후보 → HITL 검수 → 확정). 사후 일괄 태깅은 외부 import 콘텐츠용 보조 경로.
3. **스킬을 공통 키로**: 콘텐츠·학습자·경로가 모두 `skill_id`를 참조 → 갭 매핑·추천·변주가 동일 어휘 위에서 동작.
4. **개인화는 2-트랙**: (A) 큐레이션 = 기존/생성 자산 매칭 추천, (B) 생성형 변주 = 없거나 수준 불일치 시 재생성. 변주가 비싸므로 **A 우선, 부족분만 B**.

---

## [모델/표준]

### 스킬 정의·계층

- **스킬(skill)**: 측정 가능한 역량 단위. 예) "엑셀 피벗테이블 작성", "고객 이의 응대".
- **계층 구조**: `도메인 > 스킬 그룹(클러스터) > 스킬 > (선택) 세부 역량`. 다대다 관계도 허용(한 스킬이 복수 그룹에 속함) → 트리가 아닌 **DAG**로 모델링.
- **숙련 레벨(proficiency)**: 4단계 척도 (가정) — `1 인지 / 2 적용 / 3 숙달 / 4 전문`. 학습목표·태깅·프로파일·경로가 공유.

### 표준 프레임워크 참조 (가정)

| 프레임워크 | 성격 | 활용 |
|---|---|---|
| 자체 코어 스킬맵 | 정본 | 모든 내부 로직의 기준 어휘 |
| 외부 표준(예: ESCO/O*NET류, NCS 국내) | 매핑 대상 (가정) | 동의어·코드 매핑, 고객사 스킬맵 import |
| 고객사 자체 역량모델 | 테넌트별 확장 | 코어에 매핑하여 흡수 |

> (미정) 외부 표준 1차 채택 대상. 국내 기업교육·공공 타깃(정본 3-⑤)을 고려하면 **NCS(국가직무능력표준) 매핑**이 국내 영업에 유리(가정). 글로벌 상호운용은 ESCO/O*NET 검토(가정).

### 스킬 관계(skill_relation) 유형

| 유형 | 의미 | 용도 |
|---|---|---|
| `parent_of` | 계층(그룹↔스킬) | 트리/DAG 탐색 |
| `prerequisite_of` | 선수 | 적응형 경로 정렬 |
| `related_to` | 인접 | 추천 확장 |
| `alias_of` | 동의어/외부코드 | 표준·고객사 매핑 |

---

## [플로우]

### A. 콘텐츠 자동 스킬 태깅 (생성 시점)

```
소스 인제스트(04) → AI 생성(05) → [스킬 태깅] 학습목표·본문 임베딩 → 스킬맵 후보 매칭
  → 스킬 + 숙련레벨 + 신뢰도(confidence) 부여 → HITL 검수(낮은 신뢰도/신규 스킬만) → content_skill_tag 확정
```
- 신뢰도 임계값 미만 또는 스킬맵에 없는 후보는 검수 큐로(05의 HITL 게이트 재사용). 신규 스킬 제안 시 택소노미 관리자 승인.

### B. 학습자 스킬 프로파일 + 갭 매핑

```
입력원: 사전진단/평가 결과 · LMS 진도·성적(08) · 자가평가 · (가정)HR 역량데이터 import
  → learner_skill(보유 레벨·근거·갱신시각) 업데이트
목표(role/job 또는 코스 목표 스킬) − 보유 레벨 = [스킬 갭] → 갭 리스트(스킬·현재→목표 레벨·우선순위)
```

### C. 적응형 경로

```
스킬 갭 → prerequisite_of로 위상 정렬 → 갭 큰/우선 스킬부터 경로 구성
  → 학습 중 평가 신호로 격차 재식별 → 경로/난이도 자동 조정(스킵·보충·심화)
```
- 조정 규칙(가정): 평가 통과 → 다음 노드 스킵 가능 / 연속 오답 → 한 단계 낮은 난이도 변주 삽입.

### D. 생성형 변주 (차별점)

```
학습목표 + 대상 프로파일(레벨·역할) → 변주 사양(난이도/사례 도메인/길이/모달리티)
  → 큐레이션 우선: 적합 기존·생성 자산 있으면 추천(추가 생성 없음)
  → 없거나 수준 불일치 → 생성 엔진(05) 재호출로 변주 산출물 생성(소스 그라운딩 유지)
  → HITL 검수 → 학습자에게 노출 + content_skill_tag 자동 부여(같은 스킬, 다른 레벨/역할 메타)
```
- **핵심**: 동일 `learning_objective` 하나에 대해 (레벨×역할) 매트릭스로 변주본을 가짐. 신입/실무자/관리자 버전, 입문/심화 버전이 같은 스킬을 공유.
- 그라운딩(04) 유지로 변주해도 출처·신뢰성 보존 → 국내 미충족 차별점(정본 3-②)과 결합.

---

## [데이터 모델 초안]

> 표기: PK=기본키, FK=외래키. 테넌트 멀티테넌시 전제(가정)로 주요 테이블에 `tenant_id`.

### skill — 스킬 정의
| 컬럼 | 타입 | 설명 |
|---|---|---|
| skill_id | PK | 스킬 식별자 |
| tenant_id | FK | 테넌트(공용 스킬은 NULL/system) |
| name | string | 스킬명 |
| domain | string | 최상위 도메인 |
| description | text | 정의 |
| external_codes | json | 외부 표준 매핑 코드(ESCO/NCS 등, 가정) |
| status | enum | draft/active/deprecated |

### skill_relation — 스킬 관계(DAG)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| relation_id | PK | |
| from_skill_id | FK→skill | 출발 |
| to_skill_id | FK→skill | 도착 |
| type | enum | parent_of / prerequisite_of / related_to / alias_of |
| weight | float | 강도(추천 가중, 선택) |

### content_skill_tag — 콘텐츠 스킬 태깅
| 컬럼 | 타입 | 설명 |
|---|---|---|
| tag_id | PK | |
| content_id | FK | 생성 산출물(05)/모듈(08) |
| skill_id | FK→skill | 대상 스킬 |
| proficiency | int(1~4) | 콘텐츠가 다루는 레벨 |
| confidence | float | 자동 태깅 신뢰도 |
| source | enum | ai_auto / hitl / import |
| status | enum | candidate / confirmed |

### learner_profile — 학습자 프로파일
| 컬럼 | 타입 | 설명 |
|---|---|---|
| learner_id | PK | |
| tenant_id | FK | |
| role / job_id | string/FK | 역할·직무(목표 스킬셋 기준) |
| target_skill_set | json | 직무·코스가 요구하는 스킬·목표레벨 |
| prefs | json | 선호 모달리티·언어 등 |

### learner_skill — 학습자 보유 스킬
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | PK | |
| learner_id | FK→learner_profile | |
| skill_id | FK→skill | |
| current_level | int(1~4) | 현재 보유 레벨 |
| evidence | enum | assessment / progress / self / hr_import(가정) |
| updated_at | datetime | 갱신 시각 |

### learning_path — 적응형 학습 경로
| 컬럼 | 타입 | 설명 |
|---|---|---|
| path_id | PK | |
| learner_id | FK | |
| goal_skill_id | FK→skill | 목표 스킬(또는 목표 스킬셋 참조) |
| nodes | json | 순서화된 노드[ {content_id|module_id, skill_id, target_level, variant_spec, adaptive_rule} ] |
| status | enum | draft / active / completed |
| generated_by | enum | rule / ai |

> 변주본은 별도 테이블 대신 `content`(05/08)에 `learning_objective_id` + `variant_spec`(level/role)을 두어 동일 학습목표로 묶는다(가정) → `content_skill_tag`로 스킬 연결.

---

## [API 연결점] (개념 수준)

> 백엔드·AI는 형제 레포 `malgn-studio-api`. 엔드포인트는 개념 수준(현재 스캐폴드 상태).

| 영역 | 엔드포인트(개념) | 설명 |
|---|---|---|
| 택소노미 | `GET /skills`, `GET /skills/{id}/relations` | 스킬맵 조회/탐색 |
| 택소노미 관리 | `POST /skills`, `POST /skills/{id}/relations`, `POST /skills/map-external` | 스킬·관계·외부매핑 |
| 자동 태깅 | `POST /content/{id}/skill-tags:suggest` → `:confirm` | 생성 후 후보 태깅·검수 확정 |
| 프로파일 | `GET/PUT /learners/{id}/profile`, `GET /learners/{id}/skills` | 프로파일·보유스킬 |
| 갭 매핑 | `GET /learners/{id}/skill-gap?goal=...` | 목표 대비 갭 산출 |
| 적응형 경로 | `POST /learners/{id}/paths:generate`, `PATCH /paths/{id}:adapt` | 경로 생성·재조정 |
| 생성형 변주 | `POST /objectives/{id}/variants:generate` (level, role) | 05 재호출 변주 |

- 연결: 태깅은 **05 생성 파이프라인 콜백**으로 인라인 호출. 갭·진도 신호는 **08(LMS 진도·성적)** 에서 수신. 변주는 **05 생성 엔진** 재사용.

---

## [MVP vs 후속]

| 기능 | MVP | 후속 |
|---|---|---|
| 기본 스킬맵(코어 택소노미 + 계층) | ✅ 입장권 | — |
| 콘텐츠 자동 스킬 태깅(생성 시점 + HITL) | ✅ | 신규 스킬 자동 제안·승인 워크플로 고도화 |
| 외부 표준 매핑(NCS 등, 가정) | △ 스키마만(`external_codes`) | ✅ 실제 매핑·import |
| 학습자 프로파일 + 보유 스킬 | △ 기본 | HR 데이터 import(가정) |
| 스킬 갭 매핑 | △ 단순 목표−보유 | 직무 단위·우선순위 정교화 |
| 적응형 경로 | ✖ | ✅ 격차 식별→경로/난이도 자동 조정 |
| **생성형 변주(차별점)** | ✖(개념 검증/PoC) | ✅ 레벨×역할 변주 매트릭스 + 큐레이션 결합 |

- **MVP 결론**: *콘텐츠 스킬 태깅 + 기본 스킬맵*을 먼저 확보(입장권). 적응형·생성형 변주는 후속. 단, MVP 데이터 모델에 `learning_objective_id`/`variant_spec`/`prerequisite_of`를 미리 심어 후속 전환 비용을 낮춘다.

---

## [미정·가정]

- (가정) 외부 표준 1차 채택: 국내 영업 우선 시 **NCS** 매핑. 글로벌은 ESCO/O*NET 후속.
- (가정) 숙련 레벨 4단계 척도(인지/적용/숙달/전문). 평가 채점 기준과 정합 필요.
- (가정) 멀티테넌시 + 테넌트별 스킬 확장(고객사 역량모델 흡수).
- (미정) 자동 태깅 신뢰도 임계값·검수 비율 — 05 HITL 게이트와 합의 필요.
- (미정) 변주본 저장: 별도 테이블 vs `content`+`variant_spec`. 본 문서는 후자 가정.
- (미정) 갭 산출 기준이 "직무 target_skill_set"인지 "코스 목표 스킬"인지 — 양쪽 지원하되 우선순위 미정.
- (의존) 진도·성적 신호는 08의 트래킹(xAPI/LRS, 가정)에 의존 → 적응형 경로의 후속 일정은 08 후속과 연동.
