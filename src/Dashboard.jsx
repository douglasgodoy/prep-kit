export default function Dashboard({ topics, onSelectTopic }) {
  const specialCards = [
    {
      id: "__cv__",
      label: "My CV",
      icon: "◆",
      color: "#E8A838",
      description: "Career highlights, timeline, skills & experience details",
      type: "special",
    },
    {
      id: "__jobprep__",
      label: "Job Prep",
      icon: "◎",
      color: "#a855f7",
      description: "Paste a job description and get tailored interview questions",
      type: "special",
    },
    {
      id: "__review__",
      label: "Review",
      icon: "◉",
      color: "#4ade80",
      description: "Spaced repetition — memorize questions with SM-2 algorithm",
      type: "special",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__hero">
        <h1 className="dashboard__title">What are you studying today?</h1>
        <p className="dashboard__subtitle">
          {topics.reduce((s, t) => s + t.questions.length, 0)} questions across{" "}
          {topics.length} topics
        </p>
      </div>

      {/* special cards */}
      <div className="dashboard__special">
        {specialCards.map((card) => (
          <button
            key={card.id}
            className="special-card"
            onClick={() => onSelectTopic(card.id)}
          >
            <div className="special-card__accent" style={{ background: card.color }} />
            <div className="special-card__icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="special-card__content">
              <div className="special-card__label">{card.label}</div>
              <div className="special-card__desc">{card.description}</div>
            </div>
            <span className="special-card__arrow" style={{ color: card.color }}>→</span>
          </button>
        ))}
      </div>

      {/* topic cards */}
      <div className="dashboard__section-label">Study Topics</div>
      <div className="dashboard__grid">
        {topics.map((t) => (
          <button
            key={t.id}
            className="topic-card"
            onClick={() => onSelectTopic(t.id)}
          >
            <div
              className="topic-card__accent"
              style={{ background: t.color }}
            />
            <div className="topic-card__icon" style={{ color: t.color }}>
              {t.icon}
            </div>
            <div className="topic-card__label">{t.label}</div>
            <div className="topic-card__count" style={{ color: t.color }}>
              {t.questions.length} questions
            </div>
            <div className="topic-card__subtopics">
              {[...new Set(t.questions.map((q) => q.subtopic))].map((s) => (
                <span key={s} className="topic-card__tag">
                  {s}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
