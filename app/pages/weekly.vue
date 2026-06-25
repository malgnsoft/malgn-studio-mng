<script setup lang="ts">
useHead({ title: '주간 작업' })

interface WItem {
  id: number
  step: number
  group: string
  name: string
  owner: string
  start: string | null
  end: string | null
  progress: number
  note: string | null
  href: string | null
}

const { data, pending, error } = await useFetch<{ data: WItem[] }>('/api/wbs', { key: 'weekly:wbs' })
const items = computed(() => data.value?.data ?? [])

// ── 오늘(KST) ──
function kstToday() { return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10) }
const today = useState('weekly:today', () => kstToday())
onMounted(() => { today.value = kstToday() })

// ── 날짜 유틸(UTC 기준, 순수 YYYY-MM-DD) ──
const ISO = /^\d{4}-\d{2}-\d{2}$/
function isoMonday(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  const dow = (d.getUTCDay() + 6) % 7 // 월=0
  d.setUTCDate(d.getUTCDate() - dow)
  return d.toISOString().slice(0, 10)
}
function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
function md(iso: string) { const p = iso.split('-'); return `${+p[1]!}/${+p[2]!}` }

const thisMonday = computed(() => isoMonday(today.value))
const thisSunday = computed(() => addDays(thisMonday.value, 6))

// ── 구분(티어) ──
function tierOf(group: string): string {
  if (!group) return '기타'
  if (group.startsWith('사용자')) return '사용자단'
  if (group.startsWith('관리자') || group.startsWith('BackOffice')) return '관리자단'
  if (group === 'API 서버') return '백엔드'
  if (group === '설계 및 준비') return '설계·공통'
  return '기타'
}
const TIER_ORDER = ['사용자단', '관리자단', '백엔드', '설계·공통', '기타']
const TIER_META: Record<string, { dot: string }> = {
  '사용자단': { dot: '#2563eb' },
  '관리자단': { dot: '#7c3aed' },
  '백엔드': { dot: '#0d9488' },
  '설계·공통': { dot: '#d97706' },
  '기타': { dot: '#94a3b8' },
}

// ── 담당자 색 ──
const PCOLOR: Record<string, string> = { 김도형: '#2563eb', 김경은: '#7c3aed', 김덕조: '#0d9488', 김양현: '#d97706', 안병훈: '#db2777', 컨설팅팀: '#0891b2' }
function ownerColor(o: string) { return PCOLOR[o] ?? '#94a3b8' }

// ── 필터 ──
const showDone = ref(false)
// owner 한 칸에 여러 명이 올 수 있음("김덕조, 김경은") → 개인 단위로 분해
function splitOwners(owner: string | null | undefined): string[] {
  return (owner ?? '').split(/[,/·&]/).map(s => s.trim()).filter(Boolean)
}
const owners = computed(() => Array.from(new Set(items.value.flatMap(i => splitOwners(i.owner)))).sort())
// 담당은 한 명만 검색(단일 선택). 다중 담당 작업도 그 한 명이 포함되면 매칭
const fOwner = ref<string | null>(null)
function selectOwner(o: string) { fOwner.value = fOwner.value === o ? null : o }

function passes(i: WItem) {
  if (!showDone.value && i.progress >= 100) return false
  if (fOwner.value && !splitOwners(i.owner).includes(fOwner.value)) return false
  return true
}
const scheduled = computed(() =>
  items.value.filter(i => i.start && i.end && ISO.test(i.start) && ISO.test(i.end) && passes(i)),
)

// ── 지연(마감 지남) ──
const overdue = computed(() =>
  scheduled.value.filter(i => i.progress < 100 && i.end! < thisMonday.value)
    .sort((a, b) => (a.end! < b.end! ? -1 : 1)),
)

// ── 주차별(겹치는 항목) — 이번 주 ~ 마지막 마감 주 ──
function tierGroups(list: WItem[]) {
  const m = new Map<string, WItem[]>()
  for (const it of list) {
    const t = tierOf(it.group)
    if (!m.has(t)) m.set(t, [])
    m.get(t)!.push(it)
  }
  return TIER_ORDER.filter(t => m.has(t)).map(t => ({ tier: t, items: m.get(t)! }))
}

const weeks = computed(() => {
  const futureEnds = scheduled.value.map(i => i.end!).filter(e => e >= thisMonday.value)
  if (!futureEnds.length) return []
  const lastMon = isoMonday(futureEnds.reduce((a, b) => (a > b ? a : b)))
  const out: { mon: string, sun: string, current: boolean, groups: { tier: string, items: WItem[] }[], count: number }[] = []
  let m = thisMonday.value
  let guard = 0
  while (m <= lastMon && guard++ < 60) {
    const sun = addDays(m, 6)
    const wk = scheduled.value
      .filter(i => i.start! <= sun && i.end! >= m && !(i.progress < 100 && i.end! < thisMonday.value))
      .sort((a, b) => (a.end! < b.end! ? -1 : a.end! > b.end! ? 1 : a.id - b.id))
    out.push({ mon: m, sun, current: m === thisMonday.value, groups: tierGroups(wk), count: wk.length })
    m = addDays(m, 7)
  }
  return out
})

const thisWeekCount = computed(() => weeks.value.find(w => w.current)?.count ?? 0)

function isDue(i: WItem) { return i.end! >= thisMonday.value && i.end! <= thisSunday.value }
function progressFill(p: number) {
  if (p >= 100) return '#16a34a'
  if (p >= 70) return '#16a34a'
  if (p >= 30) return '#f59e0b'
  if (p > 0) return '#94a3b8'
  return '#cbd5e1'
}
</script>

<template>
  <div class="wk">
    <header class="wk-head">
      <div>
        <h1>주간 작업</h1>
        <p class="sub">WBS 기반 주차별 해야 할 일 · 기준일 <b>{{ today.replace(/-/g, '.') }}</b></p>
      </div>
      <div class="kpis">
        <div class="kpi"><span class="v" :class="{ warn: overdue.length }">{{ overdue.length }}</span><span class="l">지연</span></div>
        <div class="kpi"><span class="v">{{ thisWeekCount }}</span><span class="l">이번 주</span></div>
      </div>
    </header>

    <!-- 필터 -->
    <div class="filters">
      <div class="fgroup">
        <span class="flab">담당</span>
        <button v-for="o in owners" :key="o" class="chip" :data-on="fOwner === o" @click="selectOwner(o)">
          <span class="dot" :style="{ background: ownerColor(o) }" />{{ o }}
        </button>
      </div>
      <label class="toggle">
        <input v-model="showDone" type="checkbox">완료 항목 포함
      </label>
    </div>

    <div v-if="error" class="state">WBS를 불러올 수 없습니다.</div>
    <div v-else-if="pending" class="state">불러오는 중…</div>

    <template v-else>
      <!-- 지연(이월) -->
      <section v-if="overdue.length" class="week week--overdue">
        <div class="week-head">
          <h2><UIcon name="i-lucide-alarm-clock-off" class="ic" />지연 · 이월</h2>
          <span class="cnt">{{ overdue.length }}건 · 마감 지남</span>
        </div>
        <div class="rows">
          <div v-for="it in overdue" :key="it.id" class="row row--over">
            <span class="tier-dot" :style="{ background: TIER_META[tierOf(it.group)]?.dot }" :title="tierOf(it.group)" />
            <div class="bar"><i :style="{ width: it.progress + '%', background: progressFill(it.progress) }" /></div>
            <span class="pct">{{ it.progress }}%</span>
            <span class="name">{{ it.name }}</span>
            <span class="grp">{{ it.group }}</span>
            <span class="who"><span class="ava" :style="{ background: ownerColor(it.owner) }">{{ it.owner?.[0] }}</span>{{ it.owner }}</span>
            <span class="due over">~{{ md(it.end!) }}</span>
          </div>
        </div>
      </section>

      <!-- 주차 카드 -->
      <section v-for="w in weeks" :key="w.mon" class="week" :class="{ 'week--current': w.current }">
        <div class="week-head">
          <h2>
            {{ md(w.mon) }} ~ {{ md(w.sun) }}
            <span v-if="w.current" class="badge-now">이번 주</span>
          </h2>
          <span class="cnt">{{ w.count }}건</span>
        </div>

        <div v-if="!w.count" class="empty">해당 주에 예정된 작업이 없습니다.</div>

        <div v-for="g in w.groups" :key="g.tier" class="tier">
          <div class="tier-head"><span class="tier-dot" :style="{ background: TIER_META[g.tier]?.dot }" />{{ g.tier }} <span class="tc">{{ g.items.length }}</span></div>
          <div class="rows">
            <div v-for="it in g.items" :key="it.id" class="row">
              <div class="bar"><i :style="{ width: it.progress + '%', background: progressFill(it.progress) }" /></div>
              <span class="pct">{{ it.progress }}%</span>
              <span class="name">{{ it.name }}</span>
              <span class="grp">{{ it.group }}</span>
              <span class="who"><span v-for="o in splitOwners(it.owner)" :key="o" class="ava" :class="{ hit: fOwner === o }" :style="{ background: ownerColor(o) }">{{ o[0] }}</span>{{ splitOwners(it.owner).join(', ') }}</span>
              <span class="due" :class="{ thisweek: isDue(it) }">{{ md(it.start!) }}~{{ md(it.end!) }}</span>
            </div>
          </div>
        </div>
      </section>

      <div v-if="!overdue.length && !weeks.length" class="state">조건에 맞는 작업이 없습니다.</div>
    </template>
  </div>
</template>

<style scoped>
.wk { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }
.wk-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.wk-head h1 { font-size: 24px; font-weight: 800; color: var(--ink-900); letter-spacing: -0.02em; }
.sub { margin-top: 6px; font-size: 13px; color: var(--ink-500); } .sub b { color: var(--ink-800); font-weight: 700; }
.kpis { display: flex; gap: 10px; }
.kpi { min-width: 70px; text-align: center; background: var(--white); border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px; }
.kpi .v { display: block; font-size: 22px; font-weight: 800; color: var(--ink-900); font-variant-numeric: tabular-nums; }
.kpi .v.warn { color: #e0524d; }
.kpi .l { font-size: 11px; color: var(--ink-400); font-weight: 600; }

.filters { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 20px; }
.fgroup { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.flab { font-size: 12px; font-weight: 700; color: var(--ink-400); margin-right: 2px; }
.chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px; border-radius: 999px; border: 1px solid var(--line); background: var(--white); color: var(--ink-600); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .12s; }
.chip[data-on="true"] { border-color: var(--ink-900); background: var(--ink-900); color: #fff; }
.chip .dot { width: 7px; height: 7px; border-radius: 50%; }
.toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-600); cursor: pointer; }

.state, .empty { padding: 24px; text-align: center; color: var(--ink-400); font-size: 14px; }
.empty { padding: 14px; font-size: 13px; }

.week { background: var(--white); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; margin-bottom: 14px; }
.week--current { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.week--overdue { border-color: #f6c6c2; background: #fff8f7; }
.week-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.week-head h2 { font-size: 15px; font-weight: 800; color: var(--ink-900); display: inline-flex; align-items: center; gap: 7px; font-variant-numeric: tabular-nums; }
.week-head .ic { width: 16px; height: 16px; color: #e0524d; }
.badge-now { font-size: 10.5px; font-weight: 800; color: var(--accent-ink); background: color-mix(in srgb, var(--accent) 16%, white); padding: 2px 8px; border-radius: 999px; letter-spacing: 0.01em; }
.week-head .cnt { font-size: 12px; color: var(--ink-400); font-weight: 600; }

.tier { margin-top: 10px; }
.tier:first-of-type { margin-top: 0; }
.tier-head { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; color: var(--ink-700); margin-bottom: 6px; }
.tier-head .tc { font-size: 11px; color: var(--ink-300); font-weight: 600; }
.tier-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.rows { display: flex; flex-direction: column; }
.row { display: grid; grid-template-columns: 56px 36px minmax(0, 1fr) auto auto auto; align-items: center; gap: 12px; padding: 7px 8px; border-top: 1px solid var(--ink-50); }
.row:first-child { border-top: 0; }
.row--over { grid-template-columns: 10px 56px 36px minmax(0, 1fr) auto auto auto; }
.bar { height: 5px; border-radius: 3px; background: var(--ink-50); overflow: hidden; }
.bar i { display: block; height: 100%; border-radius: 3px; transition: width .3s; }
.pct { font-size: 11px; font-weight: 700; color: var(--ink-500); font-variant-numeric: tabular-nums; text-align: right; }
.name { font-size: 13.5px; color: var(--ink-900); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.grp { font-size: 11px; color: var(--ink-400); white-space: nowrap; }
.who { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--ink-500); font-weight: 600; white-space: nowrap; }
.ava { width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center; font-size: 9px; font-weight: 800; color: #fff; }
.ava.hit { box-shadow: 0 0 0 1.5px #fff, 0 0 0 3px var(--ink-900, #18181b); }
.due { font-size: 11px; color: var(--ink-400); font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 56px; text-align: right; }
.due.thisweek { color: var(--accent-ink); font-weight: 700; }
.due.over { color: #e0524d; font-weight: 700; }

@media (max-width: 720px) {
  .row, .row--over { grid-template-columns: 44px minmax(0, 1fr) auto; }
  .row .bar, .row--over .tier-dot, .grp, .who { display: none; }
}
</style>
