// 간트 WBS 데이터 — 맑은스튜디오 9단계 (착수 단계 스타터 시드).
// 프로젝트 착수 단계라 progress 0 · 날짜 미정(간트 막대 없음). owner는 역할 라벨.

export interface GanttItem {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  group: string
  name: string
  owner: string
  start?: string // 미정이면 생략(간트 막대 없음)
  end?: string
  progress: number
  note?: string
  href?: string
}

export const wbsSteps: Record<number, string> = {
  1: 'Step 1 · 기반·인프라',
  2: 'Step 2 · 인제스트·그라운딩',
  3: 'Step 3 · AI 생성 엔진',
  4: 'Step 4 · HITL 검수',
  5: 'Step 5 · 발행·표준 패키징',
  6: 'Step 6 · 스킬·개인화',
  7: 'Step 7 · 미디어 연동',
  8: 'Step 8 · 운영자 콘솔·LMS',
  9: 'Step 9 · QA·배포·인프라',
}

// 단계 가중치·진행률 — 현황판(보드)과 동일 값. 전체 진척은 가중평균(합 100, QA 0).
// 프로젝트 착수 단계라 progress 전부 0.
export const wbsStageMeta: Record<number, { weight: number, progress: number }> = {
  1: { weight: 10, progress: 0 },
  2: { weight: 18, progress: 0 },
  3: { weight: 22, progress: 0 },
  4: { weight: 8, progress: 0 },
  5: { weight: 12, progress: 0 },
  6: { weight: 12, progress: 0 },
  7: { weight: 8, progress: 0 },
  8: { weight: 10, progress: 0 },
  9: { weight: 0, progress: 0 },
}

export const wbsGantt: GanttItem[] = [
  // ── Step 1 · 기반·인프라 ──────────────────────────────
  { step: 1, group: '기반', name: '멀티앱 레포 스캐폴드(studio/admin/api/lms)', owner: '기반', progress: 0 },
  { step: 1, group: '기반', name: '인증·세션·RBAC·프로젝트/워크스페이스', owner: '백엔드', progress: 0 },

  // ── Step 2 · 인제스트·그라운딩 ────────────────────────
  { step: 2, group: '인제스트', name: '문서/PPT 파서 + 청킹·정규화', owner: '백엔드', progress: 0 },
  { step: 2, group: '인제스트', name: '임베딩·벡터스토어 인덱싱 + 출처 매핑', owner: '백엔드', progress: 0 },

  // ── Step 3 · AI 생성 엔진 ─────────────────────────────
  { step: 3, group: '생성', name: '생성 오케스트레이션 + 요약·슬라이드·퀴즈', owner: '백엔드', progress: 0 },
  { step: 3, group: '생성', name: '학습목표·블룸 정렬·평가-목표 매트릭스', owner: '기획', progress: 0 },

  // ── Step 4 · HITL 검수 ────────────────────────────────
  { step: 4, group: '검수', name: '승인 게이트 상태머신', owner: '프론트', progress: 0 },

  // ── Step 5 · 발행·표준 패키징 ─────────────────────────
  { step: 5, group: '발행', name: '자사 LMS 네이티브 발행 + SCORM 1.2', owner: '백엔드', progress: 0 },

  // ── Step 6 · 스킬·개인화 ──────────────────────────────
  { step: 6, group: '스킬', name: '스킬 사전 + 산출물 스킬 태깅(씨앗)', owner: '기획', progress: 0 },

  // ── Step 7 · 미디어 연동 ──────────────────────────────
  { step: 7, group: '미디어', name: 'MediaProvider 추상화 + 1차 벤더(TTS)', owner: '백엔드', progress: 0 },

  // ── Step 8 · 운영자 콘솔·LMS ──────────────────────────
  { step: 8, group: '운영', name: 'admin 회원·사용량 / lms 수강·진도', owner: '프론트', progress: 0 },
]
