# Edit Answers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow editing and deleting existing Q&A content via inline card editing and a dedicated management page.

**Architecture:** Two entry points share common handlers in App.jsx. QACard gets an edit mode toggle. A new ManagementPage component provides table-based browsing/editing/deleting. Topics state is persisted to localStorage so edits survive refresh.

**Tech Stack:** React 19, Vite 6, CSS (BEM naming), localStorage, custom i18n context

**Spec:** `docs/superpowers/specs/2026-04-01-edit-answers-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/App.jsx` | Modify | Add `handleEditQuestion`, `handleDeleteQuestion`, localStorage persistence for topics, `"management"` route, thread new props |
| `src/srs/useSRS.js` | Modify | Add `removeQuestion` method to clean SRS state in-memory after delete |
| `src/QACard.jsx` | Modify | Add edit mode with side-by-side EN/PT-BR form, pencil icon, `topicId`/`onEditQuestion` props |
| `src/QuestionList.jsx` | Modify | Thread `topicId` and `onEditQuestion` to QACard |
| `src/SearchResults.jsx` | Modify | Thread `topicId` and `onEditQuestion` to QACard |
| `src/ManagementPage.jsx` | Create | Table/list of all questions with search, topic filter, inline edit, delete |
| `src/Dashboard.jsx` | Modify | Add "Manage Questions" special card |
| `src/i18n/translations.js` | Modify | Add translation keys for edit UI and management page |
| `src/App.css` | Modify | Styles for edit mode, management page, confirmation dialog |

---

### Task 1: Add i18n Translation Keys

**Files:**
- Modify: `src/i18n/translations.js:119-121` (EN common section) and `238-240` (PT-BR common section)

- [ ] **Step 1: Add new translation keys to EN section**

Add these keys before the closing `},` of the EN object (after `"common.cancel"`):

```javascript
// Edit
"edit.pencilTitle": "Edit this question",
"edit.questionEN": "Question (EN)",
"edit.questionPT": "Question (PT-BR)",
"edit.answerEN": "Answer (EN)",
"edit.answerPT": "Answer (PT-BR)",
"edit.exampleEN": "Example (EN)",
"edit.examplePT": "Example (PT-BR)",
"edit.subtopic": "Subtopic",
"edit.popularity": "Popularity (1-10)",
"edit.requiredField": "This field is required",

// Management
"manage.title": "Manage Questions",
"manage.subtitle": "Edit, search, and delete questions across all topics",
"manage.searchPlaceholder": "Search questions...",
"manage.allTopics": "All Topics",
"manage.noResults": "No questions match your filters",
"manage.deleteConfirm": "Delete this question? This cannot be undone.",
"manage.deleted": "Question deleted",
"manage.deleteAction": "Delete",
"manage.saved": "Changes saved",

// Dashboard card
"card.manage.label": "Manage",
"card.manage.desc": "Edit, delete, and manage all your questions",
```

- [ ] **Step 2: Add corresponding PT-BR translation keys**

Add these keys before the closing `},` of the PT-BR object:

```javascript
// Edit
"edit.pencilTitle": "Editar esta pergunta",
"edit.questionEN": "Pergunta (EN)",
"edit.questionPT": "Pergunta (PT-BR)",
"edit.answerEN": "Resposta (EN)",
"edit.answerPT": "Resposta (PT-BR)",
"edit.exampleEN": "Exemplo (EN)",
"edit.examplePT": "Exemplo (PT-BR)",
"edit.subtopic": "Subtópico",
"edit.popularity": "Popularidade (1-10)",
"edit.requiredField": "Este campo é obrigatório",

// Management
"manage.title": "Gerenciar Perguntas",
"manage.subtitle": "Edite, busque e exclua perguntas de todos os tópicos",
"manage.searchPlaceholder": "Buscar perguntas...",
"manage.allTopics": "Todos os Tópicos",
"manage.noResults": "Nenhuma pergunta corresponde aos filtros",
"manage.deleteConfirm": "Excluir esta pergunta? Esta ação não pode ser desfeita.",
"manage.deleted": "Pergunta excluída",
"manage.deleteAction": "Excluir",
"manage.saved": "Alterações salvas",

// Dashboard card
"card.manage.label": "Gerenciar",
"card.manage.desc": "Edite, exclua e gerencie todas as suas perguntas",
```

- [ ] **Step 3: Verify the app still loads**

Run: `npm run dev` and open browser — app should load without errors.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations.js
git commit -m "feat: add i18n keys for edit and management features"
```

---

### Task 2: Add localStorage Persistence for Topics + Edit/Delete Handlers in App.jsx

**Files:**
- Modify: `src/App.jsx:1-89`

- [ ] **Step 1: Add topics persistence to localStorage**

At the top of `App.jsx`, add a storage key constant and update the `useState` initializer:

```javascript
const TOPICS_STORAGE_KEY = "iprep_topics";
```

Replace the `useState(SEED_TOPICS)` on line 16 with:

```javascript
const [topics, setTopics] = useState(() => {
  try {
    const saved = localStorage.getItem(TOPICS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : SEED_TOPICS;
  } catch {
    return SEED_TOPICS;
  }
});
```

Add a `useEffect` right after the existing `useEffect(() => setMounted(true), [])` on line 28:

```javascript
useEffect(() => {
  localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
}, [topics]);
```

- [ ] **Step 2: Add handleEditQuestion function**

Add after the `handleAddQuestions` function (after line 89):

```javascript
function handleEditQuestion(topicId, questionId, updatedFields) {
  setTopics((prev) =>
    prev.map((t) =>
      t.id === topicId
        ? {
            ...t,
            questions: t.questions.map((q) =>
              q.id === questionId ? { ...q, ...updatedFields } : q
            ),
          }
        : t
    )
  );
}
```

- [ ] **Step 3: Add `removeQuestion` method to useSRS hook**

In `src/srs/useSRS.js`, add a `removeQuestion` callback that clears SRS data from both localStorage AND the hook's in-memory state. Add after the `getIntervalPreviews` callback:

```javascript
const removeQuestion = useCallback((questionId) => {
  resetQuestionSRS(questionId);
  setSrsData((prev) => {
    const next = { ...prev };
    delete next[questionId];
    return next;
  });
}, []);
```

Import `resetQuestionSRS` at the top of `useSRS.js`:

```javascript
import { loadSRSData, updateQuestionSRS, recordSession, loadStats, resetQuestionSRS } from "./storage.js";
```

Add `removeQuestion` to the returned object:

```javascript
return {
  srsData,
  stats,
  getQueues,
  rateQuestion,
  endSession,
  getStatus,
  getIntervalPreviews,
  getTotalDue,
  removeQuestion,
};
```

- [ ] **Step 4: Add handleDeleteQuestion function in App.jsx**

Add after `handleEditQuestion`. This uses `srs.removeQuestion` to clean up SRS data in both localStorage and React state:

```javascript
function handleDeleteQuestion(topicId, questionId) {
  setTopics((prev) =>
    prev.map((t) =>
      t.id === topicId
        ? { ...t, questions: t.questions.filter((q) => q.id !== questionId) }
        : t
    )
  );
  srs.removeQuestion(questionId);
}
```

- [ ] **Step 5: Add management route handler in handleSelectTopic**

In the `handleSelectTopic` function, add a block for `"__management__"` before the existing `setActiveTopicId(id)` line:

```javascript
if (id === "__management__") {
  setView("management");
  setSearchQuery("");
  return;
}
```

- [ ] **Step 6: Verify the app loads, data persists after refresh**

Run: `npm run dev`, add a question via FAB, refresh the page. The added question should still appear.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/srs/useSRS.js
git commit -m "feat: add topics persistence, edit/delete handlers, management route"
```

---

### Task 3: Add Inline Edit Mode to QACard

**Files:**
- Modify: `src/QACard.jsx`

- [ ] **Step 1: Replace QACard.jsx with updated version**

**This is a full file replacement.** Replace the entire contents of `src/QACard.jsx` with the following:

```jsx
import { useState } from "react";
import { getDiagram } from "./Diagrams";
import { useI18n } from "./i18n/I18nContext.jsx";

export default function QACard({ item, index, topicColor, topicLabel, showTopic, delay = 0, srsStatus, topicId, onEditQuestion }) {
  const [revealed, setRevealed] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const { t, locale } = useI18n();
  const isPt = locale === "pt-BR";
  const question = (isPt && item.question_pt) || item.question;
  const answer = (isPt && item.answer_pt) || item.answer;
  const example = (isPt && item.example_pt) || item.example;
  const diagram = getDiagram(item.id);
  const hasVisuals = example || diagram;

  function startEditing(e) {
    e.stopPropagation();
    setEditForm({
      question: item.question || "",
      question_pt: item.question_pt || "",
      answer: item.answer || "",
      answer_pt: item.answer_pt || "",
      example: item.example || "",
      example_pt: item.example_pt || "",
    });
    setEditing(true);
  }

  function cancelEditing(e) {
    e.stopPropagation();
    setEditing(false);
  }

  function saveEditing(e) {
    e.stopPropagation();
    if (!editForm.question.trim() || !editForm.answer.trim()) return;
    onEditQuestion(topicId, item.id, editForm);
    setEditing(false);
  }

  function handleFieldChange(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCardClick() {
    if (editing) return;
    if (!revealed) {
      setRevealed(true);
    } else {
      setRevealed(false);
      setEditing(false);
    }
  }

  return (
    <div
      className={`qa-card ${revealed ? "qa-card--open" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={handleCardClick}
    >
      <div className="qa-card__index">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="qa-card__body">
        <div className="qa-card__meta">
          {showTopic && (
            <span
              className="qa-card__topic-badge"
              style={{ borderColor: topicColor, color: topicColor }}
            >
              {topicLabel}
            </span>
          )}
          <span className="qa-card__subtopic">{item.subtopic}</span>
          {item.popularity && (
            <span className="qa-card__popularity" title="Popularity rating">
              {item.popularity}/10
            </span>
          )}
          {srsStatus && (
            <span className={`qa-card__srs-badge qa-card__srs-badge--${srsStatus === "due" ? "due" : srsStatus === "new" ? "new" : "scheduled"}`}>
              {srsStatus === "due" ? t("srs.due") : srsStatus === "new" ? t("srs.new") : srsStatus}
            </span>
          )}
          {revealed && onEditQuestion && !editing && (
            <button
              className="qa-card__edit-btn"
              onClick={startEditing}
              title={t("edit.pencilTitle")}
            >
              ✎
            </button>
          )}
        </div>

        {editing ? (
          <div className="qa-card__edit-form" onClick={(e) => e.stopPropagation()}>
            <div className="qa-card__edit-row">
              <label className="qa-card__edit-label">{t("edit.questionEN")}</label>
              <label className="qa-card__edit-label">{t("edit.questionPT")}</label>
            </div>
            <div className="qa-card__edit-row">
              <input
                className="qa-card__edit-input"
                value={editForm.question}
                onChange={(e) => handleFieldChange("question", e.target.value)}
              />
              <input
                className="qa-card__edit-input"
                value={editForm.question_pt}
                onChange={(e) => handleFieldChange("question_pt", e.target.value)}
              />
            </div>

            <div className="qa-card__edit-row">
              <label className="qa-card__edit-label">{t("edit.answerEN")}</label>
              <label className="qa-card__edit-label">{t("edit.answerPT")}</label>
            </div>
            <div className="qa-card__edit-row">
              <textarea
                className="qa-card__edit-textarea"
                rows={4}
                value={editForm.answer}
                onChange={(e) => handleFieldChange("answer", e.target.value)}
              />
              <textarea
                className="qa-card__edit-textarea"
                rows={4}
                value={editForm.answer_pt}
                onChange={(e) => handleFieldChange("answer_pt", e.target.value)}
              />
            </div>

            <div className="qa-card__edit-row">
              <label className="qa-card__edit-label">{t("edit.exampleEN")}</label>
              <label className="qa-card__edit-label">{t("edit.examplePT")}</label>
            </div>
            <div className="qa-card__edit-row">
              <textarea
                className="qa-card__edit-textarea"
                rows={3}
                value={editForm.example}
                onChange={(e) => handleFieldChange("example", e.target.value)}
              />
              <textarea
                className="qa-card__edit-textarea"
                rows={3}
                value={editForm.example_pt}
                onChange={(e) => handleFieldChange("example_pt", e.target.value)}
              />
            </div>

            {!editForm.question.trim() || !editForm.answer.trim() ? (
              <div className="qa-card__edit-error">{t("edit.requiredField")}</div>
            ) : null}

            <div className="qa-card__edit-actions">
              <button className="qa-card__edit-save" onClick={saveEditing} style={{ background: topicColor }}>
                {t("common.save")}
              </button>
              <button className="qa-card__edit-cancel" onClick={cancelEditing}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="qa-card__question">{question}</div>
            {revealed && (
              <div className="qa-card__answer">
                <div className="qa-card__answer-label">{t("qaCard.answerLabel")}</div>
                {answer}

                {hasVisuals && (
                  <div className="qa-card__visuals" onClick={(e) => e.stopPropagation()}>
                    <button
                      className={`qa-card__example-btn ${showExample ? "qa-card__example-btn--active" : ""}`}
                      onClick={() => setShowExample((v) => !v)}
                      style={{ borderColor: showExample ? topicColor : undefined, color: showExample ? topicColor : undefined }}
                    >
                      <span className="qa-card__example-btn-icon">{showExample ? "▾" : "▸"}</span>
                      {isPt ? "Ver Exemplo" : "Show Example"}
                    </button>

                    {showExample && (
                      <div className="qa-card__example-content">
                        {example && (
                          <pre className="qa-card__code">{example}</pre>
                        )}
                        {diagram && (
                          <div className="qa-card__diagram">
                            {diagram}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div
        className="qa-card__toggle"
        style={{ color: revealed ? topicColor : undefined }}
      >
        <span className={`qa-card__arrow ${revealed ? "qa-card__arrow--up" : ""}`}>
          ↓
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify QACard renders normally (without edit props)**

Run: `npm run dev`, open a topic, click cards to expand. They should work exactly as before since `onEditQuestion` is undefined (pencil icon won't show). Note: edit form styles are added in Task 7 — functional verification only at this stage.

- [ ] **Step 3: Commit**

```bash
git add src/QACard.jsx
git commit -m "feat: add inline edit mode to QACard"
```

---

### Task 4: Thread Edit Props Through QuestionList and SearchResults

**Files:**
- Modify: `src/QuestionList.jsx`
- Modify: `src/SearchResults.jsx`
- Modify: `src/App.jsx:154-159` (view rendering)

- [ ] **Step 1: Update QuestionList to accept and pass edit props**

Update `QuestionList.jsx` — add `onEditQuestion` to props and pass `topicId` + `onEditQuestion` to each QACard:

```jsx
import QACard from "./QACard.jsx";
import { useI18n } from "./i18n/I18nContext.jsx";

export default function QuestionList({ topic, onBack, getStatus, onEditQuestion }) {
  const { t } = useI18n();

  return (
    <div className="question-list">
      <button className="question-list__back" onClick={onBack}>
        {t("questionList.back")}
      </button>
      <div className="question-list__header">
        <span className="question-list__icon" style={{ color: topic.color }}>
          {topic.icon}
        </span>
        <div>
          <h1 className="question-list__title">{topic.label}</h1>
          <span className="question-list__count">
            {topic.questions.length} {t("questionList.questions")}
          </span>
        </div>
      </div>
      <div className="cards">
        {topic.questions.map((q, i) => (
          <QACard
            key={q.id}
            item={q}
            index={i}
            topicColor={topic.color}
            delay={i * 50}
            srsStatus={getStatus ? getStatus(q.id) : null}
            topicId={topic.id}
            onEditQuestion={onEditQuestion}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update SearchResults to accept and pass edit props**

Update `SearchResults.jsx` — add `onEditQuestion` to props and pass to QACard in both grouped and flat views:

In the component signature, add `onEditQuestion`:

```jsx
export default function SearchResults({ query, topics, onEditQuestion }) {
```

In the grouped view QACard (around line 90), add:

```jsx
<QACard
  key={q.id}
  item={q}
  index={i}
  topicColor={group.color}
  delay={i * 50}
  topicId={topicId}
  onEditQuestion={onEditQuestion}
/>
```

In the flat view QACard (around line 104), add:

```jsx
<QACard
  key={q.id}
  item={q}
  index={i}
  topicColor={q.topicColor}
  topicLabel={q.topicLabel}
  showTopic
  delay={i * 40}
  topicId={q.topicId}
  onEditQuestion={onEditQuestion}
/>
```

- [ ] **Step 3: Update App.jsx to pass edit handler to QuestionList and SearchResults**

In `App.jsx`, update the QuestionList rendering (line 155):

```jsx
{view === "topic" && activeTopic && (
  <QuestionList topic={activeTopic} onBack={handleBack} getStatus={srs.getStatus} onEditQuestion={handleEditQuestion} />
)}
```

Update the SearchResults rendering (line 158):

```jsx
{view === "search" && (
  <SearchResults query={searchQuery} topics={topics} onEditQuestion={handleEditQuestion} />
)}
```

- [ ] **Step 4: Verify inline editing works end-to-end**

Run: `npm run dev`, open a topic, expand a card, click the pencil icon, edit a field, save. Verify the change persists after refresh.

- [ ] **Step 5: Commit**

```bash
git add src/QuestionList.jsx src/SearchResults.jsx src/App.jsx
git commit -m "feat: thread edit props to QACard in QuestionList and SearchResults"
```

---

### Task 5: Create ManagementPage Component

**Files:**
- Create: `src/ManagementPage.jsx`

- [ ] **Step 1: Create the ManagementPage component**

```jsx
import { useState } from "react";
import { useI18n } from "./i18n/I18nContext.jsx";

export default function ManagementPage({ topics, onEditQuestion, onDeleteQuestion, onBack }) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Flatten all questions with topic info
  const allQuestions = [];
  for (const tp of topics) {
    if (topicFilter !== "all" && tp.id !== topicFilter) continue;
    for (const q of tp.questions) {
      allQuestions.push({ ...q, topicId: tp.id, topicLabel: tp.label, topicColor: tp.color });
    }
  }

  // Filter by search
  const lowerSearch = search.toLowerCase();
  const filtered = lowerSearch
    ? allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(lowerSearch) ||
          q.answer.toLowerCase().includes(lowerSearch) ||
          q.subtopic.toLowerCase().includes(lowerSearch) ||
          q.topicLabel.toLowerCase().includes(lowerSearch)
      )
    : allQuestions;

  function startEdit(q) {
    setEditingId(q.id);
    setEditForm({
      question: q.question || "",
      question_pt: q.question_pt || "",
      answer: q.answer || "",
      answer_pt: q.answer_pt || "",
      example: q.example || "",
      example_pt: q.example_pt || "",
      subtopic: q.subtopic || "",
      popularity: q.popularity || 5,
    });
  }

  function saveEdit(topicId, questionId) {
    if (!editForm.question.trim() || !editForm.answer.trim()) return;
    const pop = Math.min(10, Math.max(1, Number(editForm.popularity) || 5));
    onEditQuestion(topicId, questionId, { ...editForm, popularity: pop });
    setEditingId(null);
  }

  function confirmDelete(q) {
    setDeleteConfirm(q);
  }

  function executeDelete() {
    if (!deleteConfirm) return;
    onDeleteQuestion(deleteConfirm.topicId, deleteConfirm.id);
    setDeleteConfirm(null);
  }

  function handleFieldChange(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="management">
      <button className="management__back" onClick={onBack}>
        {t("questionList.back")}
      </button>

      <div className="management__header">
        <h1 className="management__title">{t("manage.title")}</h1>
        <p className="management__subtitle">{t("manage.subtitle")}</p>
      </div>

      <div className="management__controls">
        <div className="management__search">
          <span className="management__search-icon">⌕</span>
          <input
            className="management__search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("manage.searchPlaceholder")}
          />
          {search && (
            <button className="management__search-clear" onClick={() => setSearch("")}>×</button>
          )}
        </div>
        <select
          className="management__filter"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
        >
          <option value="all">{t("manage.allTopics")}</option>
          {topics.map((tp) => (
            <option key={tp.id} value={tp.id}>{tp.label}</option>
          ))}
        </select>
      </div>

      <div className="management__count">
        {filtered.length} {t("header.questions")}
      </div>

      {filtered.length === 0 ? (
        <div className="management__empty">{t("manage.noResults")}</div>
      ) : (
        <div className="management__list">
          {filtered.map((q) => (
            <div key={q.id} className="management__row">
              {editingId === q.id ? (
                <div className="management__edit-form">
                  <div className="management__edit-row">
                    <label className="management__edit-label">{t("edit.questionEN")}</label>
                    <label className="management__edit-label">{t("edit.questionPT")}</label>
                  </div>
                  <div className="management__edit-row">
                    <input
                      className="management__edit-input"
                      value={editForm.question}
                      onChange={(e) => handleFieldChange("question", e.target.value)}
                    />
                    <input
                      className="management__edit-input"
                      value={editForm.question_pt}
                      onChange={(e) => handleFieldChange("question_pt", e.target.value)}
                    />
                  </div>

                  <div className="management__edit-row">
                    <label className="management__edit-label">{t("edit.answerEN")}</label>
                    <label className="management__edit-label">{t("edit.answerPT")}</label>
                  </div>
                  <div className="management__edit-row">
                    <textarea
                      className="management__edit-textarea"
                      rows={4}
                      value={editForm.answer}
                      onChange={(e) => handleFieldChange("answer", e.target.value)}
                    />
                    <textarea
                      className="management__edit-textarea"
                      rows={4}
                      value={editForm.answer_pt}
                      onChange={(e) => handleFieldChange("answer_pt", e.target.value)}
                    />
                  </div>

                  <div className="management__edit-row">
                    <label className="management__edit-label">{t("edit.exampleEN")}</label>
                    <label className="management__edit-label">{t("edit.examplePT")}</label>
                  </div>
                  <div className="management__edit-row">
                    <textarea
                      className="management__edit-textarea"
                      rows={3}
                      value={editForm.example}
                      onChange={(e) => handleFieldChange("example", e.target.value)}
                    />
                    <textarea
                      className="management__edit-textarea"
                      rows={3}
                      value={editForm.example_pt}
                      onChange={(e) => handleFieldChange("example_pt", e.target.value)}
                    />
                  </div>

                  <div className="management__edit-row">
                    <div className="management__edit-field">
                      <label className="management__edit-label">{t("edit.subtopic")}</label>
                      <input
                        className="management__edit-input"
                        value={editForm.subtopic}
                        onChange={(e) => handleFieldChange("subtopic", e.target.value)}
                      />
                    </div>
                    <div className="management__edit-field">
                      <label className="management__edit-label">{t("edit.popularity")}</label>
                      <input
                        className="management__edit-input"
                        type="number"
                        min={1}
                        max={10}
                        value={editForm.popularity}
                        onChange={(e) => handleFieldChange("popularity", e.target.value)}
                      />
                    </div>
                  </div>

                  {!editForm.question.trim() || !editForm.answer.trim() ? (
                    <div className="management__edit-error">{t("edit.requiredField")}</div>
                  ) : null}

                  <div className="management__edit-actions">
                    <button
                      className="management__edit-save"
                      onClick={() => saveEdit(q.topicId, q.id)}
                    >
                      {t("common.save")}
                    </button>
                    <button
                      className="management__edit-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="management__row-content">
                  <div className="management__row-topic" style={{ color: q.topicColor }}>
                    {q.topicLabel}
                  </div>
                  <div className="management__row-subtopic">{q.subtopic}</div>
                  <div className="management__row-question">{q.question}</div>
                  <div className="management__row-popularity">{q.popularity}/10</div>
                  <div className="management__row-actions">
                    <button className="management__btn-edit" onClick={() => startEdit(q)}>
                      ✎
                    </button>
                    <button className="management__btn-delete" onClick={() => confirmDelete(q)}>
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="management__overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="management__dialog" onClick={(e) => e.stopPropagation()}>
            <p className="management__dialog-text">{t("manage.deleteConfirm")}</p>
            <div className="management__dialog-actions">
              <button className="management__dialog-delete" onClick={executeDelete}>
                {t("manage.deleteAction")}
              </button>
              <button className="management__dialog-cancel" onClick={() => setDeleteConfirm(null)}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify file was created correctly**

Run: `ls src/ManagementPage.jsx` — file should exist.

- [ ] **Step 3: Commit**

```bash
git add src/ManagementPage.jsx
git commit -m "feat: create ManagementPage component"
```

---

### Task 6: Add Navigation — Dashboard Card + Header Icon + Route Wiring

**Files:**
- Modify: `src/Dashboard.jsx:6-31`
- Modify: `src/App.jsx:105-198`

- [ ] **Step 1: Add management special card to Dashboard**

In `Dashboard.jsx`, add a new entry to the `specialCards` array after the review card:

```javascript
{
  id: "__management__",
  label: t("card.manage.label"),
  icon: "⚙",
  color: "#64748b",
  description: t("card.manage.desc"),
  type: "special",
},
```

- [ ] **Step 2: Add header management icon in App.jsx**

In `App.jsx`, inside the `<header>` element, add a management button after the language toggle button (after line 141):

```jsx
<button
  className="header__manage"
  onClick={() => { setSearchQuery(""); setView("management"); }}
  title={t("manage.title")}
>
  ⚙
</button>
```

- [ ] **Step 3: Wire the management route in App.jsx**

Import ManagementPage at the top of App.jsx:

```javascript
import ManagementPage from "./ManagementPage.jsx";
```

In the content div, add the management view rendering after the reviewsession block (before the closing `</div>` of the content div):

```jsx
{view === "management" && (
  <ManagementPage
    topics={topics}
    onEditQuestion={handleEditQuestion}
    onDeleteQuestion={handleDeleteQuestion}
    onBack={handleBack}
  />
)}
```

- [ ] **Step 4: Verify navigation works**

Run: `npm run dev`. Check:
1. Dashboard shows "Manage" card — clicking it opens ManagementPage
2. Header gear icon opens ManagementPage
3. Back button returns to dashboard
4. Edit and delete work on the management page

- [ ] **Step 5: Commit**

```bash
git add src/Dashboard.jsx src/App.jsx src/ManagementPage.jsx
git commit -m "feat: add management navigation via dashboard card and header icon"
```

---

### Task 7: Add CSS Styles

**Files:**
- Modify: `src/App.css` (append at end)

- [ ] **Step 1: Add QACard edit mode styles**

Append to `App.css`:

```css
/* ── QACard edit mode ── */
.qa-card__edit-btn {
  background: none;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
  transition: all 0.2s var(--ease-out);
}
.qa-card__edit-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-medium);
  background: var(--bg-hover);
}

.qa-card__edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}
.qa-card__edit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.qa-card__edit-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.qa-card__edit-input,
.qa-card__edit-textarea {
  background: var(--bg-deep);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 0.9rem;
  padding: 8px 10px;
  width: 100%;
  transition: border-color 0.2s;
}
.qa-card__edit-input:focus,
.qa-card__edit-textarea:focus {
  outline: none;
  border-color: var(--accent);
}
.qa-card__edit-textarea {
  resize: vertical;
  min-height: 60px;
}
.qa-card__edit-error {
  color: var(--danger);
  font-size: 0.8rem;
}
.qa-card__edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.qa-card__edit-save,
.qa-card__edit-cancel {
  padding: 6px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 500;
  transition: opacity 0.2s;
}
.qa-card__edit-save {
  color: var(--bg-deep);
  background: var(--accent);
}
.qa-card__edit-save:hover { opacity: 0.85; }
.qa-card__edit-cancel {
  color: var(--text-secondary);
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
}
.qa-card__edit-cancel:hover { color: var(--text-primary); }

@media (max-width: 600px) {
  .qa-card__edit-row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Add header manage button style**

Append to `App.css`:

```css
/* ── header manage icon ── */
.header__manage {
  background: none;
  border: 1px solid var(--border-dim);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s var(--ease-out);
}
.header__manage:hover {
  color: var(--text-primary);
  border-color: var(--border-medium);
  background: var(--bg-hover);
}
```

- [ ] **Step 3: Add ManagementPage styles**

Append to `App.css`:

```css
/* ── management page ── */
.management {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}
.management__back {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.95rem;
  padding: 8px 0;
  transition: color 0.2s;
}
.management__back:hover { color: var(--text-primary); }

.management__header {
  margin-bottom: 24px;
}
.management__title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.management__subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.management__controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.management__search {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.management__search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-tertiary);
  font-size: 1.1rem;
  pointer-events: none;
}
.management__search-input {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 0.9rem;
  padding: 10px 32px 10px 32px;
  transition: border-color 0.2s;
}
.management__search-input:focus {
  outline: none;
  border-color: var(--accent);
}
.management__search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 1.2rem;
}
.management__filter {
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 0.9rem;
  padding: 10px 12px;
  cursor: pointer;
  min-width: 160px;
}
.management__filter:focus { outline: none; border-color: var(--accent); }
.management__filter option { background: var(--bg-surface); }

.management__count {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  margin-bottom: 12px;
}
.management__empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: 48px 0;
  font-size: 1rem;
}

.management__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.management__row {
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  transition: border-color 0.2s;
}
.management__row:hover {
  border-color: var(--border-subtle);
}

.management__row-content {
  display: grid;
  grid-template-columns: 100px 100px 1fr 50px 70px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}
.management__row-topic {
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.management__row-subtopic {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.management__row-question {
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.management__row-popularity {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-align: center;
}
.management__row-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
.management__btn-edit,
.management__btn-delete {
  background: none;
  border: 1px solid var(--border-dim);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.management__btn-edit:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.management__btn-delete:hover {
  color: var(--danger);
  border-color: var(--danger);
}

/* Management edit form */
.management__edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}
.management__edit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.management__edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.management__edit-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.management__edit-input,
.management__edit-textarea {
  background: var(--bg-deep);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 0.9rem;
  padding: 8px 10px;
  width: 100%;
  transition: border-color 0.2s;
}
.management__edit-input:focus,
.management__edit-textarea:focus {
  outline: none;
  border-color: var(--accent);
}
.management__edit-textarea {
  resize: vertical;
  min-height: 60px;
}
.management__edit-error {
  color: var(--danger);
  font-size: 0.8rem;
}
.management__edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.management__edit-save {
  padding: 6px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--bg-deep);
  background: var(--accent);
  transition: opacity 0.2s;
}
.management__edit-save:hover { opacity: 0.85; }
.management__edit-cancel {
  padding: 6px 18px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-hover);
  transition: color 0.2s;
}
.management__edit-cancel:hover { color: var(--text-primary); }

/* Delete confirmation overlay */
.management__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
}
.management__dialog {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
}
.management__dialog-text {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.5;
}
.management__dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.management__dialog-delete {
  padding: 8px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 500;
  color: #fff;
  background: var(--danger);
  transition: opacity 0.2s;
}
.management__dialog-delete:hover { opacity: 0.85; }
.management__dialog-cancel {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: transparent;
  transition: color 0.2s;
}
.management__dialog-cancel:hover { color: var(--text-primary); }

@media (max-width: 600px) {
  .management__controls { flex-direction: column; }
  .management__filter { min-width: unset; }
  .management__row-content {
    grid-template-columns: 1fr 50px 70px;
  }
  .management__row-topic,
  .management__row-subtopic {
    display: none;
  }
  .management__edit-row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Verify all styles render correctly**

Run: `npm run dev`. Check:
1. QACard pencil button appears styled on expanded cards
2. QACard edit form has side-by-side columns
3. Management page layout looks clean
4. Delete dialog appears centered with overlay
5. On narrow viewport, forms stack vertically

- [ ] **Step 5: Commit**

```bash
git add src/App.css
git commit -m "feat: add CSS styles for edit mode and management page"
```

---

### Task 8: Final Integration Verification

- [ ] **Step 1: Verify inline edit on QACard**

1. Open a topic, expand a card → pencil icon appears
2. Click pencil → form shows EN + PT-BR side by side
3. Edit answer, save → answer updated, persists after refresh
4. Edit, then cancel → original content restored
5. Collapse card while editing → edit mode discarded

- [ ] **Step 2: Verify management page**

1. Click dashboard "Manage" card → management page opens
2. Click header gear icon → management page opens
3. Search filters questions
4. Topic dropdown filters by topic
5. Click edit → inline form with all fields including subtopic/popularity
6. Save edit → changes reflected everywhere
7. Click delete → confirmation dialog
8. Confirm delete → question removed, SRS data cleaned up

- [ ] **Step 3: Verify edit NOT shown in ReviewSession**

Open a review session → cards should NOT have pencil icon (no `onEditQuestion` prop passed).

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: integration fixes for edit answers feature"
```
