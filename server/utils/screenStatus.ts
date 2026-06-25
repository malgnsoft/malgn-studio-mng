import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { screenStatus } from '../db/schema'

// 화면 진척 상태 저장소 — 프로덕션 D1(Drizzle), dev(바인딩 없음)은 인메모리 폴백.
// 화면ID 키로 상태/링크 오버라이드만 보관(목록 골격은 정본 screenList).

export interface StatusRow {
  screenId: string
  design: boolean
  publish: boolean
  dev: boolean
  test: boolean
  mockupUrl: string
  devUrl: string
  updatedAt: string | null
}
export type StatusPatch = Partial<Pick<StatusRow, 'design' | 'publish' | 'dev' | 'test' | 'mockupUrl' | 'devUrl'>>

function nowIso(): string { return new Date().toISOString() }

interface StatusRepo {
  all(): Promise<StatusRow[]>
  upsert(id: string, patch: StatusPatch): Promise<StatusRow>
}

// ─── dev 인메모리 폴백 ─────────────────────────────────────
const memStore = new Map<string, StatusRow>()
function applyPatch(prev: StatusRow | undefined, id: string, patch: StatusPatch): StatusRow {
  const base: StatusRow = prev ?? { screenId: id, design: true, publish: false, dev: false, test: false, mockupUrl: '', devUrl: '', updatedAt: null }
  return { ...base, ...patch, screenId: id, updatedAt: nowIso() }
}
const memRepo: StatusRepo = {
  all: () => Promise.resolve([...memStore.values()]),
  upsert: (id, patch) => {
    const row = applyPatch(memStore.get(id), id, patch)
    memStore.set(id, row)
    return Promise.resolve(row)
  },
}

// ─── D1 구현 ──────────────────────────────────────────────
type Db = NonNullable<ReturnType<typeof useDb>>
function d1Repo(db: Db): StatusRepo {
  return {
    all: () => db.select().from(screenStatus).all() as Promise<StatusRow[]>,
    upsert: async (id, patch) => {
      const existing = (await db.select().from(screenStatus).where(eq(screenStatus.screenId, id)).limit(1))[0] as StatusRow | undefined
      const row = applyPatch(existing, id, patch)
      await db.insert(screenStatus).values(row)
        .onConflictDoUpdate({ target: screenStatus.screenId, set: { design: row.design, publish: row.publish, dev: row.dev, test: row.test, mockupUrl: row.mockupUrl, devUrl: row.devUrl, updatedAt: row.updatedAt } })
      return row
    },
  }
}

export function useScreenStatus(event: H3Event): StatusRepo {
  const db = useDb(event)
  return db ? d1Repo(db) : memRepo
}
