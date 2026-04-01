# Edit Answers Feature — Design Spec

## Overview

Add the ability to edit and delete existing Q&A content in iprep. Two entry points: inline editing on QACard and a dedicated management page.

## Inline Edit on QACard

**Trigger:** Pencil icon button in the top-right corner of each QACard, visible when the card is expanded (answer revealed). The button must call `e.stopPropagation()` to avoid toggling the card's reveal state (same pattern as the existing "Show Example" button).

**Where it appears:** QACard inline edit is available in `QuestionList` and `SearchResults` contexts only. It is NOT shown during `ReviewSession` or `JobPrepPage` (editing during review would disrupt the session flow).

**Edit mode replaces display content with a form:**
- Two columns: EN (left) | PT-BR (right)
- Rows: Question (input), Answer (textarea), Example (textarea, optional)
- Save and Cancel buttons at the bottom
- If the user collapses the card while editing, discard changes and exit edit mode

**New props required on QACard:** `topicId` (string), `onEditQuestion` (callback). Parent components `QuestionList` and `SearchResults` must thread these through.

**Behavior:**
- Save calls `onEditQuestion(topicId, questionId, updatedFields)` callback, updating `topics` state in App.jsx
- Cancel reverts to display mode, discards changes
- Subtopic and popularity are not editable here (management page only)

**Validation:** Question (EN) and Answer (EN) are required — cannot be empty. PT-BR fields and Example fields are optional (empty PT-BR falls back to EN on display, matching existing behavior).

## Management Page

**New component:** `ManagementPage.jsx`

**Layout:**
- Top: Search bar + topic filter dropdown
- Body: Table/list of questions showing subtopic, question (truncated), popularity, topic label
- Each row: Edit button, Delete button

**Edit:** Expands row into inline form with side-by-side EN/PT-BR fields for all fields: question, answer, example, subtopic (free text input), popularity (number input, constrained 1-10). Save/Cancel buttons.

**Delete:** Confirmation dialog ("Delete this question? This cannot be undone."). On confirm, removes the question from the topic's questions array and cleans up SRS data using the existing `resetQuestionSRS(questionId)` from `src/srs/storage.js`. The `useSRS` hook state must also be refreshed.

**State:** Uses same `topics` state from App.jsx via `onEditQuestion` and `onDeleteQuestion` callbacks.

**Adding questions:** Not in scope for the management page. Adding remains via the existing FAB + ActionModal flow.

**UI i18n:** All management page chrome (buttons, labels, search placeholder, column headers, confirmation text) must use the existing i18n translation system. New translation keys added to `translations.js`.

## Navigation & Routing

- **Top bar:** Gear/list icon navigates to management page, placed next to existing nav elements
- **Dashboard card:** New "Manage Questions" card alongside CV, Job Prep, Review with appropriate icon/color. Uses the existing `handleSelectTopic` pattern with a special ID `"__management__"`.
- **Routing:** New `view` state value `"management"` renders `ManagementPage` in App.jsx (the app uses `view`/`setView`, not `currentView`)
- **Back navigation:** Back arrow/button to return to dashboard, consistent with other pages

## Data Flow & Persistence

- **Single source of truth:** `topics` state in App.jsx
- **Edit handler:** `handleEditQuestion(topicId, questionId, updatedFields)` in App.jsx — used by both QACard inline edit and ManagementPage
- **Delete handler:** `handleDeleteQuestion(topicId, questionId)` in App.jsx — removes question and cleans up associated SRS data via `resetQuestionSRS()` from `src/srs/storage.js`
- **localStorage persistence:** `topics` state must be persisted to localStorage (e.g., key `iprep_topics_custom`) so that edits and deletes survive page refresh. On init, App.jsx loads from localStorage if present, falling back to `SEED_TOPICS`. Only store the diff/override from seed data, or store the full topics array — implementation decides, but persistence is required.
- **i18n:** Edit forms always show both EN and PT-BR fields regardless of current locale, labeled clearly (e.g., "Question (EN)" / "Question (PT-BR)")

## Scope Boundaries

- No bulk operations
- No import/export
- No undo/soft delete — hard delete with confirmation only
- No auto-translate between languages
- No adding questions from management page (use existing FAB)
- No keyboard accessibility beyond default browser behavior
- Side-by-side form stacks vertically on narrow screens (basic responsive)
