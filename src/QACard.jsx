import { useState } from "react";
import { getDiagram } from "./Diagrams";
import { useI18n } from "./i18n/I18nContext.jsx";

export default function QACard({ item, index, topicColor, topicLabel, showTopic, delay = 0, srsStatus }) {
  const [revealed, setRevealed] = useState(false);
  const { t } = useI18n();

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
        <div className="qa-card__question">{item.question}</div>
        {revealed && (
          <div className="qa-card__answer">
            <div className="qa-card__answer-label">{t("qaCard.answerLabel")}</div>
            {item.answer}
            {getDiagram(item.id) && (
              <div
                className="qa-card__diagram"
                style={{ marginTop: "20px" }}
                onClick={(e) => e.stopPropagation()}
              >
                {getDiagram(item.id)}
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
