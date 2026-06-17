# 디자인 정본 요약

맑은스튜디오 관리 허브의 디자인 시스템 요약이다. 원본(Relay-inspired) 디자인 토큰을 계승하고 **브랜드만 맑은스튜디오**로 둔다. 라이브 토큰 정본은 `app/assets/css/main.css`.

> 작성일: 2026-06-17

## 1. 콘셉트

**Relay-inspired 저밀도 라이트** — Linear·Vercel·Nuxt UI 영감. 무채색 중심에 단일 액센트, 넓은 여백, 그림자 최소화, 1px hairline으로 면을 구분한다.

## 2. 색 — ink 무채색 11단 + 단일 액센트

- **Ink 스케일**(따뜻한 무채색 11단): `--ink-900` … `--ink-50`, 배경 `--paper`(#fafaf9) · `--white`, 구분선 `--line`(#ececec).
- **단일 액센트**: 그린 `--accent`(#00DC82) + `--accent-soft` · `--accent-ink`. 색은 하나만 쓴다(과용 금지).
- **상태색**(보조): success(=accent) · warning · danger · info — soft/line/ink 세트. 강조가 필요한 의미 전달에만 절제해 사용.

## 3. 표면·형태

- **Hairline**: 면 구분은 그림자가 아니라 **1px hairline**(`--line`)으로.
- **그림자**: `--shadow-flat`(none) 기본, `--shadow-soft`·`--shadow-popover`·`--shadow-modal`로 단계만. 평면을 기본값으로.
- **카드 radius**: 12px(부드러운 카드 모서리). 토큰 스케일 `--r-sm`(4) · `--r-md`(6) · `--r-lg`(8) · `--r-full`.
- **레이아웃**: GNB(topbar) 56px, 컨테이너 max 1400px, 패딩 32px.

## 4. 타이포그래피

- 본문/UI: **Inter** + **Pretendard**(한글). 코드/수치: **JetBrains Mono**. 디스플레이 포인트: **Instrument Serif**.
- 폰트 토큰: `--font-sans` · `--font-mono` · `--font-serif`(`nuxt.config.ts` head에서 로드).

## 5. 컴포넌트 규칙

- 자체 컴포넌트 접두사 **`App*`**, Nuxt UI 컴포넌트 **`U*`**.
- 색·간격·radius는 **토큰**으로(하드코딩 지양). `@theme`가 accent·폰트를 Tailwind/Nuxt UI 토큰으로 노출하고, `:root`가 raw 토큰과 backward-compat 별칭을 제공한다.
- `@nuxtjs/tailwindcss` 추가 설치 금지(Nuxt UI v3가 Tailwind v4 내장).

## 6. 브랜드

GNB 로고는 "맑은 · studio · 프로젝트 관리". 디자인 토큰·레이아웃은 원본 계승, 표시 문구만 맑은스튜디오로 둔다. 로고 마크는 `app/components/AppLogoMark.vue`.
