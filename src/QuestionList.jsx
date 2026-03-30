import QACard from "./QACard.jsx";

export default function QuestionList({ topic, onBack, getStatus }) {
  return (
    <div className="question-list">
      <button className="question-list__back" onClick={onBack}>
        ← Back
      </button>
      <div className="question-list__header">
        <span className="question-list__icon" style={{ color: topic.color }}>
          {topic.icon}
        </span>
        <div>
          <h1 className="question-list__title">{topic.label}</h1>
          <span className="question-list__count">
            {topic.questions.length} questions
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
          />
        ))}
      </div>
    </div>
  );
}
