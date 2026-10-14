# Feature Specification: Add Exercise Back (AI)

**Feature Branch**: `add-workout`
**Status**: Implemented (pending user review)
**Input**: "When an exercise is removed, offer a way to add one again. The button (end of the day's list) only appears after the user removed an exercise. It opens a modal where the user describes what they want; the request to Gemini includes the day's other exercises, the chosen workout duration and the other data from the generate-workout form."

## User Scenarios & Testing

### User Story 1 - Add an exercise after removing one (Priority: P1)

After removing an exercise from a day, an "Add exercise" button appears at the end of that day's list. Tapping it opens a sheet with an optional free-text field ("what do you want to add?"). Confirming asks Gemini for ONE new exercise that fits the day and appends it to the end of the day's list, persisted in localStorage.

**Independent Test**: Remove an exercise, tap Add, type "something for biceps, with dumbbells", confirm; a new exercise appears at the end of the day and survives a reload.

**Acceptance Scenarios**:
1. **Given** a day where no exercise was removed, **Then** no Add button is shown.
2. **Given** one exercise was removed from a day, **Then** the Add button is shown for that day only (other days unaffected).
3. **Given** the user adds an exercise, **Then** the button disappears once the day is back to its original number of exercises.
4. **Given** Gemini fails, **Then** the plan is untouched, an error is shown in the sheet and the user can retry.
5. **Given** the description is empty, **Then** the request is still valid and Gemini picks an exercise that fits the day.

### User Story 2 - Context-aware suggestions (Priority: P1)

The request carries the context the user already gave in the generate-workout form (duration, fitness level, goal, location, focus areas, injuries, age, gender, notes) and the names of the exercises already in the day, so the new exercise matches the session length and does not duplicate what is there.

### Edge Cases
- Stored plan without the generate form data (`workoutPreferences` missing or corrupt): the request is sent without that context; the feature still works.
- Generating a new plan resets the "removed" tracking (it lives inside the plan, see FR-006).
- Rest-day strings are never touched.
- Replacing an exercise does not change the removed counter.
- AI text containing characters outside Latin-1 (e.g. en dash, emoji) MUST be persistable (`btoa` throws on them).

## Requirements

- **FR-001**: Each removal MUST be tracked per day; the Add button MUST be visible only for days with at least one tracked removal.
- **FR-002**: The Add button MUST open a modal with an optional description (max 500 chars) and a confirm action.
- **FR-003**: Add MUST call `POST /api/add-exercise`, protected by `withOriginValidation`, with generic client errors (Constitution I, II).
- **FR-004**: The prompt MUST include the day's other exercises, the workout duration, the user description and the form context that is available, in the UI language.
- **FR-005**: The new exercise MUST be appended at the end of the day's list.
- **FR-006**: Removal tracking MUST be stored inside the stored plan under the reserved key `_meta` (`{ removed: { [day]: number } }`) so that generating a new plan resets it and a single write keeps everything consistent. `_meta` MUST never be rendered as a day.
- **FR-007**: The stored plan MUST be serialised as plain JSON (UTF-8 safe); reading MUST remain compatible with the legacy base64 format.
- **FR-008**: All new UI strings MUST exist in `en` and `pt` (Constitution VI).

## Success Criteria
- SC-001: Unit tests cover removal tracking, add, serialisation (incl. non-Latin-1 text), prompt building, request validation and the API handler.
- SC-002: Integration script covers the new route's origin validation and body validation on a production build.
