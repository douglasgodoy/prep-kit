import { useI18n } from "./i18n/I18nContext.jsx";

export default function Dashboard({ topics, onSelectTopic }) {
  const { t } = useI18n();

  const specialCards = [
    {
      id: "__cv__",
      label: t("card.cv.label"),
      icon: "◆",
      color: "#E8A838",
      description: t("card.cv.desc"),
      type: "special",
    },
    {
      id: "__jobprep__",
      label: t("card.jobprep.label"),
      icon: "◎",
      color: "#a855f7",
      description: t("card.jobprep.desc"),
      type: "special",
    },
    {
      id: "__review__",
      label: t("card.review.label"),
      icon: "◉",
      color: "#4ade80",
      description: t("card.review.desc"),
      type: "special",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__hero">
        <h1 className="dashboard__title">{t("dashboard.title")}</h1>
        <p className="dashboard__subtitle">
          {t("dashboard.subtitle", {
            count: topics.reduce((s, tp) => s + tp.questions.length, 0),
            topics: topics.length,
          })}
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
      <div className="dashboard__section-label">{t("dashboard.sectionLabel")}</div>
      <div className="dashboard__grid">
        {topics.map((tp) => (
          <button
            key={tp.id}
            className="topic-card"
            onClick={() => onSelectTopic(tp.id)}
          >
            <div
              className="topic-card__accent"
              style={{ background: tp.color }}
            />
            <div className="topic-card__icon" style={{ color: tp.color }}>
              {tp.icon}
            </div>
            <div className="topic-card__label">{tp.label}</div>
            <div className="topic-card__count" style={{ color: tp.color }}>
              {tp.questions.length} {t("dashboard.questions")}
            </div>
            <div className="topic-card__subtopics">
              {[...new Set(tp.questions.map((q) => q.subtopic))].map((s) => (
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
