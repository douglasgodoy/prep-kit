import { useState } from "react";
import QACard from "./QACard.jsx";

export default function SearchResults({ query, topics }) {
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" | "flat"

  const lowerQuery = query.toLowerCase();

  // collect all matching questions with their topic info
  const matches = [];
  for (const t of topics) {
    for (const q of t.questions) {
      if (
        q.question.toLowerCase().includes(lowerQuery) ||
        q.answer.toLowerCase().includes(lowerQuery) ||
        q.subtopic.toLowerCase().includes(lowerQuery) ||
        t.label.toLowerCase().includes(lowerQuery)
      ) {
        matches.push({ ...q, topicId: t.id, topicLabel: t.label, topicColor: t.color, topicIcon: t.icon });
      }
    }
  }

  if (matches.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results__empty">
          <div className="search-results__empty-icon">∅</div>
          <div className="search-results__empty-text">
            No results for "<strong>{query}</strong>"
          </div>
          <div className="search-results__empty-hint">
            Try a different keyword or browse topics from the dashboard
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

  return (
    <div className="search-results">
      <div className="search-results__header">
        <div className="search-results__info">
          <span className="search-results__count">{matches.length} result{matches.length !== 1 ? "s" : ""}</span>
          <span className="search-results__query">for "{query}"</span>
        </div>
        <div className="search-results__toggle">
          <button
            className={`toggle-btn ${viewMode === "grouped" ? "toggle-btn--active" : ""}`}
            onClick={() => setViewMode("grouped")}
          >
            Grouped
          </button>
          <button
            className={`toggle-btn ${viewMode === "flat" ? "toggle-btn--active" : ""}`}
            onClick={() => setViewMode("flat")}
          >
            Flat
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
