# 미디어 연동 — 영상·오디오 생성(외부 API)

> 범위: AI 산출물 8종 중 ⑦ 학습 영상 · ⑧ 학습 오디오. 직접 개발이 아닌 **외부 API 연동(Buy)** 전략.
> 입력 의존: 영상은 콘티(storyboard)/슬라이드, 오디오는 요약/스크립트를 `05-GENERATION.md`에서 받는다. 본 문서는 그 입력을 받아 **렌더 잡 → 결과 에셋**으로 만드는 연결·운영을 다룬다.
> 정본 참조: `01-COMPETITION.md` — "아바타/영상 합성은 외부 API가 합리적. 직접 개발 대상 아님. 영상은 국산 도구(브루) 제휴가 합리적."
> 구현 영역: 큐·잡·웹훅은 `malgn-studio-api`.

---

## 1. 목적

- 영상·오디오를 **직접 개발하지 않고 외부 API로 빌려 쓴다.** 합성 품질·언어·아바타는 전문 벤더가 압도적이며 직접 개발 ROI가 낮다(`01`).
- 우리의 가치는 **합성 자체가 아니라 "교수설계 정렬·그라운딩된 스크립트(콘티)를 입력으로 넣는 것"과 "발행·개인화"**다. 따라서 미디어 레이어는 **교체 가능한 부품**으로 추상화한다.
- 단일 벤더 종속(가격·정책·쿼터 리스크)을 피하기 위해 **Provider 추상화 레이어**를 둔다.

---

## 2. 외부 API 연동 전략

### 2.1. 후보 비교표

| 후보 | 한국어 지원 | 교육 적합성 | 비용(개략, 가정) | 장점 | 단점 |
|---|---|---|---|---|---|
| **Synthesia** | 한국어 음성·자막 지원(120+ 언어) | 높음(기업 강의 표준) | 중~상, 시트+분당 | 아바타 품질·안정성·기업 신뢰, API 성숙 | 가격 높음, 장편 비용↑ |
| **HeyGen** | 한국어 지원(약 40언어) | 중(숏폼 강점) | 중, 크레딧 | 빠름·저렴, API·아바타 다양 | 장편 교육영상 약함, 일관성 |
| **Colossyan** | 한국어 지원 | **높음(학습 워크플로 특화)** | 중, 시트 기반 | 장면·다중발표자·언어전환 등 교육 기능 | 인지도·국내 레퍼런스 적음 |
| **브루 Vrew (VoyagerX)** | **한국어 네이티브 최적** | 중~높음(국내 교육 콘텐츠) | 상대적 저렴, 국내 | 200+ 한국어 음성, 자막·요약숏폼, 국내 제휴 용이 | 공개 렌더 API 성숙도 확인 필요(가정), 아바타는 약함 |

> `01` 기준: 영상은 국산 도구(브루) **제휴 후보**, 글로벌은 Synthesia/Colossyan이 교육 적합. 한국어 품질이 1차 평가축.

### 2.2. 선정 기준(가중치 가정)

| 기준 | 가중 | 설명 |
|---|---|---|
| 한국어 품질(음성·자막·발음) | ★★★ | 1차 필터. 국내 교육 핵심 |
| 렌더 API 성숙도(잡·웹훅·SLA) | ★★★ | 비동기 파이프라인 통합 가능성 |
| 교육 적합성(장편·장면·발표자) | ★★ | 강의형 콘텐츠 |
| 비용·과금 모델(크레딧/분/시트) | ★★ | 크레딧 관리·마진 |
| 입력 호환(스크립트·슬라이드 import) | ★★ | 콘티/슬라이드 → 영상 매핑 |
| 국내 제휴·지원·데이터 정책 | ★ | 계약·리스크 |

> 결정 방식: 한국어 품질·API 성숙도로 후보 압축 → PoC(동일 콘티 입력, 동일 평가 루브릭)로 비교 → MVP 1개 선정. **추상화 레이어 덕에 후속 교체·복수 운영 가능.**

---

## 3. Provider 추상화 레이어

### 3.1. 공통 인터페이스

벤더별 API 차이를 `MediaProvider` 인터페이스 뒤로 숨긴다. 상위 파이프라인은 벤더를 모른다.

```
MediaProvider (interface)
  submitRender(RenderRequest) -> RenderJobHandle      # 잡 제출
  getStatus(jobId)            -> RenderStatus          # 폴링
  handleWebhook(payload)      -> RenderStatus          # 웹훅 수신
  fetchAssets(jobId)          -> RenderAsset[]         # 결과 에셋
  estimateCost(RenderRequest) -> CostEstimate          # 사전 비용 추정
  cancel(jobId)               -> void
```

| 공통 모델 | 핵심 필드 | 설명 |
|---|---|---|
| `RenderRequest` | type(video/audio), script[], slides[], voice, avatar, lang, subtitle, aspect_ratio | 표준 입력(콘티/슬라이드 → 매핑) |
| `RenderJobHandle` | provider, provider_job_id, our_job_id | 잡 식별 |
| `RenderStatus` | state(queued/processing/succeeded/failed), progress, error | 진행상태 |
| `RenderAsset` | kind(mp4/mp3/vtt/thumbnail), url, duration, size | 결과물 |
| `CostEstimate` | credits, currency_cost, unit | 사전 견적 |

- 각 벤더는 `SynthesiaProvider`, `HeyGenProvider`, `VrewProvider` 등 어댑터로 구현 → 입력 매핑·과금 단위·웹훅 포맷을 내부에서 변환.
- **교체 가능성**: 프로젝트/조직 단위로 default provider 설정. 동일 `RenderRequest`로 벤더 전환 가능(품질·비용 A/B).

---

## 4. 비동기 렌더 잡

### 4.1. 처리 흐름

```
[05: 콘티/요약 승인됨]
     │ RenderRequest 생성(스크립트·슬라이드 매핑)
     ▼
[credit 사전 확인 + estimateCost] ──부족──► 차단/알림
     │ 충분
     ▼
[render_job 생성: queued] → 큐 적재 → MediaProvider.submitRender
     │
     ├─ 웹훅 지원: provider → /webhook → 상태 갱신
     └─ 미지원: 폴링 워커가 getStatus 주기 호출
     │
     ▼
[processing] (progress %) ──실패──► [failed] → 재시도(backoff) / 사유 기록
     │ 성공
     ▼
[succeeded] → fetchAssets → 에셋 저장(스토리지) → artifact(video/audio) draft
     │
     ▼
[05 HITL 검수 게이트] → 승인 → 발행
```

### 4.2. 운영 요소

| 요소 | 설계(가정) |
|---|---|
| 큐 | 잡 큐(예: DB 기반 또는 메시지 큐). provider 동시성 한도 고려 |
| 상태 수신 | **웹훅 우선**, 미지원 벤더는 폴링 워커(지수 백오프) 폴백 |
| 진행상태 | render_job.progress(%) UI 노출 |
| 실패·재시도 | 일시 오류 재시도(최대 N회, backoff), 영구 오류 즉시 failed + 사유 |
| 멱등성 | our_job_id 기준 멱등 — 중복 제출·웹훅 재전송 방어 |
| 크레딧/비용 | 제출 전 estimateCost, 완료 후 실비용 기록. 조직별 크레딧 차감·한도·알림 |
| 타임아웃 | 장편 렌더 지연 대비 잡 타임아웃 + 수동 재시도 |

> 생성된 미디어 artifact도 `05`의 상태 모델(draft→review→approved→published)을 그대로 따른다. 렌더 성공 = draft 진입이지 발행 아님.

### 4.3. 데이터 모델(미디어 확장)

`05`의 `generation_job`을 미디어용으로 확장하거나 별도 `render_job`을 둔다(가정: 별도 테이블).

| 필드 | 설명 |
|---|---|
| id / artifact_id | 잡·산출물 FK(영상/오디오 artifact) |
| provider / provider_job_id | 벤더·벤더 잡 ID |
| request_payload | RenderRequest 스냅샷 |
| state / progress | queued/processing/succeeded/failed, % |
| assets | RenderAsset[] (url·duration·kind) |
| credits_estimated / credits_used | 비용 |
| retry_count / error | 재시도·사유 |
| created_at / finished_at | 시각 |

---

## 5. 오디오(TTS)

### 5.1. 한국어 음성

- 오디오 산출물(⑧)은 **TTS**로 처리. 요약/콘티 내레이션 스크립트 → 음성.
- 한국어 자연스러움이 핵심. 후보: 영상 벤더의 TTS(Synthesia/Vrew 등) 재사용 또는 전용 TTS API.
- 파라미터: 음성(성별·톤), 속도, SSML(강세·휴지) 지원 여부(가정).

### 5.2. 오디오 오버뷰(대담형) — 가정

- (가정) NotebookLM식 **2인 대담(호스트-게스트) 오디오 오버뷰**를 후속 검토. 요약·소스를 대담 스크립트로 변환(LLM, `05`) → 다중 화자 TTS 합성.
- 차별화 포인트지만 다중 화자·자연스러운 대화 합성 난도·비용이 큼 → **MVP 제외, 후속 PoC**.
- MVP는 단일 화자 내레이션 TTS로 시작.

---

## 6. 슬라이드/콘티 → 영상 변환 플로우

```
[슬라이드(05)] ──► [콘티(05)] : 슬라이드별 narration + on_screen_text + shot_hint + duration
       │                │
       └──── 둘 다 RenderRequest로 매핑 ────┐
                                            ▼
   scene[i] = { 슬라이드 비주얼/배경, 내레이션→음성, 자막(on_screen_text), 길이 }
                                            ▼
                        MediaProvider.submitRender (영상 또는 슬라이드+TTS)
```

| 입력 요소(콘티) | 영상 매핑 |
|---|---|
| scene.narration | TTS 음성 / 아바타 발화 |
| scene.on_screen_text | 자막·화면 텍스트 |
| scene.slide_ref(비주얼) | 슬라이드 배경·이미지 |
| scene.shot_hint | 장면 전환·레이아웃 힌트 |
| scene.duration_sec | 장면 길이·페이싱 |

- **콘티가 영상의 단일 진실 소스(SSOT)**. 콘티 승인 후에만 영상 렌더 가능(불필요 크레딧 소모 방지).
- 슬라이드만으로도 "슬라이드 + TTS 내레이션" 형식 경량 영상 생성 가능(아바타 없는 MVP 경로).

---

## 7. MVP vs 후속

| 영역 | MVP | 후속 |
|---|---|---|
| 영상 벤더 | **1개 provider 선정**(한국어·교육 적합 기준 PoC 후) | 복수 provider·교체·A/B |
| 영상 형식 | 슬라이드 + TTS 내레이션(아바타 선택) | 아바타·다중 발표자·장면 전환 고도화 |
| 오디오 | **단일 화자 TTS 내레이션** | 대담형 오디오 오버뷰(2인) |
| 잡 처리 | 큐 + 폴링 + 기본 재시도 | 웹훅 + 정교한 백오프·우선순위 큐 |
| 비용 | 사전 estimate + 사후 기록 | 조직별 크레딧·한도·예산 경보 |
| 추상화 | MediaProvider 인터페이스 + 1 어댑터 | 다중 어댑터·동적 라우팅 |

> 제안: **MVP = 1 provider + 단일 화자 TTS + 슬라이드→영상 경량 경로 + 큐/폴링.** 추상화 레이어는 처음부터 둬서 벤더 교체 비용을 낮춘다. 아바타·대담형·웹훅·복수 벤더는 후속.

---

## 8. 미정·가정

- (가정) 벤더 비용·한국어 품질·API 성숙도는 조사 시점 기준이며 PoC로 재검증 필요(`01` 주의 동일).
- (가정) 브루(Vrew) 공개 렌더 API 성숙도·제휴 조건 확인 필요 — 제휴가 되면 한국어·비용 우위.
- (가정) render_job은 `05`의 generation_job과 별도 테이블로 분리(미디어 특유 필드: provider·assets·credits).
- (가정) 대담형 오디오 오버뷰는 후속 PoC. 다중화자 합성 품질·비용이 관건.
- (미정) 최종 MVP provider, TTS 벤더, 크레딧 과금을 사용자에 전가할지(조직 한도) 여부.
- (미정) 에셋 스토리지 위치·CDN·접근 정책, 발행 시 SCORM/xAPI 패키징과의 결합(발행 문서 위임).
- 위임: 입력 산출물(콘티·슬라이드·스크립트) 생성 → `05-GENERATION.md`. 출처 그라운딩 → `04-INGEST-GROUNDING.md`. LMS 발행·패키징 → 발행 문서(별도).
