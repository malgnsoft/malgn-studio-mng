<template>
  <div class="page">
    <section class="hero">
      <h1 class="hero-title">맑은스튜디오 프로젝트 관리</h1>
      <p class="hero-desc">
        맑은스튜디오 프로젝트의 문서·기록·진행 사항을 한곳에서 조망합니다.
      </p>
    </section>

    <!-- 프로젝트 개요 (목표 · 기획 방향) -->
    <section class="overview">
      <div class="overview-head">
        <h2 class="overview-title">프로젝트 개요</h2>
        <NuxtLink to="/docs/wbs" class="overview-more">WBS 문서 →</NuxtLink>
      </div>
      <div class="overview-grid">
        <div class="ov-card">
          <p class="ov-label">목표</p>
          <p class="ov-goal">
            다양한 소스(<b>문서·PPT·웹·영상</b>)로부터 <b>NotebookLM급 AI</b>로 학습 콘텐츠(영상·오디오·슬라이드·커리큘럼·콘티·퀴즈·문제은행·요약)를
            제작하는 <b>스튜디오</b>.
          </p>
          <div class="ov-channels">
            <span v-for="ch in channels" :key="ch" class="ov-chip">{{ ch }}</span>
          </div>
        </div>
        <div class="ov-card">
          <p class="ov-label">기획 방향</p>
          <ul class="ov-list">
            <li v-for="d in directions" :key="d">{{ d }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 프로젝트 현황 (WBS 요약) -->
    <section class="board-summary">
      <div class="board-summary-head">
        <h2 class="board-summary-title">프로젝트 현황</h2>
        <NuxtLink to="/wbs" class="board-summary-more">전체 일정(WBS) 보기 →</NuxtLink>
      </div>

      <div v-if="wbsPending" class="board-summary-state">현황 불러오는 중…</div>
      <div v-else-if="wbsError" class="board-summary-state">현황을 불러올 수 없습니다.</div>
      <AppWbsOverview
        v-else
        :stages="stages"
        :weighted-average="weightedAverage"
      >
        <template #aside>
          <div class="links-card">
            <p class="links-title">바로가기</p>
            <ul class="links">
              <li v-for="link in shortcuts" :key="link.url">
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link">
                  <span class="link-main">
                    <span class="link-label">{{ link.label }}</span>
                    <span class="link-url">{{ stripProto(link.url) }}</span>
                  </span>
                  <UIcon name="i-lucide-arrow-up-right" class="link-ext" />
                </a>
              </li>
            </ul>
          </div>
        </template>
      </AppWbsOverview>
    </section>

    <!-- 최근 이슈 (정책·이슈·공지·논의) -->
    <section class="issues-section">
      <div class="col-head">
        <h2 class="col-title">최근 이슈</h2>
        <NuxtLink to="/issues" class="col-more">전체 보기 →</NuxtLink>
      </div>
      <div v-if="issuesPending" class="issue-empty">이슈 불러오는 중…</div>
      <div v-else-if="issuesError" class="issue-empty">이슈를 불러올 수 없습니다.</div>
      <ul v-else-if="recentIssues.length" class="card-list">
        <li v-for="it in recentIssues" :key="it.id">
          <NuxtLink :to="`/issues/${it.id}`" class="issue-card">
            <span class="badge type">{{ issueTypeLabel(it.type) }}</span>
            <span class="issue-card-title">{{ it.title }}</span>
            <span class="badge" :class="issueStatusClass(it.status)">{{ issueStatusLabel(it.status) }}</span>
            <span class="issue-card-meta">{{ it.authorName || '—' }} · {{ formatDate(it.updatedAt || it.createdAt) }}</span>
          </NuxtLink>
        </li>
      </ul>
      <NuxtLink v-else to="/issues/new" class="issue-empty issue-empty-link">
        등록된 이슈가 없습니다. 새 이슈를 작성해 보세요 →
      </NuxtLink>
    </section>

    <div class="grid">
      <section class="col">
        <div class="col-head">
          <h2 class="col-title">문서</h2>
          <NuxtLink to="/docs" class="col-more">전체 보기 →</NuxtLink>
        </div>
        <ul class="card-list">
          <li v-for="doc in topDocs" :key="doc.path">
            <NuxtLink :to="'/docs' + doc.path" class="doc-card">
              <UIcon name="i-lucide-file-text" class="doc-card-ico" />
              <span class="doc-card-body">
                <span class="doc-card-title">{{ doc.title || doc.path }}</span>
                <span v-if="doc.description" class="doc-card-desc">{{ doc.description }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="col">
        <div class="col-head">
          <h2 class="col-title">최근 작업 이력</h2>
          <NuxtLink to="/history" class="col-more">전체 보기 →</NuxtLink>
        </div>
        <ul class="card-list">
          <li v-for="h in recentHistory" :key="h.path">
            <NuxtLink :to="'/docs' + h.path" class="doc-card">
              <span class="hist-date">{{ formatYmd(historyDate(h.path)) }}</span>
              <span class="doc-card-body">
                <span class="doc-card-title">{{ h.title || h.path }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { wbsSteps, wbsStageMeta } from '~/utils/wbsData'
import type { WbsStage } from '~/composables/useWbs'
import { formatDate, issueStatusClass, issueStatusLabel, issueTypeLabel } from '~/utils/issueMeta'
import type { IssueListItem } from '~/utils/issueMeta'

const shortcuts = [
  { label: '스튜디오 앱', url: '#' },
  { label: '운영자 콘솔', url: '#' },
  { label: 'API 서버', url: '#' },
  { label: 'LMS', url: '#' },
]

const stripProto = (u: string) => u.replace(/^https?:\/\//, '')

const channels = ['AI 콘텐츠 생성', '소스 그라운딩(출처)', '스킬 개인화', 'LMS 네이티브+표준발행', 'HITL 검수']
const directions = [
  '멀티소스 인제스트·정규화 (문서·PPT·웹·영상 → 청크)',
  '그라운딩 신뢰성 (출처 인용 · 환각 차단)',
  '산출물 8종 멀티모달 (영상·오디오·슬라이드·커리큘럼·콘티·퀴즈·문제은행·요약)',
  'LMS 발행(SCORM·xAPI) + 스킬 개인화',
]

// 현황 요약은 WBS(간트)와 동일 소스 — wbsStageMeta(단계 진척) + /api/wbs(항목 수).
const STEP_EMOJI: Record<number, string> = { 1: '🏗️', 2: '🔎', 3: '🧠', 4: '✅', 5: '📦', 6: '🎯', 7: '🎬', 8: '🛠️', 9: '🧪' }
const { data: wbsRes, pending: wbsPending, error: wbsError } = await useFetch<{ data: { step: number }[] }>('/api/wbs', { key: 'wbs-overview' })
const wbsItems = computed(() => wbsRes.value?.data ?? [])

const stages = computed<WbsStage[]>(() =>
  Object.keys(wbsStageMeta).map((k) => {
    const num = Number(k)
    const meta = wbsStageMeta[num]!
    const [no, name] = (wbsSteps[num] ?? `Step ${num} · `).split(' · ')
    return {
      id: `step-${num}`,
      no: no ?? `Step ${num}`,
      emoji: STEP_EMOJI[num] ?? '•',
      name: name ?? '',
      summary: '',
      weight: meta.weight,
      progress: meta.progress,
      tasks: wbsItems.value.filter(i => i.step === num) as unknown as WbsStage['tasks'],
    }
  }),
)

const weightedAverage = computed(() => {
  const metas = Object.values(wbsStageMeta)
  const tw = metas.reduce((a, s) => a + s.weight, 0)
  if (!tw) return 0
  return Math.round((metas.reduce((a, s) => a + s.weight * s.progress, 0) / tw) * 10) / 10
})

const { data: all } = await useAllDocs()

const docs = computed(() => (all.value ?? []).filter(d => !isHistory(d.path)))
const histories = computed(() =>
  (all.value ?? [])
    .filter(d => isHistory(d.path) && historyDate(d.path))
    .sort((a, b) => (historyDate(b.path) ?? '').localeCompare(historyDate(a.path) ?? ''))
)

const topDocs = computed(() => docs.value.slice(0, 8))
const recentHistory = computed(() => histories.value.slice(0, 6))

// 최근 이슈 — 게시판 최신 5건 (목록 API는 최신순 정렬).
const { data: issuesRes, pending: issuesPending, error: issuesError } = await useFetch<{ data: IssueListItem[] }>(
  '/api/issues',
  { query: { page: 1 }, key: 'home-issues' },
)
const recentIssues = computed(() => (issuesRes.value?.data ?? []).slice(0, 5))
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}
.hero {
  margin-bottom: 32px;
}
/* 전체 진행률 옆 간단 바로가기 */
.links-card {
  height: 100%;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
}
.links-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-400);
  margin-bottom: 6px;
}
.links {
  display: flex;
  flex-direction: column;
}
.link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-top: 1px solid var(--ink-50);
}
.links li:first-child .link { border-top: 0; }
.link-main {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.link-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-800);
  flex-shrink: 0;
}
.link-url {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-400);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.link:hover .link-label { color: var(--accent-ink); }
.link:hover .link-url { color: var(--accent-ink); }
.link-ext {
  width: 14px;
  height: 14px;
  color: var(--ink-300);
  flex-shrink: 0;
}
.link:hover .link-ext { color: var(--accent-ink); }

/* 프로젝트 개요 */
.overview { margin-bottom: 44px; }
.overview-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
.overview-title { font-size: 16px; font-weight: 700; color: var(--ink-900); }
.overview-more { font-size: 13px; color: var(--accent-ink); }
.overview-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
@media (max-width: 780px) { .overview-grid { grid-template-columns: 1fr; } }
.ov-card { background: var(--white); border: 1px solid var(--line); border-radius: 12px; padding: 18px 20px; }
.ov-label { font-size: 12px; font-weight: 600; color: var(--ink-400); margin-bottom: 8px; }
.ov-goal { font-size: 14px; line-height: 1.65; color: var(--ink-700); }
.ov-goal b { font-weight: 600; color: var(--ink-900); }
.ov-channels { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.ov-chip { font-size: 12px; font-weight: 500; color: var(--ink-700); background: var(--ink-50); border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; }
.ov-list { display: flex; flex-direction: column; gap: 8px; }
.ov-list li { position: relative; padding-left: 14px; font-size: 13px; line-height: 1.55; color: var(--ink-700); }
.ov-list li::before { content: ""; position: absolute; left: 0; top: 8px; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }

.board-summary {
  margin-bottom: 44px;
}
.board-summary-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}
.board-summary-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink-900);
}
.board-summary-more {
  font-size: 13px;
  color: var(--accent-ink);
}
.board-summary-state {
  padding: 28px;
  text-align: center;
  font-size: 14px;
  color: var(--ink-400);
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink-900);
  letter-spacing: -0.02em;
}
.hero-desc {
  margin-top: 8px;
  font-size: 15px;
  color: var(--ink-500);
}
.grid {
  display: grid;
  /* minmax(0, 1fr): 카드 내부의 nowrap 긴 텍스트(max-content)가 컬럼을
     밀어내 그리드가 .page 최대폭을 넘어 오버플로하던 문제 방지 → 위 현황
     섹션과 동일 폭 유지. */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px;
}
.col {
  min-width: 0;
}
@media (max-width: 780px) {
  .grid { grid-template-columns: minmax(0, 1fr); }
}
.col-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.col-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-800);
}
.col-more {
  font-size: 13px;
  color: var(--accent-ink);
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 10px;
}
.doc-card:hover {
  border-color: var(--ink-300);
}
.doc-card-ico {
  width: 18px;
  height: 18px;
  color: var(--ink-400);
  flex-shrink: 0;
}
.doc-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.doc-card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-900);
}
.doc-card-desc {
  font-size: 12px;
  color: var(--ink-400);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hist-date {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent-ink);
  width: 78px;
}

/* 최근 이슈 */
.issues-section {
  margin-bottom: 44px;
}
.issue-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 10px;
}
.issue-card:hover {
  border-color: var(--ink-300);
}
.issue-card-title {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.issue-card-meta {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--ink-400);
  white-space: nowrap;
}
.issue-empty {
  display: block;
  padding: 28px;
  text-align: center;
  font-size: 14px;
  color: var(--ink-400);
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.issue-empty-link:hover {
  color: var(--accent-ink);
  border-color: var(--ink-300);
}
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 9px;
  border-radius: var(--r-full, 999px);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}
.badge.type {
  background: var(--ink-100);
  color: var(--ink-600);
}
.badge.st-open {
  background: var(--accent-soft);
  color: var(--accent-ink);
}
.badge.st-in_progress {
  background: #dbeafe;
  color: #1e40af;
}
.badge.st-resolved {
  background: var(--ink-100);
  color: var(--ink-500);
}
.badge.st-hold {
  background: #fef3c7;
  color: #92400e;
}
@media (max-width: 560px) {
  .issue-card-meta { display: none; }
}
</style>
