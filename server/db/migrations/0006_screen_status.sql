-- 화면 진척(/screens) 상태 테이블 — 화면ID별 디자인·퍼블리싱·개발·테스트 + 링크.
-- 적용: pnpm db:apply (wrangler d1 migrations apply malgn-studio-project --remote) 또는
--   wrangler d1 execute malgn-studio-project --remote --file=server/db/migrations/0006_screen_status.sql
-- 스키마 정본은 server/db/schema.ts (screenStatus).
CREATE TABLE IF NOT EXISTS screen_status (
  screen_id text PRIMARY KEY NOT NULL,
  design integer NOT NULL DEFAULT 1,
  publish integer NOT NULL DEFAULT 0,
  dev integer NOT NULL DEFAULT 0,
  test integer NOT NULL DEFAULT 0,
  mockup_url text NOT NULL DEFAULT '',
  dev_url text NOT NULL DEFAULT '',
  updated_at text
);
