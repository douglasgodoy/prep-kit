import { useState } from "react";
import QACard from "./QACard.jsx";
import { useI18n } from "./i18n/I18nContext.jsx";

export default function SearchResults({ query, topics, onEditQuestion }) {
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" | "flat"
  const { t } = useI18n();

  const lowerQuery = query.toLowerCase();

  // collect all matching questions with their topic info
  const matches = [];
  for (const tp of topics) {
    for (const q of tp.questions) {
      if (
        q.question.toLowerCase().includes(lowerQuery) ||
        q.answer.toLowerCase().includes(lowerQuery) ||
        q.subtopic.toLowerCase().includes(lowerQuery) ||
        tp.label.toLowerCase().includes(lowerQuery)
      ) {
        matches.push({ ...q, topicId: tp.id, topicLabel: tp.label, topicColor: tp.color, topicIcon: tp.icon });
      }
    }
  }

  if (matches.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results__empty">
          <div className="search-results__empty-icon">∅</div>
          <div className="search-results__empty-text">
            {t("search.noResults")} "<strong>{query}</strong>"
          </div>
          <div className="search-results__empty-hint">
            {t("search.noResultsHint")}
          </div>
        </div>
      </div>
    );
  }

  // group by topic
  const grouped = {};
  for (const m of matches) {
    if (!grouped[m.topicId]) {
      grouped[m.topicId] = { label: m.topicLabel, color: m.topicColor, icon: m.topicIcon, items: [] };
    }
    grouped[m.topicId].items.push(m);
  }

  const countLabel = matches.length === 1
    ? `1 ${t("search.results")}`
    : `${matches.length} ${t("search.resultsPlural")}`;

  return (
    <div className="search-results">
      <div className="search-results__header">
        <div className="search-results__info">
          <span className="search-results__count">{countLabel}</span>
          <span className="search-results__query">{t("search.for")} "{query}"</span>
        </div>
        <div className="search-results__toggle">
          <button
            className={`toggle-btn ${viewMode === "grouped" ? "toggle-btn--active" : ""}`}
            onClick={() => setViewMode("grouped")}
          >
            {t("search.grouped")}
          </button>
          <button
            className={`toggle-btn ${viewMode === "flat" ? "toggle-btn--active" : ""}`}
            onClick={() => setViewMode("flat")}
          >
            {t("search.flat")}
          </button>
        </div>
      </div>

      {viewMode === "grouped" ? (
        Object.entries(grouped).map(([topicId, group]) => (
          <div key={topicId} className="search-results__group">
            <div className="search-results__group-header">
              <span className="search-results__group-icon" style={{ color: group.color }}>
                {group.icon}
              </span>
              <span className="search-results__group-label">{group.label}</span>
              <span className="search-results__group-count">{group.items.length}</span>
            </div>
            <div className="cards">
              {group.items.map((q, i) => (
                <QACard
                  key={q.id}
                  item={q}
                  index={i}
                  topicColor={group.color}
                  delay={i * 50}
                  topicId={topicId}
                  onEditQuestion={onEditQuestion}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="cards">
          {matches.map((q, i) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
