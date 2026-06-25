import { getSessionMemberId } from '../../utils/auth'
import { useScreenStatus } from '../../utils/screenStatus'
import type { StatusRow } from '../../utils/screenStatus'
import { screenAreas } from '../../../app/utils/screenList'
import type { ScreenItem, ScreenArea } from '../../../app/utils/screenList'

// 화면 진척 목록 — 정본(screenList, 읽기전용 골격) + D1 저장 상태/링크 머지.
// 세션 필수(앱 전역 게이트와 동일).
export default defineEventHandler(async (event) => {
  const memberId = await getSessionMemberId(event)
  if (!memberId) throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다' })

  const rows = await useScreenStatus(event).all()
  const map = new Map<string, StatusRow>(rows.map(r => [r.screenId, r]))

  const merge = (it: ScreenItem): ScreenItem => {
    const s = it.id ? map.get(it.id) : undefined
    if (!s) return it
    return { ...it, design: s.design, publish: s.publish, dev: s.dev, test: s.test, mockupUrl: s.mockupUrl, devUrl: s.devUrl }
  }
  const areas: ScreenArea[] = screenAreas.map(a => ({
    ...a,
    screens: a.screens.map(p => ({ ...merge(p), modals: (p.modals ?? []).map(merge) })),
  }))
  return { data: areas }
})
