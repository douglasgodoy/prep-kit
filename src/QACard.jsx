import { useState } from "react";
import { getDiagram } from "./Diagrams";
import { useI18n } from "./i18n/I18nContext.jsx";

export default function QACard({ item, index, topicColor, topicLabel, showTopic, delay = 0, srsStatus }) {
  const [revealed, setRevealed] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const { t, locale } = useI18n();
  const isPt = locale === "pt-BR";
  const question = (isPt && item.question_pt) || item.question;
  const answer = (isPt && item.answer_pt) || item.answer;
  const example = (isPt && item.example_pt) || item.example;
  const diagram = getDiagram(item.id);
  const hasVisuals = example || diagram;

  return (
    <div
      className={`qa-card ${revealed ? "qa-card--open" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => setRevealed((v) => !v)}
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
        </div>
        <div className="qa-card__question">{question}</div>
        {revealed && (
          <div className="qa-card__answer">
            <div className="qa-card__answer-label">{t("qaCard.answerLabel")}</div>
            {answer}

            {/* visuals toggle */}
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
