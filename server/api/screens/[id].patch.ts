import { getSessionMemberId } from '../../utils/auth'
import { useScreenStatus } from '../../utils/screenStatus'
import type { StatusPatch } from '../../utils/screenStatus'

// 화면 상태/링크 갱신 — 세션 필수. 화면ID별 design·publish·dev·test 토글 + mockupUrl·devUrl.
export default defineEventHandler(async (event) => {
  const memberId = await getSessionMemberId(event)
  if (!memberId) throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다' })

  const id = decodeURIComponent(getRouterParam(event, 'id') ?? '').trim()
  if (!id) throw createError({ statusCode: 400, statusMessage: '화면ID가 없습니다' })

  const b = await readBody(event) ?? {}
  const patch: StatusPatch = {}
  for (const k of ['design', 'publish', 'dev', 'test'] as const) {
    if (typeof b[k] === 'boolean') patch[k] = b[k]
  }
  for (const k of ['mockupUrl', 'devUrl'] as const) {
    if (typeof b[k] === 'string') patch[k] = b[k].trim()
  }
  if (!Object.keys(patch).length) throw createError({ statusCode: 400, statusMessage: '변경할 값이 없습니다' })

  const row = await useScreenStatus(event).upsert(id, patch)
  return { data: row }
})
