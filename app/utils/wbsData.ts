// 간트 WBS 데이터 — 맑은스튜디오 **분석·기획·설계 단계** (2026-06-17~18 수행분).
// 9단계 배포 로드맵은 docs/planning/11-ROADMAP-WBS.md · 대시보드(현황판)에 별도 유지.
// 이 간트는 현재까지 완료한 상위 단계(분석→기획→설계)를 기록한다. 날짜 ISO(YYYY-MM-DD).

export interface GanttItem {
  step: 1 | 2 | 3
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
  1: 'Step 1 · 분석',
  2: 'Step 2 · 기획',
  3: 'Step 3 · 설계',
}

// 단계 가중치·진행률 — 전체 진척은 가중평균(합 100). 분석·기획·설계 모두 완료(100%).
export const wbsStageMeta: Record<number, { weight: number, progress: number }> = {
  1: { weight: 20, progress: 100 },
  2: { weight: 45, progress: 100 },
  3: { weight: 35, progress: 100 },
}

export const wbsGantt: GanttItem[] = [
  // ── Step 1 · 분석 ─────────────────────────────────────
  { step: 1, group: '시장·경쟁', name: '경쟁 환경 분석 (글로벌·국내 LMS/LXP AI 빌더)', owner: 'service-planner', start: '2026-06-17', end: '2026-06-17', progress: 100, note: '01-COMPETITION 정본' },
  { step: 1, group: '시장·경쟁', name: '포지셔닝·차별화 도출 (4대 해자)', owner: 'service-planner', start: '2026-06-17', end: '2026-06-17', progress: 100, note: '02-STRATEGY' },

  // ── Step 2 · 기획 ─────────────────────────────────────
  { step: 2, group: '서비스 기획', name: '서비스 개요·비전 (00)', owner: 'service-planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '서비스 기획', name: '차별화 전략 (02)', owner: 'service-planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '서비스 기획', name: '기능 정의·범위 MVP 매트릭스 (03)', owner: 'service-planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '도메인 기획', name: '인제스트·그라운딩 기획 (04)', owner: 'planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '도메인 기획', name: 'AI 생성 엔진 기획 (05)', owner: 'planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '도메인 기획', name: '미디어 연동 기획 (06)', owner: 'planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '도메인 기획', name: '스킬·개인화 기획 (07)', owner: 'planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '도메인 기획', name: '발행·LMS 기획 (08)', owner: 'planner', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '로드맵·NFR', name: '로드맵·WBS 9단계 (11)', owner: 'pms-developer', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 2, group: '로드맵·NFR', name: '비기능 요구 NFR (12)', owner: 'architect', start: '2026-06-17', end: '2026-06-17', progress: 100 },

  // ── Step 3 · 설계 ─────────────────────────────────────
  { step: 3, group: '시스템 설계', name: '기술 아키텍처·AI 파이프라인 (09)', owner: 'architect', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 3, group: '시스템 설계', name: '통합 데이터 모델 ERD (09)', owner: 'dba', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 3, group: '경험 설계', name: 'IA·사용자 플로우·화면 (10)', owner: 'ux-designer', start: '2026-06-17', end: '2026-06-17', progress: 100 },
  { step: 3, group: '교수설계', name: '품질 정본 (블룸·정합·8종 루브릭·HITL)', owner: 'instructional-designer', start: '2026-06-18', end: '2026-06-18', progress: 100, note: 'planning/quality' },
  { step: 3, group: '조직 설계', name: '에이전트 팀·성장 시스템 설계', owner: 'growth-keeper', start: '2026-06-18', end: '2026-06-18', progress: 100 },
]
