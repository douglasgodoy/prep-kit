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
