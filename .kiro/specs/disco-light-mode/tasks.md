# Implementation Plan: Disco Light Mode

## Overview

All changes are confined to `src/components/SnapDarkMode.astro`. The plan layers the Disco Controller on top of the existing snap detector in five incremental steps: constants → state variables → refactor snap routing → core effect logic → property-based tests. Each step leaves the component in a working state.

## Tasks

- [x] 1. Add Disco Controller constants and state variables
  - At the top of the `<script>` block (after the existing tuning constants), add the five named constants: `BURST_WINDOW_MS = 1500`, `BURST_MIN_COUNT = 2`, `DISCO_TOGGLE_COUNT = 5`, `DISCO_TOGGLE_INTERVAL_MS = 150`, `DISCO_COOLDOWN_MS = 3000`
  - Below the constants, declare the four Disco Controller state variables: `discoActive`, `discoEndTime`, `snapTimestamps`, `fallbackTimer`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2. Implement `rawToggle()` and refactor snap routing to `onSnap()`
  - [x] 2.1 Implement `rawToggle()` helper
    - Add `function rawToggle(): void` that toggles the `dark` class on `document.documentElement` only — no `showToast`, no `localStorage` write
    - _Requirements: 2.4_
  - [x] 2.2 Implement `onSnap()` routing function
    - Add `function onSnap(): void` that: checks cooldown guard (`performance.now() - discoEndTime ≤ DISCO_COOLDOWN_MS` → return), checks active guard (`discoActive` → return), records timestamp in `snapTimestamps`, prunes entries older than `BURST_WINDOW_MS`, counts snaps in window, cancels any pending `fallbackTimer`, if count ≥ `BURST_MIN_COUNT` calls `startDiscoEffect()`, otherwise schedules a `fallbackTimer` after `BURST_WINDOW_MS` that calls `toggleDark()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [x] 2.3 Replace `toggleDark()` call in the detection loop with `onSnap()`
    - In the `loop()` function, change the single line `toggleDark()` to `onSnap()`
    - _Requirements: 1.1_

- [x] 3. Implement `startDiscoEffect()`
  - [x] 3.1 Implement the full `startDiscoEffect()` async function
    - Set `discoActive = true`, clear `snapTimestamps`
    - Record `preDiscoTheme` from `document.documentElement.classList.contains("dark")`
    - Dispatch `disco-effect-start` CustomEvent on `document`
    - Update `toastText.textContent` to `"Disco effect active"` (aria-live region)
    - Check `window.matchMedia("(prefers-reduced-motion: reduce)").matches`; if true, call `rawToggle()` once and jump to restoration
    - Disable CSS transitions: set `document.documentElement.style.transition = "none"`
    - Run `DISCO_TOGGLE_COUNT` iterations of `rawToggle()` with a `setTimeout`-based promise delay of `DISCO_TOGGLE_INTERVAL_MS` between each
    - Re-enable CSS transitions: remove the inline `transition` style from `document.documentElement`
    - Restore `preDiscoTheme`: if `classList.contains("dark") !== preDiscoTheme`, call `rawToggle()`
    - Write `localStorage.setItem("theme", preDiscoTheme ? "dark" : "light")`
    - Call `showToast(preDiscoTheme)`
    - Dispatch `disco-effect-end` CustomEvent on `document`
    - Set `discoActive = false`, set `discoEndTime = performance.now()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 5.1, 5.2, 5.4_

- [x] 4. Checkpoint — verify manual behaviour
  - Ensure all existing TypeScript in the component compiles without errors (run `npx astro check`)
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Set up Vitest and fast-check, write property-based tests
  - [x] 5.1 Install Vitest and fast-check as dev dependencies
    - Run `npm install --save-dev vitest@latest fast-check@latest`
    - Add a `"test"` script to `package.json`: `"vitest --run"`
    - Add a `vitest.config.ts` (or inline config in `astro.config.mjs`) that points to the test directory
    - _Requirements: (testing infrastructure)_
  - [x] 5.2 Write property test for Property 1 — Burst detection window
    - Extract or mock the burst-classification logic (timestamp pruning + count check) as a pure function for testing
    - Generate pairs of timestamps with gap sampled from `[0, BURST_WINDOW_MS)` → assert burst triggered; gap ≥ `BURST_WINDOW_MS` → assert no burst
    - Tag: `// Feature: disco-light-mode, Property 1: Burst detection window`
    - Minimum 100 iterations
    - _Requirements: 1.2, 1.3_
  - [x] 5.3 Write property test for Property 2 — Single-snap fallback
    - Generate a single snap + elapsed time > `BURST_WINDOW_MS` → assert `toggleDark` called exactly once, `startDiscoEffect` not called
    - Tag: `// Feature: disco-light-mode, Property 2: Single-snap fallback`
    - Minimum 100 iterations
    - _Requirements: 1.4_
  - [x] 5.4 Write property test for Property 3 — Theme round-trip
    - Generate random initial theme boolean → run mocked `startDiscoEffect` → assert `classList.contains("dark")` equals initial value after effect
    - Tag: `// Feature: disco-light-mode, Property 3: Theme round-trip`
    - Minimum 100 iterations
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 5.5 Write property test for Property 4 — Exact toggle count
    - Generate random initial theme → run effect with mocked `rawToggle` counter → assert counter equals `DISCO_TOGGLE_COUNT`
    - Tag: `// Feature: disco-light-mode, Property 4: Exact toggle count`
    - Minimum 100 iterations
    - _Requirements: 2.2_
  - [x] 5.6 Write property test for Property 5 — Event gating during active and cooldown states
    - Generate snap events while `discoActive = true` or while `performance.now() - discoEndTime ≤ DISCO_COOLDOWN_MS` → assert no new effect triggered and no `toggleDark` call
    - Tag: `// Feature: disco-light-mode, Property 5: Event gating during active and cooldown states`
    - Minimum 100 iterations
    - _Requirements: 1.5, 1.6_
  - [x] 5.7 Write property test for Property 6 — Toast suppression and single end-toast
    - Generate random initial theme → run effect with mocked `showToast` → assert `showToast` call count = 1 and argument matches restored theme
    - Tag: `// Feature: disco-light-mode, Property 6: Toast suppression and single end-toast`
    - Minimum 100 iterations
    - _Requirements: 2.4, 2.5_
  - [x] 5.8 Write property test for Property 7 — localStorage round-trip
    - Generate random initial theme string → run effect with mocked `localStorage` → assert `localStorage["theme"]` equals pre-effect value after completion and was not written during the toggle sequence
    - Tag: `// Feature: disco-light-mode, Property 7: localStorage round-trip`
    - Minimum 100 iterations
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 5.9 Write property test for Property 8 — Permission invariant
    - Generate any audio event sequence without microphone permission granted → assert `classList` and `localStorage` unchanged
    - Tag: `// Feature: disco-light-mode, Property 8: Permission invariant`
    - Minimum 100 iterations
    - _Requirements: 4.4_
  - [x] 5.10 Write property test for Property 9 — aria-live integrity
    - Generate any sequence of disco operations → assert `aria-live="polite"` attribute preserved on `snap-toast` element and end text matches restored theme
    - Tag: `// Feature: disco-light-mode, Property 9: aria-live integrity`
    - Minimum 100 iterations
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Final checkpoint — Ensure all tests pass
  - Run `npm test` (or `npx vitest --run`) and confirm all property tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All implementation is in `src/components/SnapDarkMode.astro` — no new source files
- Each task references specific requirements for traceability
- Property tests require extracting pure functions from the IIFE for dependency injection (DOM mock, localStorage mock, timer mock)
- The `prefers-reduced-motion` path (single toggle) is covered by the reduced-motion branch in `startDiscoEffect()` — Property 4 tests should only run with reduced-motion inactive
