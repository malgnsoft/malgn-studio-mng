# 발행·LMS 연동 — 네이티브 발행 + 표준 패키징(SCORM/xAPI)

> 담당 해자: **① 자사 LMS 네이티브 발행 + 표준 패키징(SCORM/xAPI)**
> 정본 참조: [01-COMPETITION.md](./01-COMPETITION.md) · 형제 문서: [05-GENERATION.md](./05-GENERATION.md), [07-SKILLS-PERSONALIZATION.md](./07-SKILLS-PERSONALIZATION.md)
> 형제 레포: `malgn-studio-lms`(자사 LMS) · `malgn-studio-api`(백엔드+AI)
> 기준 시점: 2026-06

---

## [목적]

- 우리 차별점은 **자사 LMS 네이티브 발행 + 표준 패키징의 결합**(정본 4. 차별화 표). 경쟁군은 둘 중 하나에 치우침:
  - 영상 특화(Synthesia·HeyGen): LMS 발행 약함(외부 의존).
  - 올인원 빌더·LXP(Coursebox·Sana·Docebo): 자체 플랫폼 통합은 강하나 **플랫폼 종속**.
- 우리는 (A) **자사 LMS(malgn-studio-lms)로 무마찰 네이티브 발행** + (B) **SCORM/xAPI 표준 export로 외부 LMS 비종속**을 동시에 제공 → "우리 LMS도 쓰고, 남의 LMS로도 내보낸다".
- 휴넷이 자체 LMS 강자(정본 2.1)인 만큼, **자사 LMS 발행 무마찰성 + 표준 export 자유도**로 차별화. MVP는 네이티브 발행 + SCORM export에 집중(속도=경쟁력, 정본 3-①).

---

## [접근]

1. **단일 코스 모델 → 다중 발행 타깃**: 생성 산출물(05)을 `course/module`로 조립한 뒤, 동일 코스를 **네이티브(자사 LMS)** 또는 **표준 패키지(SCORM/xAPI)** 로 발행. 발행 타깃은 코스에 종속되지 않는 별도 레코드.
2. **버전 관리 = 불변 발행 스냅샷**: 코스는 편집 가능, 발행은 **버전 스냅샷**으로 고정. 재발행 시 새 버전 → 이미 수강 중인 학습자 영향 최소화.
3. **표준은 단계적**: SCORM 1.2(가장 호환 넓음)부터 → SCORM 2004 → xAPI/cmi5. 외부 LMS 호환성 우선순위로 MVP는 SCORM export.
4. **트래킹 2-트랙**: 네이티브는 LMS 내부 enrollment/progress 직접 기록. 표준 패키지는 SCORM 런타임(CMI) 또는 xAPI LRS로 신호 수신 → 07(스킬 갭·적응형)과 학습분석에 환류(가정).

---

## [모델/표준]

### 네이티브 코스 패키지 구조

```
course (코스)
 └─ module[] (모듈/차시)         ← 05 산출물 매핑: 영상/오디오/슬라이드/요약/퀴즈/문제은행
     └─ asset[] (산출물 + 메타)   ← 스킬 태그(07), 그라운딩 출처(04)
 + manifest (구조·순서·완료조건)
 + version (불변 스냅샷)
```
- 모듈은 산출물 8종(정본 0)을 담는 컨테이너. 완료조건(열람/통과점수)·순서·선수조건을 manifest에 기술.

### 표준 패키징 비교표

| 기준 | SCORM 1.2 | SCORM 2004 | xAPI(Tin Can) | cmi5 |
|---|---|---|---|---|
| 성격 | 패키지+런타임 | 패키지+시퀀싱 | 학습기록 명세(LRS) | xAPI 프로파일+런치 규약 |
| 전달 | zip(imsmanifest) | zip(imsmanifest) | statement → LRS | zip + LRS |
| 시퀀싱/내비 | 약함 | **강함**(규칙 기반) | 명세 외 | 단순+유연 |
| 추적 범위 | 완료·점수·진도(코스 내) | 좌동+상세 | **임의 활동·오프라인·모바일** | xAPI 기반 + 코스 구조 |
| LMS 호환성 | **가장 넓음(레거시 포함)** | 넓음 | LRS 필요(편차 큼) | 신흥(채택 증가) |
| 오프라인/외부활동 | ✖ | ✖ | **✅** | ✅ |
| MVP 적합도 | **◎ export 1순위** | ○ 후속 | △ 후속(LRS 의존) | △ 후속 |

> 결론: **MVP = SCORM 1.2 export**(외부 LMS 호환 최대). 진도·성적 상세/외부·모바일 추적이 필요해지면 **xAPI(+LRS)**, 코스구조+xAPI 동시 필요 시 **cmi5** 로 확장.

### export/import 범위

- **Export(우리 → 외부 LMS)**: SCORM 패키지(zip) 생성·다운로드. MVP 핵심.
- **Import(외부 → 우리)**: 외부 SCORM/콘텐츠 반입은 후속. 반입분은 07의 사후 일괄 스킬 태깅 경로로 처리.

---

## [플로우]

### A. 네이티브 발행 (자사 LMS)

```
산출물(05) → 코스/모듈 조립 → 검수(HITL, 05) → [발행] 버전 스냅샷 생성
  → publish_target(native) → malgn-studio-lms에 코스 등록/갱신 → enrollment 가능
  → 학습 진행 → progress/score 기록(LMS 내부)
```

### B. 표준 패키지 발행 (외부 LMS)

```
코스 버전 → [패키지 빌드] SCORM 1.2 manifest 생성 + asset 번들링 → package(zip)
  → 다운로드/전달 → 외부 LMS 업로드
  → (SCORM 런타임) CMI 데이터로 완료·점수 외부 LMS에 기록
  → (후속) xAPI면 statement → LRS → 우리 학습분석 환류(가정)
```

### C. 버전·재발행

```
코스 편집 → 새 버전(vN+1) → 재발행 시 native: 신규 수강자 vN+1 / 기수강자 정책(가정) 
  → 표준: 새 패키지 산출(이미 배포된 zip은 불변)
```

---

## [데이터 모델 초안]

> 표기: PK=기본키, FK=외래키. 멀티테넌시 전제(가정).

### course — 코스
| 컬럼 | 타입 | 설명 |
|---|---|---|
| course_id | PK | |
| tenant_id | FK | |
| title / description | string/text | |
| objective_skill_ids | json | 목표 스킬(07 연결) |
| current_version | int | 최신 발행 버전 |
| status | enum | draft / published / archived |

### module — 모듈/차시
| 컬럼 | 타입 | 설명 |
|---|---|---|
| module_id | PK | |
| course_id | FK→course | |
| order | int | 순서 |
| type | enum | video/audio/slide/curriculum/storyboard/quiz/itembank/summary |
| content_id | FK | 05 산출물 참조 |
| completion_rule | json | 열람/통과점수 등 완료조건 |

### publish_target — 발행 타깃
| 컬럼 | 타입 | 설명 |
|---|---|---|
| target_id | PK | |
| course_id | FK→course | |
| version | int | 발행한 코스 버전(스냅샷) |
| type | enum | **native** / scorm12 / scorm2004 / xapi / cmi5 |
| destination | json | native=lms 코스ID / 표준=배포 메타 |
| status | enum | building / published / failed |
| published_at | datetime | |

### package — 표준 패키지 산출물
| 컬럼 | 타입 | 설명 |
|---|---|---|
| package_id | PK | |
| target_id | FK→publish_target | |
| format | enum | scorm12 / scorm2004 / xapi / cmi5 |
| manifest_ref | string | imsmanifest/프로파일 참조 |
| artifact_url | string | zip 다운로드 위치 |
| checksum | string | 무결성 |

### enrollment — 수강
| 컬럼 | 타입 | 설명 |
|---|---|---|
| enrollment_id | PK | |
| course_id | FK→course | |
| learner_id | FK | 07 learner_profile 연결 |
| version | int | 수강 시점 코스 버전 |
| status | enum | active / completed / dropped |

### progress — 진도·성적
| 컬럼 | 타입 | 설명 |
|---|---|---|
| progress_id | PK | |
| enrollment_id | FK→enrollment | |
| module_id | FK→module | |
| completion | enum | not_started / in_progress / completed |
| score | float | 점수(퀴즈 등) |
| source | enum | native / scorm_cmi / xapi_lrs(가정) |
| updated_at | datetime | |

> 진도·성적은 07의 `learner_skill.evidence=progress`로 환류 → 스킬 갭·적응형 입력.

---

## [API 연결점] (개념 수준)

> 백엔드는 `malgn-studio-api`, 자사 LMS는 `malgn-studio-lms`(현재 스캐폴드). 엔드포인트는 개념 수준.

| 영역 | 엔드포인트(개념) | 설명 |
|---|---|---|
| 코스 조립 | `POST /courses`, `POST /courses/{id}/modules` | 산출물→코스/모듈 |
| 버전 | `POST /courses/{id}/versions` | 발행 스냅샷 생성 |
| 네이티브 발행 | `POST /courses/{id}/publish` `{type:native}` | malgn-studio-lms 등록/갱신 |
| 패키지 생성 | `POST /courses/{id}/packages` `{format:scorm12}` → `GET /packages/{id}/download` | SCORM export |
| 발행 타깃 | `GET /courses/{id}/publish-targets` | 타깃·상태 조회 |
| 수강 | `POST /enrollments`, `GET /learners/{id}/enrollments` | LMS 연동 |
| 트래킹 수신 | `POST /tracking/scorm` (CMI) · `POST /tracking/xapi` (statement, 후속) | 진도·성적 수신 |

- 연결: 발행 입력은 **05 산출물 + 07 스킬 태그**. 트래킹 출력은 **07 갭·적응형 + 학습분석**(가정)으로 환류.

---

## [MVP vs 후속]

| 기능 | MVP | 후속 |
|---|---|---|
| 네이티브 발행(자사 LMS) | ✅ 무마찰 발행 | 기수강자 버전 마이그레이션 정책 |
| 코스/모듈 조립 + 버전 스냅샷 | ✅ | 시퀀싱·선수조건 고도화 |
| **SCORM 1.2 export** | ✅ 외부 호환 1순위 | — |
| SCORM 2004 export | ✖ | ✅ 시퀀싱 필요 시 |
| xAPI + LRS 트래킹 | ✖ | ✅ 외부·모바일·상세 추적(가정) |
| cmi5 | ✖ | △ 채택 추이 보고 |
| 외부 콘텐츠 import | ✖ | ✅(07 사후 태깅 연계) |
| 학습분석 연결 | △ 네이티브 진도/성적 집계 | ✅ LRS 기반 분석 환류(가정) |

- **MVP 결론**: *네이티브 발행 + SCORM 1.2 export* 로 "우리 LMS 무마찰 + 외부 LMS 비종속"을 동시에 증명. xAPI/LRS·학습분석 환류는 후속. 단 `progress.source`·`publish_target.type` enum에 표준 값을 미리 심어 후속 전환 비용을 낮춘다.

---

## [미정·가정]

- (가정) MVP 표준 export 포맷은 **SCORM 1.2**(호환성 최대). 고객 요구 시 2004 우선순위 조정.
- (가정) xAPI 도입 시 **자체 LRS vs 외부 LRS** 선택 — 학습분석 범위에 따라 결정(미정).
- (가정) 진도·성적의 07 환류(스킬 레벨 갱신) 매핑 규칙 — 통과점수→숙련레벨 변환식 미정.
- (미정) 재발행 시 기수강자 처리 정책(자동 이전 / 잔류 / 선택).
- (미정) 자사 LMS(malgn-studio-lms) 현 스키마 — 레포가 스캐폴드 상태로 비어 있어 코스/수강 모델 정합은 LMS 설계 확정 후 재검토.
- (미정) cmi5 채택 시점 — 시장 채택 추이 모니터링.
- (의존) 발행 입력은 05(생성)·07(태깅)에 의존, 트래킹 출력은 07·학습분석에 환류 → 후속 일정 상호 연동.
