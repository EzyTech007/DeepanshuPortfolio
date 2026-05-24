# Design Document: Disco Light Mode

## Overview

The Disco Light Mode feature extends the existing `SnapDarkMode.astro` component to detect rapid bursts of snaps or claps (two or more within a configurable window) and respond with a rapid strobe-like sequence of dark/light mode toggles. After the sequence completes, the page theme is restored to its pre-effect state and persisted to `localStorage`.

The implementation lives entirely within `src/components/SnapDarkMode.astro`. No new files, build steps, or dependencies are required. The existing microphone permission flow, audio analysis pipeline, and `toggleDark` function are reused; the new Disco Controller logic is layered on top as an additional state machine that intercepts snap events before they reach the existing single-snap handler.

### Key Design Decisions

- **Single-file extension**: All logic stays in `SnapDarkMode.astro` to avoid introducing a module bundler or import graph for a small script block. The component is already self-contained.
- **Named constants at the top**: All tuning values are declared as `const` at the top of the script block, making them easy to find and adjust.
- **Async timer loop via `setTimeout`**: The disco toggle sequence uses a recursive `setTimeout` chain rather than `setInterval` to avoid timer drift and make cancellation straightforward.
- **No CSS transitions during effect**: The global CSS `transition` on `*` would slow down the strobe effect. The controller temporarily disables transitions on `<html>` during the sequence and restores them afterwards.
- **`prefers-reduced-motion` respected**: Checked once at effect-trigger time via `window.matchMedia`; if active, a single toggle is performed instead of the sequence.

---

## Architecture

The component script contains two cooperating state machines:

```
Microphone → Audio Analysis → [Snap Detector] → [Disco Controller] → DOM / localStorage
```

### Snap Detector (existing)

Unchanged audio analysis pipeline: RMS threshold + high-frequency ratio check + cooldown. On a qualifying snap it now calls `onSnap()` instead of `toggleDark()` directly.

### Disco Controller (new)

Receives every `onSnap()` call and decides what to do:

```
         onSnap()
            │
     ┌──────▼──────┐
     │  COOLDOWN?  │──yes──► ignore
     └──────┬──────┘
            │ no
     ┌──────▼──────┐
     │  ACTIVE?    │──yes──► ignore
     └──────┬──────┘
            │ no
     ┌──────▼──────────────────────────────────┐
     │  Record timestamp, prune old entries    │
     │  Count snaps within BURST_WINDOW_MS     │
     └──────┬──────────────────────────────────┘
            │
     ┌──────▼──────┐
     │ count ≥     │──yes──► startDiscoEffect()
     │ BURST_MIN   │
     └──────┬──────┘
            │ no
            ▼
     Schedule single-snap fallback after BURST_WINDOW_MS
     (cancel if burst fires first)
```

### State Transitions

```
IDLE ──onSnap()──► BURST_PENDING ──burst detected──► ACTIVE ──effect done──► COOLDOWN ──timer──► IDLE
                        │
                        └──window expires, count < min──► IDLE (single toggle fires)
```

---

## Components and Interfaces

### Constants (all at top of `<script>` block)

```typescript
// ── Disco Controller tuning ────────────────────────────────────────────────
const BURST_WINDOW_MS          = 1500;   // ms window to collect snaps for a burst
const BURST_MIN_COUNT          = 2;      // minimum snaps to qualify as a burst
const DISCO_TOGGLE_COUNT       = 5;      // number of dark/light toggles in the effect
const DISCO_TOGGLE_INTERVAL_MS = 150;    // ms between each toggle
const DISCO_COOLDOWN_MS        = 3000;   // ms cooldown after effect before next trigger
```

### `onSnap()` — replaces direct `toggleDark()` call in the detector

Called by the audio detection loop on every qualifying snap event. Routes the event to the Disco Controller.

```typescript
function onSnap(): void
```

### `startDiscoEffect()` — orchestrates the strobe sequence

```typescript
async function startDiscoEffect(): Promise<void>
```

1. Sets `discoActive = true`, clears the snap timestamp buffer.
2. Records `preDiscoTheme` (current `classList.contains("dark")` state).
3. Dispatches `disco-effect-start` CustomEvent on `document`.
4. Updates `aria-live` region text to `"Disco effect active"`.
5. Checks `prefers-reduced-motion`; if active, performs one `rawToggle()` and jumps to step 9.
6. Disables CSS transitions on `<html>`.
7. Runs `DISCO_TOGGLE_COUNT` iterations of `rawToggle()` with `DISCO_TOGGLE_INTERVAL_MS` delay between each (via `setTimeout` promise wrapper).
8. Re-enables CSS transitions on `<html>`.
9. Restores `preDiscoTheme` via `rawToggle()` if needed (no-op if already correct).
10. Writes `preDiscoTheme` to `localStorage["theme"]`.
11. Calls `showToast(preDiscoTheme)` once.
12. Dispatches `disco-effect-end` CustomEvent on `document`.
13. Sets `discoActive = false`, records `discoEndTime = performance.now()`.

### `rawToggle()` — toggle without toast or localStorage side-effects

```typescript
function rawToggle(): void
```

Toggles the `dark` class on `document.documentElement` only. Does not call `showToast`, does not write `localStorage`. Used exclusively during the disco sequence.

### `showToast(dark: boolean)` — existing function, unchanged

### `toggleDark()` — existing function, unchanged

Used only for the single-snap fallback path.

### Disco Controller State Variables

```typescript
let discoActive   = false;
let discoEndTime  = 0;                    // timestamp when last effect ended
let snapTimestamps: number[] = [];        // rolling buffer of recent snap times
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
```

---

## Data Models

### Snap Timestamp Buffer

A plain `number[]` array holding `performance.now()` timestamps of recent snaps. Before each new snap is processed, entries older than `BURST_WINDOW_MS` are pruned from the front. This keeps the buffer small and the burst check O(n) where n ≤ BURST_MIN_COUNT in practice.

### Theme State

Represented as a `boolean` (`true` = dark). Derived from `document.documentElement.classList.contains("dark")` and stored in `localStorage` under the key `"theme"` as the string `"dark"` or `"light"`.

### Controller State Enum (conceptual)

| State | `discoActive` | `discoEndTime` condition | Description |
|---|---|---|---|
| `IDLE` | `false` | `now - discoEndTime > DISCO_COOLDOWN_MS` | Ready to accept snaps |
| `BURST_PENDING` | `false` | — | Collecting snaps, fallback timer running |
| `ACTIVE` | `true` | — | Disco sequence in progress |
| `COOLDOWN` | `false` | `now - discoEndTime ≤ DISCO_COOLDOWN_MS` | Ignoring snaps post-effect |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Burst detection window

*For any* sequence of snap timestamps where two or more fall within `BURST_WINDOW_MS` of the first, the Disco Controller SHALL classify the sequence as a Burst and trigger the Disco Effect.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: Single-snap fallback

*For any* single snap event where no second snap follows within `BURST_WINDOW_MS`, the Disco Controller SHALL invoke the normal single-snap dark-mode toggle exactly once and SHALL NOT trigger the Disco Effect.

**Validates: Requirements 1.4**

---

### Property 3: Theme round-trip

*For any* initial theme state (dark or light), after the Disco Effect completes, the `dark` class on `<html>` SHALL be in the same state it was in before the effect began.

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 4: Exact toggle count

*For any* Disco Effect execution (with `prefers-reduced-motion` inactive), the `dark` class on `<html>` SHALL be toggled exactly `DISCO_TOGGLE_COUNT` times during the sequence (not counting the final restoration step).

**Validates: Requirements 2.2**

---

### Property 5: Event gating during active and cooldown states

*For any* snap events that arrive while `discoActive` is `true` or while `performance.now() - discoEndTime ≤ DISCO_COOLDOWN_MS`, the Disco Controller SHALL ignore those events — no new Disco Effect SHALL be triggered and no single-snap toggle SHALL fire.

**Validates: Requirements 1.5, 1.6**

---

### Property 6: Toast suppression and single end-toast

*For any* Disco Effect execution, `showToast` SHALL NOT be called during the toggle sequence, and SHALL be called exactly once after the effect completes with the argument matching the restored theme state.

**Validates: Requirements 2.4, 2.5**

---

### Property 7: localStorage round-trip

*For any* initial `localStorage["theme"]` value, after the Disco Effect completes, `localStorage["theme"]` SHALL equal the value it held before the effect began, and SHALL NOT have been written during the toggle sequence.

**Validates: Requirements 3.1, 3.2, 3.3**

---

### Property 8: Permission invariant

*For any* sequence of audio events processed without microphone permission having been granted, the `dark` class on `<html>` and `localStorage["theme"]` SHALL remain unchanged.

**Validates: Requirements 4.4**

---

### Property 9: aria-live integrity

*For any* sequence of Disco Controller operations, the `aria-live="polite"` attribute on the Snap_Toast element SHALL be preserved unchanged, and after the effect completes the `aria-live` region text SHALL reflect the restored theme (e.g., "Dark mode on" or "Light mode on").

**Validates: Requirements 5.1, 5.2, 5.3**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `getUserMedia` not supported | `console.warn` + early return; Disco Controller never initialised |
| Microphone permission denied | `console.warn` + early return (existing `try/catch`) |
| Stream lost mid-session | `oninactive` handler on `MediaStream` stops the `requestAnimationFrame` loop and logs a warning |
| `AudioContext` creation fails | Wrapped in `try/catch`; `console.warn` + early return |
| `startDiscoEffect` called while already active | Guard on `discoActive` flag; call is a no-op |
| `prefers-reduced-motion` active | Single toggle instead of sequence; no strobe |

---

## Testing Strategy

### Unit / Example Tests

The script block is a self-contained IIFE. For testing, the core logic should be extractable as pure functions that accept injected dependencies (DOM element, `localStorage` mock, timer mock). Recommended test framework: **Vitest** (already compatible with the Vite-based Astro build).

Example tests to write:

- Burst detected when two snaps arrive within `BURST_WINDOW_MS`
- No burst when second snap arrives after `BURST_WINDOW_MS`
- `disco-effect-start` event dispatched on effect start
- `disco-effect-end` event dispatched on effect end
- `prefers-reduced-motion` active → single toggle, no sequence
- Microphone permission denied → controller inactive
- `getUserMedia` absent → warning logged, no initialisation

### Property-Based Tests

Property-based testing is applicable here because the Disco Controller contains pure decision logic (burst classification, state gating, toggle counting, theme restoration) that varies meaningfully with inputs (timestamps, theme state, snap counts) and where 100+ iterations will surface edge cases that example tests miss.

Recommended library: **[fast-check](https://fast-check.dev/)** (TypeScript-native, works with Vitest).

Each property test MUST run a minimum of **100 iterations**.

Tag format for each test: `// Feature: disco-light-mode, Property N: <property text>`

| Property | Test approach |
|---|---|
| P1: Burst detection window | Generate pairs of timestamps with difference sampled from `[0, BURST_WINDOW_MS)` → assert burst; difference ≥ `BURST_WINDOW_MS` → assert no burst |
| P2: Single-snap fallback | Generate single snap + elapsed time > `BURST_WINDOW_MS` → assert `toggleDark` called once, no disco |
| P3: Theme round-trip | Generate random initial theme (boolean) → run effect → assert final theme equals initial |
| P4: Exact toggle count | Generate random initial theme → run effect → count `rawToggle` calls → assert equals `DISCO_TOGGLE_COUNT` |
| P5: Event gating | Generate snap events during active/cooldown states → assert no effect triggered, no toggle fired |
| P6: Toast suppression | Generate random initial theme → run effect → assert `showToast` call count = 1, called after sequence |
| P7: localStorage round-trip | Generate random initial theme string → run effect → assert `localStorage["theme"]` unchanged from pre-effect value, no writes during sequence |
| P8: Permission invariant | Generate any audio event sequence without permission → assert DOM and localStorage unchanged |
| P9: aria-live integrity | Generate any sequence of disco operations → assert `aria-live="polite"` preserved, end text matches restored theme |

### Integration / Manual Tests

- Load the page in a browser, grant microphone permission, snap twice quickly → verify strobe effect and theme restoration
- Snap once → verify normal dark/light toggle (no strobe)
- Enable OS-level reduced motion → snap twice → verify single toggle only
- Deny microphone permission → verify no effect, no console errors (only the expected warning)
