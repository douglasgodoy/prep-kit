# Edit Answers Feature — Design Spec

## Overview

Add the ability to edit and delete existing Q&A content in iprep. Two entry points: inline editing on QACard and a dedicated management page.

## Inline Edit on QACard

**Trigger:** Pencil icon button in the top-right corner of each QACard, visible when the card is expanded (answer revealed).

**Edit mode replaces display content with a form:**
- Two columns: EN (left) | PT-BR (right)
- Rows: Question (input), Answer (textarea), Example (textarea, optional)
- Save and Cancel buttons at the bottom

**Behavior:**
- Save calls `onEditQuestion(topicId, questionId, updatedFields)` callback, updating `topics` state in App.jsx
- Cancel reverts to display mode, discards changes
- Subtopic and popularity are not editable here (management page only)

## Management Page

**New component:** `ManagementPage.jsx`

**Layout:**
- Top: Search bar + topic filter dropdown
- Body: Table/list of questions showing subtopic, question (truncated), popularity, topic label
- Each row: Edit button, Delete button

**Edit:** Expands row into inline form with side-by-side EN/PT-BR fields for all fields: question, answer, example, subtopic, popularity. Save/Cancel buttons.

**Delete:** Confirmation dialog ("Delete this question? This cannot be undone."). On confirm, removes the question from the topic's questions array.

**State:** Uses same `topics` state from App.jsx via `onEditQuestion` and `onDeleteQuestion` callbacks.

## Navigation & Routing

- **Top bar:** Gear/list icon navigates to management page, placed next to existing nav elements
- **Dashboard card:** New "Manage Questions" card alongside CV, Job Prep, Review with appropriate icon/color
- **Routing:** New `currentView` value `"management"` renders `ManagementPage` in App.jsx
- **Back navigation:** Back arrow/button to return to dashboard, consistent with other pages

## Data Flow & Persistence

- **Single source of truth:** `topics` state in App.jsx
- **Edit handler:** `handleEditQuestion(topicId, questionId, updatedFields)` in App.jsx — used by both QACard inline edit and ManagementPage
- **Delete handler:** `handleDeleteQuestion(topicId, questionId)` in App.jsx — removes question and cleans up associated SRS data from localStorage
- **No new storage mechanism** — flows through existing `topics` state + `setTopics`
- **i18n:** Edit forms always show both EN and PT-BR fields regardless of current locale, labeled clearly (e.g., "Question (EN)" / "Question (PT-BR)")

## Scope Boundaries

- No bulk operations
- No import/export
- No undo/soft delete — hard delete with confirmation only
- No auto-translate between languages
