# Feature Specification: Edit Workout Exercise

**Feature Branch**: `edit-workout`
**Status**: Implemented (pending user review)
**Input**: "Edit a specific exercise of a day (e.g. no leg machine at the gym): remove it or ask Gemini to replace it. Gmail-style swipe on the exercise row reveals trash and edit icons."

## User Scenarios & Testing

### User Story 1 - Remove an exercise (Priority: P1)

The user swipes an exercise row left and taps the trash icon. The exercise disappears from that day and the change is persisted in localStorage. A confirmation modal (Cancel / Remove) MUST appear first to prevent accidental deletion. No API call is made.

**Independent Test**: Swipe a row, tap trash, reload `/workout`; the exercise stays gone.

**Acceptance Scenarios**:
1. **Given** a day with 4 exercises, **When** the user removes the 2nd, **Then** 3 remain, in the original order, and the stored plan reflects it.
2. **Given** a day whose last exercise is removed, **Then** the day stays selectable and shows an empty-day message (the day is not deleted).

### User Story 2 - Replace an exercise with Gemini (Priority: P1)

The user swipes a row and taps the pencil icon. A sheet opens with an optional reason field (e.g. "no machine available"). Confirming asks Gemini for ONE substitute exercise targeting the same muscle group, different from every exercise already in the day. The result replaces the exercise in place and is persisted.

**Acceptance Scenarios**:
1. **Given** a leg exercise, **When** the user replaces it with reason "no machine", **Then** the new exercise keeps the same position and uses no machine.
2. **Given** Gemini fails, **Then** the original exercise is untouched and an error is shown in the sheet with a retry option.
3. **Given** the language is `pt`, **Then** the replacement is in Brazilian Portuguese.

### User Story 3 - Swipe gesture (Priority: P2)

Swiping left on a row reveals the two action icons; swiping right / tapping elsewhere / opening another row closes it. Works with touch and mouse (desktop). Only one row is open at a time.

### Edge Cases
- Stored plan is base64 JSON (`btoa(JSON.stringify(...))`) - the same format MUST be written back.
- Rest-day values (strings, non-arrays) are never touched.
- Replace request while another is in flight is ignored (button disabled).

## Requirements

- **FR-001**: Each exercise row MUST support swipe-left to reveal edit and delete actions.
- **FR-002**: Delete MUST require confirmation in a modal, and MUST only mutate localStorage (`generatedWorkout`), never call the API.
- **FR-003**: Replace MUST call `POST /api/replace-exercise`, protected by `withOriginValidation`.
- **FR-004**: The replacement prompt MUST include the original exercise, the day's other exercises (to avoid duplicates), the optional user reason, and the UI language.
- **FR-005**: Client errors from the API MUST stay generic (Constitution I).
- **FR-006**: All new UI strings MUST exist in `en` and `pt` (Constitution VI).
- **FR-007**: The stored format MUST remain compatible with `/workout` and `/home` readers.

## Success Criteria
- SC-001: Removing an exercise takes one swipe + one tap, zero network calls.
- SC-002: Unit tests cover plan mutation helpers and prompt/response parsing.
