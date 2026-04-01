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
