# Requirements Document

## Introduction

The Disco Light Mode feature extends the existing `SnapDarkMode` component in the Astro portfolio site. When the Audio Detector identifies multiple snaps or claps in quick succession (a "burst"), the Disco Controller triggers a rapid sequence of dark-mode toggles — 5 times in alternating fashion — to produce a visual disco light effect. After the sequence completes, the theme is restored to the state it was in before the effect began. The feature reuses the existing microphone permission flow and dark-mode toggle mechanism already present in `SnapDarkMode.astro`.

## Glossary

- **Audio_Detector**: The browser-side audio analysis module (currently in `SnapDarkMode.astro`) responsible for capturing microphone input and identifying snap/clap transients.
- **Disco_Controller**: The new logic module responsible for detecting a qualifying burst of snaps/claps and orchestrating the disco light sequence.
- **Disco_Effect**: The visual sequence of 5 rapid dark-mode toggles that creates a strobe/disco appearance.
- **Burst**: Two or more snap/clap events detected within a configurable time window (default: 1500 ms).
- **Toggle_Interval**: The configurable delay between each dark-mode toggle during the Disco Effect (default: 150 ms).
- **Pre_Disco_Theme**: The dark/light state of the page immediately before the Disco Effect begins.
- **Snap_Toast**: The existing on-screen notification element that displays the current theme state.
- **Cooldown_Period**: A configurable duration after a Disco Effect completes during which no new Disco Effect can be triggered (default: 3000 ms).

---

## Requirements

### Requirement 1: Burst Detection

**User Story:** As a visitor, I want the site to recognise when I snap or clap multiple times quickly, so that I can trigger the disco effect intentionally without accidental single-snap activations.

#### Acceptance Criteria

1. WHEN the Audio_Detector registers a snap/clap event, THE Disco_Controller SHALL record the timestamp of that event.
2. WHEN two or more snap/clap events are recorded within 1500 ms of the first event in the sequence, THE Disco_Controller SHALL classify the sequence as a Burst.
3. WHEN a Burst is classified, THE Disco_Controller SHALL trigger the Disco_Effect.
4. WHEN only a single snap/clap is detected and no second event follows within 1500 ms, THE Disco_Controller SHALL allow the existing single-snap dark-mode toggle behaviour to proceed unchanged.
5. WHILE a Disco_Effect is in progress, THE Disco_Controller SHALL ignore all new snap/clap events from the Audio_Detector.
6. WHILE the Cooldown_Period is active after a Disco_Effect completes, THE Disco_Controller SHALL ignore all new snap/clap events from the Audio_Detector.

---

### Requirement 2: Disco Effect Sequence

**User Story:** As a visitor, I want to see a rapid flashing between dark and light mode when I trigger the disco effect, so that I get a fun, disco-light visual experience.

#### Acceptance Criteria

1. WHEN the Disco_Effect is triggered, THE Disco_Controller SHALL record the Pre_Disco_Theme before any toggles occur.
2. WHEN the Disco_Effect is triggered, THE Disco_Controller SHALL toggle the dark-mode class on the root `<html>` element exactly 5 times, with a 150 ms interval between each toggle.
3. WHEN the Disco_Effect sequence completes, THE Disco_Controller SHALL restore the page to the Pre_Disco_Theme.
4. WHEN the Disco_Effect is active, THE Disco_Controller SHALL suppress the Snap_Toast notifications that would normally appear on each individual toggle.
5. WHEN the Disco_Effect completes and the Pre_Disco_Theme is restored, THE Disco_Controller SHALL display a single Snap_Toast notification reflecting the restored theme state.
6. THE Disco_Controller SHALL dispatch a `disco-effect-start` CustomEvent on `document` when the Disco_Effect begins.
7. THE Disco_Controller SHALL dispatch a `disco-effect-end` CustomEvent on `document` when the Disco_Effect completes and the theme is restored.

---

### Requirement 3: Theme Persistence

**User Story:** As a visitor, I want my theme preference to be preserved after the disco effect ends, so that the site returns to the state I had before the effect.

#### Acceptance Criteria

1. WHEN the Disco_Effect completes, THE Disco_Controller SHALL write the Pre_Disco_Theme value to `localStorage` under the key `theme`.
2. WHEN the Disco_Effect is in progress, THE Disco_Controller SHALL NOT write intermediate theme states to `localStorage`.
3. THE Disco_Controller SHALL leave the `localStorage` `theme` key in the same state it was in before the Disco_Effect began, after the effect completes.

---

### Requirement 4: Microphone Permission and Availability

**User Story:** As a visitor, I want the feature to degrade gracefully if microphone access is unavailable, so that the rest of the site continues to work normally.

#### Acceptance Criteria

1. IF the browser does not support `navigator.mediaDevices.getUserMedia`, THEN THE Audio_Detector SHALL log a warning to the browser console and SHALL NOT attempt to initialise the Disco_Controller.
2. IF the user denies microphone permission, THEN THE Audio_Detector SHALL log a warning to the browser console and SHALL NOT initialise the Disco_Controller.
3. IF the microphone stream is lost after initialisation, THEN THE Audio_Detector SHALL stop the detection loop and SHALL log a warning to the browser console.
4. WHILE microphone permission has not been granted, THE Disco_Controller SHALL remain inactive and SHALL NOT affect page theme state.

---

### Requirement 5: Accessibility and User Feedback

**User Story:** As a visitor using assistive technologies, I want to be informed when the disco effect is triggered and when it ends, so that I am not disoriented by the rapid visual changes.

#### Acceptance Criteria

1. WHEN the Disco_Effect begins, THE Disco_Controller SHALL update the `aria-live` region (Snap_Toast) with the text "Disco effect active".
2. WHEN the Disco_Effect ends, THE Disco_Controller SHALL update the `aria-live` region with the text reflecting the restored theme (e.g., "Dark mode on" or "Light mode on").
3. THE Disco_Controller SHALL NOT remove or alter the `aria-live="polite"` attribute on the Snap_Toast element.
4. WHERE the user has enabled the `prefers-reduced-motion` media query, THE Disco_Controller SHALL skip the Disco_Effect sequence and SHALL instead perform a single dark-mode toggle.

---

### Requirement 6: Configuration

**User Story:** As a developer, I want the disco effect parameters to be defined in one place, so that I can tune the behaviour without hunting through the implementation.

#### Acceptance Criteria

1. THE Disco_Controller SHALL read the burst detection window duration from a single named constant (`BURST_WINDOW_MS`, default 1500 ms).
2. THE Disco_Controller SHALL read the number of toggles in the Disco_Effect from a single named constant (`DISCO_TOGGLE_COUNT`, default 5).
3. THE Disco_Controller SHALL read the interval between toggles from a single named constant (`DISCO_TOGGLE_INTERVAL_MS`, default 150 ms).
4. THE Disco_Controller SHALL read the post-effect cooldown duration from a single named constant (`DISCO_COOLDOWN_MS`, default 3000 ms).
5. THE Disco_Controller SHALL read the minimum number of snaps/claps required to form a Burst from a single named constant (`BURST_MIN_COUNT`, default 2).
