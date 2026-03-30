import { useState, useEffect } from "react";
import { getIntervalPreview, createDefaultSRSData } from "./srs/sm2.js";
import { MODES } from "./srs/useSRS.js";

const RATING_BUTTONS = [
  { quality: 0, label: "Again", emoji: "🔴", desc: "No idea" },
  { quality: 2, label: "Hard", emoji: "🟠", desc: "Wrong but familiar" },
  { quality: 3, label: "Good", emoji: "🟡", desc: "Right with effort" },
  { quality: 4, label: "Easy", emoji: "🟢", desc: "Got it right" },
  { quality: 5, label: "Perfect", emoji: "🔵", desc: "Instant recall" },
];

export default function ReviewSession({ srs, topics, mode, sessionType, onFinish }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [learningQueue, setLearningQueue] = useState([]);

  useEffect(() => {
    const queues = srs.getQueues(mode);
    let cards;
    if (sessionType === "new") {
      cards = queues.newCards;
    } else {
      cards = [...queues.due, ...queues.newCards];
    }
    setQueue(cards);
    setCurrentIndex(0);
    setRevealed(false);
    setSessionResults([]);
    setLearningQueue([]);
  }, [mode, sessionType]);

  const allCards = [...queue, ...learningQueue];
  const currentCard = allCards[currentIndex];
  const isFinished = currentIndex >= allCards.length || allCards.length === 0;

  function handleRate(quality) {
    if (!currentCard) return;
    srs.rateQuestion(currentCard.id, quality);
    const result = { ...currentCard, ratedQuality: quality };
    setSessionResults((prev) => [...prev, result]);

    if (quality < 3) {
      setLearningQueue((prev) => [...prev, currentCard]);
    }

    setCurrentIndex((i) => i + 1);
    setRevealed(false);
  }

  function handleFinish() {
    srs.endSession(sessionResults.length);
    onFinish(sessionResults);
  }

  if (isFinished && sessionResults.length > 0) {
    const breakdown = { again: 0, hard: 0, good: 0, easy: 0, perfect: 0 };
    for (const r of sessionResults) {
      if (r.ratedQuality === 0) breakdown.again++;
      else if (r.ratedQuality <= 2) breakdown.hard++;
      else if (r.ratedQuality === 3) breakdown.good++;
      else if (r.ratedQuality === 4) breakdown.easy++;
      else breakdown.perfect++;
    }

    return (
      <div className="review-summary">
        <div className="review-summary__icon">✓</div>
        <h2 className="review-summary__title">Session Complete</h2>
        <p className="review-summary__subtitle">
          {mode === MODES.CAREER ? "Career" : "Technical"} · {sessionResults.length} cards reviewed
        </p>

        <div className="review-summary__breakdown">
          {[
            { label: "Again", count: breakdown.again, color: "#ef4444" },
            { label: "Hard", count: breakdown.hard, color: "#f97316" },
            { label: "Good", count: breakdown.good, color: "#eab308" },
            { label: "Easy", count: breakdown.easy, color: "#4ade80" },
            { label: "Perfect", count: breakdown.perfect, color: "#3b82f6" },
          ].map((b) => (
            <div key={b.label} className="review-summary__bar-row">
              <span className="review-summary__bar-label" style={{ color: b.color }}>
                {b.label}
              </span>
              <div className="review-summary__bar-track">
                <div
                  className="review-summary__bar-fill"
                  style={{
                    width: `${sessionResults.length > 0 ? (b.count / sessionResults.length) * 100 : 0}%`,
                    background: b.color,
                  }}
                />
              </div>
              <span className="review-summary__bar-count">{b.count}</span>
            </div>
          ))}
        </div>

        <button className="gen-btn gen-btn--full" onClick={handleFinish}>
          Done
        </button>
      </div>
    );
  }

  if (isFinished && sessionResults.length === 0) {
    return (
      <div className="review-summary">
        <div className="review-summary__icon">✓</div>
        <h2 className="review-summary__title">All caught up!</h2>
        <p className="review-summary__subtitle">No cards to review right now.</p>
        <button className="gen-btn gen-btn--full" onClick={() => onFinish([])}>
          Back
        </button>
      </div>
    );
  }

  const cardSRS = currentCard?.srs || createDefaultSRSData(currentCard?.id);
  const previews = {};
  for (const btn of RATING_BUTTONS) {
    previews[btn.quality] = getIntervalPreview(
      btn.quality,
      cardSRS.repetition,
      cardSRS.easinessFactor,
      cardSRS.interval
    );
  }

  const progress = currentIndex + 1;
  const total = allCards.length;

  return (
    <div className="review-session">
      <div className="review-session__progress">
        <div
          className="review-session__progress-fill"
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </div>
      <div className="review-session__meta">
        <span className="review-session__counter">{progress} / {total}</span>
        <span
          className="review-session__topic-badge"
          style={{ borderColor: currentCard.topicColor, color: currentCard.topicColor }}
        >
          {currentCard.topicLabel}
        </span>
        <span className="review-session__subtopic">{currentCard.subtopic}</span>
      </div>

      <div className="review-card">
        <div className="review-card__question">{currentCard.question}</div>

        {!revealed ? (
          <button className="review-card__reveal" onClick={() => setRevealed(true)}>
            Show Answer
          </button>
        ) : (
          <>
            <div className="review-card__answer">{currentCard.answer}</div>
            <div className="review-card__divider" />
            <div className="review-card__prompt">How well did you recall this?</div>
            <div className="review-card__ratings">
              {RATING_BUTTONS.map((btn) => (
                <button
                  key={btn.quality}
                  className="rating-btn"
                  onClick={() => handleRate(btn.quality)}
                >
                  <span className="rating-btn__emoji">{btn.emoji}</span>
                  <span className="rating-btn__label">{btn.label}</span>
                  <span className="rating-btn__interval">{previews[btn.quality]}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
