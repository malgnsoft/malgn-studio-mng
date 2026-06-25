<script setup lang="ts">
import type { ScreenItem, ScreenArea } from '~/utils/screenList'

useHead({ title: '화면 진척' })

const STAGES = [
  { key: 'design', label: '디자인' },
  { key: 'publish', label: '퍼블리싱' },
  { key: 'dev', label: '개발' },
  { key: 'test', label: '테스트' },
] as const
type StageKey = typeof STAGES[number]['key']

// D1 기반 — 정본 골격 + 저장된 상태/링크 머지(서버에서). 세션 필수(전역 게이트).
const { data } = await useFetch<{ data: ScreenArea[] }>('/api/screens', { key: 'screens' })
const areas = computed(() => data.value?.data ?? [])

const selected = ref<string>('')
watchEffect(() => {
  if (!selected.value && areas.value.length) {
    selected.value = areas.value.find(a => !a.pending)?.key ?? areas.value[0]!.key
  }
})
const current = computed(() => areas.value.find(a => a.key === selected.value))

function countModals(a: ScreenArea): number {
  return a.screens.reduce((n, s) => n + (s.modals?.length ?? 0), 0)
}
function flat(a: ScreenArea): ScreenItem[] {
  return a.screens.flatMap(s => [s, ...(s.modals ?? [])])
}
function pct(items: ScreenItem[], stage: StageKey): number {
  if (!items.length) return 0
  return Math.round((items.filter(i => i[stage] === true).length / items.length) * 100)
}
const grouped = computed(() => {
  const map = new Map<string, ScreenItem[]>()
  for (const s of current.value?.screens ?? []) {
    if (!map.has(s.group)) map.set(s.group, [])
    map.get(s.group)!.push(s)
  }
  return [...map.entries()].map(([group, pages]) => ({ group, pages }))
})

// ── 편집 (D1 저장) ──
const busy = ref<string>('') // 진행 중인 화면ID
async function patch(it: ScreenItem, body: Record<string, unknown>) {
  if (!it.id) return
  busy.value = it.id
  try {
    await $fetch(`/api/screens/${encodeURIComponent(it.id)}`, { method: 'PATCH', body })
    Object.assign(it, body) // 로컬 반영
  }
  catch (e) {
    alert('저장 실패: ' + (e instanceof Error ? e.message : ''))
  }
  finally { busy.value = '' }
}
function toggle(it: ScreenItem, stage: StageKey) {
  patch(it, { [stage]: !it[stage] })
}
function editUrl(it: ScreenItem, field: 'mockupUrl' | 'devUrl') {
  const label = field === 'mockupUrl' ? '목업(퍼블리싱) URL' : '개발 URL'
  const cur = (it[field] as string) || ''
  const v = window.prompt(label, cur)
  if (v === null) return
  patch(it, { [field]: v.trim() })
}
</script>

<template>
  <div class="page">
    <header class="head">
      <h1>화면 진척</h1>
      <p class="sub">영역별 화면 목록과 <b>디자인 · 퍼블리싱(목업) · 개발 · 테스트</b> 진척. 상태를 클릭해 토글(D1 저장),
        링크 칸의 ✎ 로 목업/개발 URL을 입력합니다. 모달은 해당 화면 아래에 함께 표시됩니다.
        화면 골격은 기획 IA(<code>docs/planning/10-IA-FLOWS</code>)에서 도출한 정본입니다.</p>
    </header>

    <!-- 영역(도메인) 탭 -->
    <div class="tabs">
      <button
        v-for="a in areas"
        :key="a.key"
        type="button"
        class="tab"
        :class="{ active: selected === a.key, pending: a.pending }"
        @click="selected = a.key"
      >
        <div class="tab-top">
          <span class="tab-label">{{ a.label }}</span>
          <span v-if="a.pending" class="tab-badge">대기</span>
          <span v-else class="tab-count">{{ a.screens.length }}P · {{ countModals(a) }}M</span>
        </div>
        <div v-if="!a.pending" class="tab-bars">
          <div v-for="s in STAGES" :key="s.key" class="tab-bar">
            <span class="tb-l">{{ s.label }}</span>
            <span class="tb-track"><i :style="{ width: pct(flat(a), s.key) + '%' }" /></span>
            <span class="tb-v">{{ pct(flat(a), s.key) }}%</span>
          </div>
        </div>
        <div v-else class="tab-pending">{{ a.source }}</div>
      </button>
    </div>

    <!-- 선택 영역 상세 -->
    <section v-if="current" class="detail">
      <div class="detail-head">
        <h2>{{ current.label }}</h2>
        <span class="detail-src">{{ current.source }}</span>
      </div>

      <div v-if="current.pending" class="empty">
        화면목록 정본 대기 — 해당 영역 IA를 주시면 같은 방식으로 채웁니다.
      </div>

      <template v-else>
        <div v-for="g in grouped" :key="g.group" class="grp">
          <h3 class="grp-title">{{ g.group }} <span class="n">{{ g.pages.length }}</span></h3>
          <div class="tbl-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th class="c-id">화면ID</th><th class="c-nm">화면명</th>
                  <th v-for="s in STAGES" :key="s.key" class="c-st">{{ s.label }}</th>
                  <th class="c-lk">링크</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(p, pi) in g.pages" :key="g.group + pi">
                  <tr class="row-page">
                    <td class="c-id"><code>{{ p.id }}</code></td>
                    <td class="c-nm">{{ p.name }}</td>
                    <td v-for="s in STAGES" :key="s.key" class="c-st">
                      <button type="button" class="dot" :class="p[s.key] ? 'on' : 'off'"
                        :disabled="busy === p.id" :title="`${s.label} ${p[s.key] ? '완료' : '미완'} (클릭 토글)`"
                        @click="toggle(p, s.key)">{{ p[s.key] ? '✓' : '·' }}</button>
                    </td>
                    <td class="c-lk">
                      <a v-if="p.publish && p.mockupUrl" :href="p.mockupUrl" target="_blank" rel="noopener" class="lk lk-mock">목업</a>
                      <a v-if="p.dev && p.devUrl" :href="p.devUrl" target="_blank" rel="noopener" class="lk lk-dev">개발</a>
                      <button type="button" class="edit" title="목업 URL" @click="editUrl(p, 'mockupUrl')">✎M</button>
                      <button type="button" class="edit" title="개발 URL" @click="editUrl(p, 'devUrl')">✎D</button>
                    </td>
                  </tr>
                  <tr v-for="(m, mi) in (p.modals ?? [])" :key="g.group + pi + 'm' + mi" class="row-modal">
                    <td class="c-id"><code>{{ m.id }}</code></td>
                    <td class="c-nm"><span class="modal-arrow">↳</span><span class="modal-tag">모달</span> {{ m.name }}</td>
                    <td v-for="s in STAGES" :key="s.key" class="c-st">
                      <button type="button" class="dot sm" :class="m[s.key] ? 'on' : 'off'"
                        :disabled="busy === m.id" @click="toggle(m, s.key)">{{ m[s.key] ? '✓' : '·' }}</button>
                    </td>
                    <td class="c-lk">
                      <a v-if="m.publish && m.mockupUrl" :href="m.mockupUrl" target="_blank" rel="noopener" class="lk lk-mock">목업</a>
                      <a v-if="m.dev && m.devUrl" :href="m.devUrl" target="_blank" rel="noopener" class="lk lk-dev">개발</a>
                      <button type="button" class="edit" title="목업 URL" @click="editUrl(m, 'mockupUrl')">✎M</button>
                      <button type="button" class="edit" title="개발 URL" @click="editUrl(m, 'devUrl')">✎D</button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }
.head h1 { font-size: 24px; font-weight: 700; color: var(--ink-900); }
.sub { margin: 6px 0 24px; font-size: 14px; color: var(--ink-500); line-height: 1.6; }
.sub b { color: var(--ink-800); font-weight: 600; }
.sub code { font-family: var(--font-mono); font-size: 12px; color: var(--ink-600); }

.tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 36px; }
@media (max-width: 880px) { .tabs { grid-template-columns: 1fr 1fr; } }
.tab { text-align: left; background: var(--white); border: 1px solid var(--line); border-radius: 12px; padding: 16px; cursor: pointer; transition: border-color .15s, box-shadow .15s; font-family: inherit; }
.tab:hover { border-color: var(--ink-300); }
.tab.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.tab.pending { background: var(--ink-50); }
.tab-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
.tab-label { font-size: 13px; font-weight: 700; color: var(--ink-900); }
.tab-count { font-size: 11px; color: var(--ink-400); font-variant-numeric: tabular-nums; white-space: nowrap; }
.tab-badge { font-size: 10px; font-weight: 700; color: var(--ink-400); background: var(--ink-100); padding: 2px 7px; border-radius: 999px; }
.tab-bars { display: flex; flex-direction: column; gap: 6px; }
.tab-bar { display: grid; grid-template-columns: 48px 1fr 34px; align-items: center; gap: 8px; }
.tb-l { font-size: 11px; color: var(--ink-500); }
.tb-track { height: 6px; background: var(--ink-50); border-radius: 3px; overflow: hidden; }
.tb-track i { display: block; height: 100%; background: var(--accent); border-radius: 3px; transition: width .2s; }
.tb-v { font-size: 11px; color: var(--ink-500); text-align: right; font-variant-numeric: tabular-nums; }
.tab-pending { font-size: 11px; color: var(--ink-400); }

.detail-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid var(--ink-900); }
.detail-head h2 { font-size: 18px; font-weight: 700; color: var(--ink-900); }
.detail-src { font-size: 12px; color: var(--ink-400); }
.empty { padding: 28px; text-align: center; font-size: 13px; color: var(--ink-400); background: var(--white); border: 1px dashed var(--line); border-radius: 12px; }

.grp { margin-bottom: 22px; }
.grp-title { font-size: 14px; font-weight: 700; color: var(--ink-800); margin: 0 0 10px; }
.grp-title .n { font-size: 12px; font-weight: 600; color: var(--ink-400); margin-left: 4px; }
.tbl-wrap { background: var(--white); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl th, .tbl td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid var(--ink-50); text-align: left; }
.tbl th { background: var(--ink-50); font-size: 11px; font-weight: 600; color: var(--ink-500); }
.tbl tr:last-child td { border-bottom: 0; }
.c-id { width: 168px; } .c-id code { font-family: var(--font-mono); font-size: 11px; color: var(--ink-600); }
.c-nm { color: var(--ink-900); font-weight: 500; }
.c-st { width: 78px; text-align: center !important; white-space: nowrap; }
.c-lk { width: 150px; }
.row-modal td { background: var(--ink-50); border-bottom-color: var(--white); }
.row-modal .c-nm { font-weight: 400; color: var(--ink-600); }
.modal-arrow { color: var(--ink-300); margin-right: 6px; }
.modal-tag { font-size: 10px; font-weight: 700; color: var(--accent-ink); background: var(--accent-soft); padding: 2px 6px; border-radius: 4px; }
.dot { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 0; cursor: pointer; font-family: inherit; transition: background .12s; }
.dot.sm { width: 20px; height: 20px; font-size: 11px; }
.dot.on { background: #e9f9e8; color: #16a34a; }
.dot.off { background: var(--ink-50); color: var(--ink-300); }
.dot:hover:not(:disabled) { outline: 2px solid var(--accent-soft); }
.dot:disabled { opacity: .5; cursor: default; }
.row-modal .dot.off { background: var(--white); }
.lk { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; margin-right: 4px; }
.lk-mock { background: var(--accent-soft); color: var(--accent-ink); }
.lk-dev { background: #e9f9e8; color: #16a34a; }
.edit { font-size: 10px; font-weight: 600; color: var(--ink-400); background: var(--ink-50); border: 0; border-radius: 5px; padding: 3px 5px; margin-right: 3px; cursor: pointer; font-family: inherit; }
.edit:hover { color: var(--ink-900); background: var(--ink-100); }
</style>
