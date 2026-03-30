import { MODES } from "./srs/useSRS.js";
import { loadStats } from "./srs/storage.js";

export default function ReviewDashboard({ srs, topics, onStartSession, onBack }) {
  const techQueues = srs.getQueues(MODES.TECHNICAL);
  const careerQueues = srs.getQueues(MODES.CAREER);
  const stats = loadStats();

  const modes = [
    {
      id: MODES.TECHNICAL,
      label: "Technical Questions",
      icon: "⚡",
      color: "#61dafb",
      queues: techQueues,
      description: "Backend, TypeScript, React, Node.js, Data Structures, System Design",
    },
    {
      id: MODES.CAREER,
      label: "Career Questions",
      icon: "★",
      color: "#E8A838",
      queues: careerQueues,
      description: "Questions about your experience, projects, and achievements",
    },
  ];

  return (
    <div className="review-dash">
      <button className="question-list__back" onClick={onBack}>← Back</button>

      <div className="review-dash__hero">
        <h1 className="review-dash__title">Spaced Repetition</h1>
        <p className="review-dash__subtitle">
          Memorize questions using the SM-2 algorithm. Cards appear right before you forget them.
        </p>
      </div>

      <div className="review-dash__stats-row">
        <div className="review-dash__stat">
          <div className="review-dash__stat-value" style={{ color: "#E8A838" }}>
            {stats.streak || 0}
          </div>
          <div className="review-dash__stat-label">Day Streak</div>
        </div>
        <div className="review-dash__stat">
          <div className="review-dash__stat-value" style={{ color: "#4ade80" }}>
            {techQueues.stats.retention || careerQueues.stats.retention || 0}%
          </div>
          <div className="review-dash__stat-label">Retention</div>
        </div>
        <div className="review-dash__stat">
          <div className="review-dash__stat-value" style={{ color: "#61dafb" }}>
            {techQueues.stats.totalReviewed + careerQueues.stats.totalReviewed}
          </div>
          <div className="review-dash__stat-label">Reviewed</div>
        </div>
      </div>

      {modes.map((mode) => {
        const q = mode.queues;
        const hasDue = q.stats.dueCount > 0 || q.stats.newCount > 0;
        return (
          <div key={mode.id} className="review-mode-card">
            <div className="review-mode-card__accent" style={{ background: mode.color }} />
            <div className="review-mode-card__header">
              <span className="review-mode-card__icon" style={{ color: mode.color }}>
                {mode.icon}
              </span>
              <div>
                <div className="review-mode-card__label">{mode.label}</div>
                <div className="review-mode-card__desc">{mode.description}</div>
              </div>
            </div>

            <div className="review-mode-card__counts">
              <div className="review-mode-card__count">
                <span className="review-mode-card__count-value review-mode-card__count-value--due">
                  {q.stats.dueCount}
                </span>
                <span className="review-mode-card__count-label">Due</span>
              </div>
              <div className="review-mode-card__count">
                <span className="review-mode-card__count-value review-mode-card__count-value--new">
                  {q.stats.newCount}
                </span>
                <span className="review-mode-card__count-label">New</span>
              </div>
              <div className="review-mode-card__count">
                <span className="review-mode-card__count-value">
                  {q.stats.totalCards}
                </span>
                <span className="review-mode-card__count-label">Total</span>
              </div>
            </div>

            {q.stats.totalReviewed > 0 && (
              <div className="review-mode-card__maturity">
                <div className="maturity-bar">
                  <div
                    className="maturity-bar__segment maturity-bar__segment--learning"
                    style={{ flex: q.stats.maturity.learning }}
                  />
                  <div
                    className="maturity-bar__segment maturity-bar__segment--young"
                    style={{ flex: q.stats.maturity.young }}
                  />
                  <div
                    className="maturity-bar__segment maturity-bar__segment--mature"
                    style={{ flex: q.stats.maturity.mature }}
                  />
                </div>
                <div className="maturity-legend">
                  <span>Learning: {q.stats.maturity.learning}</span>
                  <span>Young: {q.stats.maturity.young}</span>
                  <span>Mature: {q.stats.maturity.mature}</span>
                </div>
              </div>
            )}

            <div className="review-mode-card__actions">
              <button
                className="review-btn review-btn--primary"
                style={{ borderColor: mode.color, color: mode.color }}
                disabled={!hasDue}
                onClick={() => onStartSession(mode.id, "review")}
              >
                Review Due ({q.stats.dueCount})
              </button>
              <button
                className="review-btn review-btn--secondary"
                disabled={q.stats.newCount === 0}
                onClick={() => onStartSession(mode.id, "new")}
              >
                Study New ({q.stats.newCount})
              </button>
            </div>

            {q.stats.forecast.some((f) => f.count > 0) && (
              <div className="review-mode-card__forecast">
                <div className="forecast-label">Next 14 days</div>
                <div className="forecast-bars">
                  {q.stats.forecast.map((f) => {
                    const maxCount = Math.max(...q.stats.forecast.map((x) => x.count), 1);
                    return (
                      <div key={f.date} className="forecast-bar" title={`${f.date}: ${f.count}`}>
                        <div
                          className="forecast-bar__fill"
                          style={{
                            height: `${(f.count / maxCount) * 100}%`,
                            background: mode.color,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
