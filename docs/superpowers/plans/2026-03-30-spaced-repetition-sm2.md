# Spaced Repetition (SM-2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a spaced repetition system (SM-2 algorithm) with two separate memorization modes — Technical Questions and Career Questions — so the user can systematically memorize interview content.

**Architecture:** Pure client-side SRS with localStorage persistence. The SM-2 algorithm lives in a standalone utility module. A React hook (`useSRS`) manages state, scheduling, and queue logic. Two new views — a review dashboard and a review session — integrate into the existing view-routing pattern in App.jsx. The existing question browsing experience is preserved; SRS is additive.

**Tech Stack:** React 19, Vite 6, localStorage, CSS (BEM conventions matching existing App.css)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/srs/sm2.js` | Pure SM-2 algorithm function + helpers |
| `src/srs/storage.js` | localStorage read/write/export/import for SRS metadata |
| `src/srs/queue.js` | Queue logic: due, new, learning queues with priority merging |
| `src/srs/useSRS.js` | React hook: wraps storage + queue + SM-2 into a clean API |
| `src/ReviewDashboard.jsx` | Dashboard showing due/new counts, stats, mode selection (Technical vs Career) |
| `src/ReviewSession.jsx` | Card review flow: show question → reveal answer → rate → next |
| `src/ReviewSummary.jsx` | Post-session summary with breakdown and streak |
| `src/App.jsx` | **Modify:** Add "review" and "reviewdash" views, pass SRS hook |
| `src/Dashboard.jsx` | **Modify:** Add Review special card with due count badge |
| `src/QACard.jsx` | **Modify:** Add small SRS status indicator |
| `src/App.css` | **Modify:** Add styles for review dashboard, session, summary, status badges |

---

### Task 1: SM-2 Algorithm — Pure Function

**Files:**
- Create: `src/srs/sm2.js`

- [ ] **Step 1: Create SM-2 algorithm module**

```javascript
// src/srs/sm2.js

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * @param {number} quality - User self-assessment (0-5)
 *   0 = Complete blackout    1 = Incorrect but remembered after seeing answer
 *   2 = Incorrect but familiar  3 = Correct with effort
 *   4 = Correct with hesitation  5 = Perfect instant recall
 * @param {number} repetition - Consecutive correct recalls
 * @param {number} easinessFactor - EF, starts at 2.5, min 1.3
 * @param {number} interval - Days until next review
 * @returns {{ interval, repetition, easinessFactor, nextReviewDate }}
 */
export function sm2(quality, repetition, easinessFactor, interval) {
  let newInterval;
  let newRepetition;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easinessFactor);
    }
    newRepetition = repetition + 1;
  } else {
    // Incorrect response — reset
    newRepetition = 0;
    newInterval = 1;
  }

  // Update easiness factor (all responses)
  const newEF = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const clampedEF = Math.max(1.3, newEF);

  // Calculate next review date
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    interval: newInterval,
    repetition: newRepetition,
    easinessFactor: clampedEF,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}

/**
 * Create default SRS metadata for a question
 */
export function createDefaultSRSData(questionId) {
  return {
    questionId,
    easinessFactor: 2.5,
    interval: 0,
    repetition: 0,
    nextReviewDate: null,
    lastReviewDate: null,
    quality: null,
  };
}

/**
 * Check if a question is due for review
 */
export function isDue(srsData) {
  if (!srsData.nextReviewDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(srsData.nextReviewDate) <= today;
}

/**
 * Check if a question is new (never reviewed)
 */
export function isNew(srsData) {
  return srsData.repetition === 0 && !srsData.lastReviewDate;
}

/**
 * Get human-readable interval label for a quality rating
 */
export function getIntervalPreview(quality, repetition, easinessFactor, interval) {
  const result = sm2(quality, repetition, easinessFactor, interval);
  const days = result.interval;
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
}
```

- [ ] **Step 2: Verify module loads**

Run: `npx vite build 2>&1 | head -5`
Expected: No import errors

- [ ] **Step 3: Commit**

```bash
git add src/srs/sm2.js
git commit -m "feat(srs): add SM-2 algorithm pure function with helpers"
```

---

### Task 2: Storage Layer — localStorage Persistence

**Files:**
- Create: `src/srs/storage.js`

- [ ] **Step 1: Create storage module**

```javascript
// src/srs/storage.js

const STORAGE_KEY = "iprep_srs_data";
const STATS_KEY = "iprep_srs_stats";

/**
 * Load all SRS metadata from localStorage
 * @returns {Object} Map of questionId → SRS metadata
 */
export function loadSRSData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save all SRS metadata to localStorage
 */
export function saveSRSData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Update a single question's SRS metadata
 */
export function updateQuestionSRS(questionId, updates) {
  const data = loadSRSData();
  data[questionId] = { ...data[questionId], ...updates };
  saveSRSData(data);
  return data;
}

/**
 * Reset SRS data for a specific question
 */
export function resetQuestionSRS(questionId) {
  const data = loadSRSData();
  delete data[questionId];
  saveSRSData(data);
  return data;
}

/**
 * Reset all SRS data
 */
export function resetAllSRS() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STATS_KEY);
}

/**
 * Load stats (streak, daily counts)
 */
export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { streak: 0, lastStudyDate: null, dailyCounts: {} };
  } catch {
    return { streak: 0, lastStudyDate: null, dailyCounts: {} };
  }
}

/**
 * Save stats
 */
export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * Record a completed review session
 */
export function recordSession(cardsReviewed) {
  const stats = loadStats();
  const today = new Date().toISOString().slice(0, 10);

  // Update daily count
  stats.dailyCounts[today] = (stats.dailyCounts[today] || 0) + cardsReviewed;

  // Update streak
  if (stats.lastStudyDate) {
    const lastDate = new Date(stats.lastStudyDate);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.streak += 1;
    } else if (diffDays > 1) {
      stats.streak = 1;
    }
    // diffDays === 0 means same day, streak unchanged
  } else {
    stats.streak = 1;
  }
  stats.lastStudyDate = today;

  saveStats(stats);
  return stats;
}

/**
 * Export all SRS data as JSON string (for backup)
 */
export function exportData() {
  return JSON.stringify({
    srs: loadSRSData(),
    stats: loadStats(),
    exportDate: new Date().toISOString(),
  }, null, 2);
}

/**
 * Import SRS data from JSON string
 */
export function importData(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (parsed.srs) saveSRSData(parsed.srs);
  if (parsed.stats) saveStats(parsed.stats);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/srs/storage.js
git commit -m "feat(srs): add localStorage persistence layer with export/import"
```

---

### Task 3: Queue Logic — Scheduling & Priority

**Files:**
- Create: `src/srs/queue.js`

- [ ] **Step 1: Create queue module**

```javascript
// src/srs/queue.js

import { isDue, isNew, createDefaultSRSData } from "./sm2.js";
import { loadSRSData } from "./storage.js";

/**
 * SRS Review Mode types
 */
export const MODES = {
  TECHNICAL: "technical",
  CAREER: "career",
};

/**
 * Topic IDs that belong to each mode
 */
const CAREER_TOPIC_IDS = ["mycareer"];

/**
 * Determine if a topic belongs to a mode
 */
export function topicBelongsToMode(topicId, mode) {
  if (mode === MODES.CAREER) return CAREER_TOPIC_IDS.includes(topicId);
  return !CAREER_TOPIC_IDS.includes(topicId);
}

/**
 * Get all questions for a given mode from topics
 * Returns flat array of { ...question, topicId, topicLabel, topicColor }
 */
export function getQuestionsForMode(topics, mode) {
  const questions = [];
  for (const topic of topics) {
    if (!topicBelongsToMode(topic.id, mode)) continue;
    for (const q of topic.questions) {
      questions.push({
        ...q,
        topicId: topic.id,
        topicLabel: topic.label,
        topicColor: topic.color,
      });
    }
  }
  return questions;
}

/**
 * Build review queues for a mode
 *
 * @param {Array} topics - All topic data
 * @param {string} mode - "technical" or "career"
 * @param {number} maxNew - Max new cards per day (default 20)
 * @returns {{ due: Array, newCards: Array, stats: Object }}
 */
export function buildQueues(topics, mode, maxNew = 20) {
  const srsData = loadSRSData();
  const questions = getQuestionsForMode(topics, mode);

  const due = [];
  const newCards = [];
  let totalReviewed = 0;
  let totalCards = questions.length;

  for (const q of questions) {
    const srs = srsData[q.id] || createDefaultSRSData(q.id);

    if (isNew(srs)) {
      newCards.push({ ...q, srs });
    } else if (isDue(srs)) {
      due.push({ ...q, srs });
    }

    if (srs.lastReviewDate) totalReviewed++;
  }

  // Sort due by oldest first (earliest nextReviewDate)
  due.sort((a, b) => new Date(a.srs.nextReviewDate) - new Date(b.srs.nextReviewDate));

  // Limit new cards
  const limitedNew = newCards.slice(0, maxNew);

  // Maturity distribution
  const maturity = { learning: 0, young: 0, mature: 0 };
  for (const q of questions) {
    const srs = srsData[q.id];
    if (!srs || !srs.lastReviewDate) continue;
    if (srs.interval < 7) maturity.learning++;
    else if (srs.interval <= 30) maturity.young++;
    else maturity.mature++;
  }

  // Retention rate
  let correctCount = 0;
  let totalRated = 0;
  for (const q of questions) {
    const srs = srsData[q.id];
    if (srs && srs.quality !== null) {
      totalRated++;
      if (srs.quality >= 3) correctCount++;
    }
  }

  // Forecast: cards due each day for next 14 days
  const forecast = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    let count = 0;
    for (const q of questions) {
      const srs = srsData[q.id];
      if (srs && srs.nextReviewDate) {
        const reviewDate = new Date(srs.nextReviewDate).toISOString().slice(0, 10);
        if (reviewDate === dateStr) count++;
      }
    }
    forecast.push({ date: dateStr, count });
  }

  return {
    due,
    newCards: limitedNew,
    stats: {
      totalCards,
      totalReviewed,
      dueCount: due.length,
      newCount: limitedNew.length,
      retention: totalRated > 0 ? Math.round((correctCount / totalRated) * 100) : 0,
      maturity,
      forecast,
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/srs/queue.js
git commit -m "feat(srs): add queue logic with dual mode support (technical/career)"
```

---

### Task 4: React Hook — useSRS

**Files:**
- Create: `src/srs/useSRS.js`

- [ ] **Step 1: Create hook**

```javascript
// src/srs/useSRS.js

import { useState, useCallback } from "react";
import { sm2, createDefaultSRSData, getIntervalPreview } from "./sm2.js";
import { loadSRSData, updateQuestionSRS, recordSession, loadStats } from "./storage.js";
import { buildQueues, MODES } from "./queue.js";

export { MODES };

export function useSRS(topics) {
  const [srsData, setSrsData] = useState(() => loadSRSData());
  const [stats, setStats] = useState(() => loadStats());

  /**
   * Get queues and stats for a mode
   */
  const getQueues = useCallback(
    (mode) => buildQueues(topics, mode),
    [topics]
  );

  /**
   * Rate a question and update SRS metadata
   */
  const rateQuestion = useCallback((questionId, quality) => {
    const current = srsData[questionId] || createDefaultSRSData(questionId);
    const result = sm2(
      quality,
      current.repetition,
      current.easinessFactor,
      current.interval
    );
    const updated = {
      questionId,
      easinessFactor: result.easinessFactor,
      interval: result.interval,
      repetition: result.repetition,
      nextReviewDate: result.nextReviewDate,
      lastReviewDate: new Date().toISOString(),
      quality,
    };

    const newData = updateQuestionSRS(questionId, updated);
    setSrsData({ ...newData });
    return updated;
  }, [srsData]);

  /**
   * End a session: record stats
   */
  const endSession = useCallback((cardsReviewed) => {
    const newStats = recordSession(cardsReviewed);
    setStats({ ...newStats });
    return newStats;
  }, []);

  /**
   * Get SRS status for a question (for badges)
   */
  const getStatus = useCallback((questionId) => {
    const srs = srsData[questionId];
    if (!srs || !srs.lastReviewDate) return "new";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(srs.nextReviewDate) <= today) return "due";
    const daysUntil = Math.ceil(
      (new Date(srs.nextReviewDate) - today) / (1000 * 60 * 60 * 24)
    );
    return `${daysUntil}d`;
  }, [srsData]);

  /**
   * Get preview intervals for all quality ratings
   */
  const getIntervalPreviews = useCallback((questionId) => {
    const srs = srsData[questionId] || createDefaultSRSData(questionId);
    return [0, 1, 2, 3, 4, 5].map((q) => ({
      quality: q,
      label: getIntervalPreview(q, srs.repetition, srs.easinessFactor, srs.interval),
    }));
  }, [srsData]);

  /**
   * Get combined due count across both modes
   */
  const getTotalDue = useCallback(() => {
    const tech = buildQueues(topics, MODES.TECHNICAL);
    const career = buildQueues(topics, MODES.CAREER);
    return tech.stats.dueCount + tech.stats.newCount + career.stats.dueCount + career.stats.newCount;
  }, [topics]);

  return {
    srsData,
    stats,
    getQueues,
    rateQuestion,
    endSession,
    getStatus,
    getIntervalPreviews,
    getTotalDue,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/srs/useSRS.js
git commit -m "feat(srs): add useSRS React hook wrapping all SRS logic"
```

---

### Task 5: Review Dashboard UI

**Files:**
- Create: `src/ReviewDashboard.jsx`

- [ ] **Step 1: Create ReviewDashboard component**

```jsx
// src/ReviewDashboard.jsx

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

      {/* streak & global stats */}
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

      {/* mode cards */}
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

            {/* maturity bar */}
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

            {/* forecast mini chart */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/ReviewDashboard.jsx
git commit -m "feat(srs): add ReviewDashboard with dual mode cards and stats"
```

---

### Task 6: Review Session UI

**Files:**
- Create: `src/ReviewSession.jsx`

- [ ] **Step 1: Create ReviewSession component**

```jsx
// src/ReviewSession.jsx

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

  // Build initial queue
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

    // If incorrect, add to learning queue for re-review
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

  // Summary screen
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
                    width: `${(b.count / sessionResults.length) * 100}%`,
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

  // Empty state
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

  // Get interval previews for current card
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
      {/* progress bar */}
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

      {/* question card */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/ReviewSession.jsx
git commit -m "feat(srs): add ReviewSession with card flip, rating, and learning queue"
```

---

### Task 7: Wire Into App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add SRS hook, views, and routing**

Add imports at top:
```javascript
import { useSRS } from "./srs/useSRS.js";
import ReviewDashboard from "./ReviewDashboard.jsx";
import ReviewSession from "./ReviewSession.jsx";
```

Add state variables inside App():
```javascript
const srs = useSRS(topics);
const [reviewMode, setReviewMode] = useState(null);
const [reviewSessionType, setReviewSessionType] = useState(null);
```

Add handler functions:
```javascript
function handleStartReview(mode, sessionType) {
  setReviewMode(mode);
  setReviewSessionType(sessionType);
  setView("reviewsession");
}

function handleFinishReview(results) {
  setReviewMode(null);
  setReviewSessionType(null);
  setView("reviewdash");
}
```

In `handleSelectTopic`, add a case for `"__review__"`:
```javascript
if (id === "__review__") {
  setView("reviewdash");
  setSearchQuery("");
  return;
}
```

In the content section, add the two new views:
```jsx
{view === "reviewdash" && (
  <ReviewDashboard
    srs={srs}
    topics={topics}
    onStartSession={handleStartReview}
    onBack={handleBack}
  />
)}
{view === "reviewsession" && reviewMode && (
  <ReviewSession
    srs={srs}
    topics={topics}
    mode={reviewMode}
    sessionType={reviewSessionType}
    onFinish={handleFinishReview}
  />
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat(srs): wire review dashboard and session into App routing"
```

---

### Task 8: Add Review Card to Dashboard

**Files:**
- Modify: `src/Dashboard.jsx`

- [ ] **Step 1: Add Review special card**

Add a third entry to `specialCards` array in Dashboard.jsx, between the existing two:
```javascript
{
  id: "__review__",
  label: "Review",
  icon: "◉",
  color: "#4ade80",
  description: "Spaced repetition — memorize questions with SM-2 algorithm",
  type: "special",
},
```

- [ ] **Step 2: Commit**

```bash
git add src/Dashboard.jsx
git commit -m "feat(srs): add Review card to dashboard"
```

---

### Task 9: Add SRS Status Badge to QACard

**Files:**
- Modify: `src/QACard.jsx`
- Modify: `src/QuestionList.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Update QACard to accept and show srsStatus prop**

Add `srsStatus` to the destructured props in QACard:
```javascript
export default function QACard({ item, index, topicColor, topicLabel, showTopic, delay = 0, srsStatus }) {
```

After the popularity span in the `qa-card__meta` div, add:
```jsx
{srsStatus && (
  <span className={`qa-card__srs-badge qa-card__srs-badge--${srsStatus === "due" ? "due" : srsStatus === "new" ? "new" : "scheduled"}`}>
    {srsStatus === "due" ? "Due" : srsStatus === "new" ? "New" : `${srsStatus}`}
  </span>
)}
```

- [ ] **Step 2: Pass srsStatus from QuestionList**

Update QuestionList to receive `getStatus` prop and pass it through:

In App.jsx, update QuestionList rendering:
```jsx
{view === "topic" && activeTopic && (
  <QuestionList topic={activeTopic} onBack={handleBack} getStatus={srs.getStatus} />
)}
```

In QuestionList.jsx, destructure the new prop and pass to QACard:
```jsx
export default function QuestionList({ topic, onBack, getStatus }) {
  // ...
  <QACard
    key={q.id}
    item={q}
    index={i}
    topicColor={topic.color}
    delay={i * 50}
    srsStatus={getStatus ? getStatus(q.id) : null}
  />
```

- [ ] **Step 3: Commit**

```bash
git add src/QACard.jsx src/QuestionList.jsx src/App.jsx
git commit -m "feat(srs): add SRS status badges to question cards"
```

---

### Task 10: Add All SRS Styles to App.css

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Append SRS styles before the RESPONSIVE section**

```css
/* ══════════════════════════════════════════════════════════════════════════
   SRS - REVIEW DASHBOARD
   ══════════════════════════════════════════════════════════════════════════ */
.review-dash { animation: fadeUp 0.4s var(--ease-out); }
.review-dash__hero { margin: 12px 0 24px; }
.review-dash__title {
  font-family: var(--font-display); font-size: 28px; font-weight: 700;
  letter-spacing: -0.03em;
}
.review-dash__subtitle {
  font-family: var(--font-mono); font-size: 12px;
  color: var(--text-tertiary); margin-top: 6px;
}
.review-dash__stats-row {
  display: flex; gap: 12px; margin-bottom: 24px;
}
.review-dash__stat {
  flex: 1; text-align: center;
  background: var(--bg-surface); border: 1px solid var(--border-dim);
  border-radius: 8px; padding: 16px;
  animation: fadeUp 0.4s var(--ease-out) backwards;
}
.review-dash__stat:nth-child(1) { animation-delay: 0.05s; }
.review-dash__stat:nth-child(2) { animation-delay: 0.1s; }
.review-dash__stat:nth-child(3) { animation-delay: 0.15s; }
.review-dash__stat-value {
  font-family: var(--font-display); font-size: 28px; font-weight: 700;
}
.review-dash__stat-label {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text-tertiary); margin-top: 2px;
}

/* mode cards */
.review-mode-card {
  position: relative; overflow: hidden;
  background: var(--bg-surface); border: 1px solid var(--border-dim);
  border-radius: 10px; padding: 24px; margin-bottom: 16px;
  animation: fadeUp 0.4s var(--ease-out);
}
.review-mode-card__accent {
  position: absolute; top: 0; left: 0; right: 0; height: 3px; opacity: 0.5;
}
.review-mode-card__header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
}
.review-mode-card__icon { font-size: 22px; }
.review-mode-card__label {
  font-family: var(--font-display); font-size: 18px; font-weight: 600;
}
.review-mode-card__desc {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary);
  margin-top: 2px;
}
.review-mode-card__counts {
  display: flex; gap: 16px; margin-bottom: 16px;
}
.review-mode-card__count { text-align: center; flex: 1; }
.review-mode-card__count-value {
  font-family: var(--font-display); font-size: 24px; font-weight: 700;
  color: var(--text-primary); display: block;
}
.review-mode-card__count-value--due { color: #f97316; }
.review-mode-card__count-value--new { color: #3b82f6; }
.review-mode-card__count-label {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-ghost);
}
.review-mode-card__actions {
  display: flex; gap: 10px; margin-top: 16px;
}

/* maturity bar */
.review-mode-card__maturity { margin-bottom: 12px; }
.maturity-bar {
  display: flex; height: 6px; border-radius: 3px; overflow: hidden; gap: 2px;
}
.maturity-bar__segment { border-radius: 2px; min-width: 2px; }
.maturity-bar__segment--learning { background: #f97316; }
.maturity-bar__segment--young { background: #eab308; }
.maturity-bar__segment--mature { background: #4ade80; }
.maturity-legend {
  display: flex; gap: 14px; margin-top: 6px;
  font-family: var(--font-mono); font-size: 9px; color: var(--text-ghost);
}

/* forecast */
.review-mode-card__forecast { margin-top: 16px; }
.forecast-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-ghost);
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;
}
.forecast-bars {
  display: flex; gap: 3px; height: 40px; align-items: flex-end;
}
.forecast-bar {
  flex: 1; display: flex; align-items: flex-end;
  background: rgba(255,255,255,0.03); border-radius: 2px 2px 0 0;
  min-height: 2px; height: 100%;
}
.forecast-bar__fill {
  width: 100%; border-radius: 2px 2px 0 0; min-height: 2px;
  transition: height 0.3s var(--ease-out); opacity: 0.7;
}

/* review buttons */
.review-btn {
  flex: 1; padding: 10px 16px;
  font-family: var(--font-mono); font-size: 12px; font-weight: 500;
  border-radius: 6px; cursor: pointer;
  transition: all 0.15s var(--ease-out); letter-spacing: 0.04em;
}
.review-btn--primary {
  background: rgba(255,255,255,0.04); border: 1px solid;
}
.review-btn--primary:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
.review-btn--secondary {
  background: transparent; border: 1px solid var(--border-dim);
  color: var(--text-tertiary);
}
.review-btn--secondary:hover:not(:disabled) {
  border-color: var(--border-subtle); color: var(--text-secondary);
}
.review-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ══════════════════════════════════════════════════════════════════════════
   SRS - REVIEW SESSION
   ══════════════════════════════════════════════════════════════════════════ */
.review-session { animation: fadeUp 0.3s var(--ease-out); max-width: 680px; margin: 0 auto; }
.review-session__progress {
  height: 4px; background: var(--border-dim); border-radius: 2px;
  margin-bottom: 16px; overflow: hidden;
}
.review-session__progress-fill {
  height: 100%; background: var(--accent); border-radius: 2px;
  transition: width 0.4s var(--ease-out);
}
.review-session__meta {
  display: flex; align-items: center; gap: 10px; margin-bottom: 20px;
}
.review-session__counter {
  font-family: var(--font-mono); font-size: 12px; color: var(--text-ghost);
}
.review-session__topic-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  border: 1px solid; border-radius: 3px; padding: 2px 8px;
}
.review-session__subtopic {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.1em;
}

/* review card */
.review-card {
  background: var(--bg-surface); border: 1px solid var(--border-dim);
  border-radius: 10px; padding: 32px; min-height: 300px;
  display: flex; flex-direction: column;
}
.review-card__question {
  font-family: var(--font-display); font-size: 18px; font-weight: 600;
  line-height: 1.6; color: var(--text-primary); flex: 1;
}
.review-card__reveal {
  align-self: center; margin-top: 32px;
  padding: 12px 32px; font-family: var(--font-mono); font-size: 13px;
  background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle);
  border-radius: 8px; color: var(--text-primary); cursor: pointer;
  transition: all 0.15s;
}
.review-card__reveal:hover {
  background: rgba(255,255,255,0.1); border-color: var(--accent);
}
.review-card__answer {
  margin-top: 24px; padding-top: 20px;
  border-top: 1px solid var(--border-dim);
  font-family: var(--font-display); font-size: 14px;
  color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap;
  animation: revealAnswer 0.3s var(--ease-out);
}
.review-card__divider {
  height: 1px; background: var(--border-dim); margin: 24px 0 16px;
}
.review-card__prompt {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-ghost);
  text-align: center; margin-bottom: 14px; letter-spacing: 0.08em;
}
.review-card__ratings {
  display: flex; gap: 8px; justify-content: center;
}
.rating-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 12px; min-width: 72px;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border-dim);
  border-radius: 8px; cursor: pointer;
  transition: all 0.15s var(--ease-out);
}
.rating-btn:hover {
  background: rgba(255,255,255,0.07); border-color: var(--border-subtle);
  transform: translateY(-2px);
}
.rating-btn__emoji { font-size: 18px; }
.rating-btn__label {
  font-family: var(--font-mono); font-size: 11px; font-weight: 500;
  color: var(--text-primary);
}
.rating-btn__interval {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-ghost);
}

/* ══════════════════════════════════════════════════════════════════════════
   SRS - SESSION SUMMARY
   ══════════════════════════════════════════════════════════════════════════ */
.review-summary {
  max-width: 480px; margin: 48px auto; text-align: center;
  animation: fadeUp 0.4s var(--ease-out);
}
.review-summary__icon {
  font-size: 48px; color: var(--accent); margin-bottom: 16px;
  width: 80px; height: 80px; line-height: 80px;
  border: 2px solid var(--accent); border-radius: 50%;
  display: inline-block;
}
.review-summary__title {
  font-family: var(--font-display); font-size: 24px; font-weight: 700;
  margin-bottom: 6px;
}
.review-summary__subtitle {
  font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary);
  margin-bottom: 28px;
}
.review-summary__breakdown {
  text-align: left; margin-bottom: 28px;
  background: var(--bg-surface); border: 1px solid var(--border-dim);
  border-radius: 8px; padding: 20px;
}
.review-summary__bar-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.review-summary__bar-row:last-child { margin-bottom: 0; }
.review-summary__bar-label {
  font-family: var(--font-mono); font-size: 11px; font-weight: 500;
  min-width: 56px;
}
.review-summary__bar-track {
  flex: 1; height: 8px; background: rgba(255,255,255,0.05);
  border-radius: 4px; overflow: hidden;
}
.review-summary__bar-fill {
  height: 100%; border-radius: 4px;
  transition: width 0.5s var(--ease-out);
}
.review-summary__bar-count {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-ghost);
  min-width: 20px; text-align: right;
}

/* ══════════════════════════════════════════════════════════════════════════
   SRS - STATUS BADGES (on QACards)
   ══════════════════════════════════════════════════════════════════════════ */
.qa-card__srs-badge {
  font-family: var(--font-mono); font-size: 9px; font-weight: 500;
  padding: 2px 6px; border-radius: 3px; margin-left: auto; flex-shrink: 0;
}
.qa-card__srs-badge--due {
  background: rgba(249,115,22,0.15); color: #f97316;
}
.qa-card__srs-badge--new {
  background: rgba(59,130,246,0.15); color: #3b82f6;
}
.qa-card__srs-badge--scheduled {
  background: rgba(74,222,128,0.1); color: var(--text-ghost);
}
```

- [ ] **Step 2: Add responsive rules for review components**

Inside the existing `@media (max-width: 640px)` block, add:
```css
  .review-dash__stats-row { flex-direction: column; }
  .review-card__ratings { flex-wrap: wrap; }
  .rating-btn { min-width: 60px; flex: 1; }
  .review-mode-card__actions { flex-direction: column; }
```

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "feat(srs): add all SRS styles — dashboard, session, summary, badges"
```

---

### Task 11: Final Integration Test

- [ ] **Step 1: Run the dev server and verify all views load**

Run: `npx vite`
Navigate to http://localhost:5173
Expected: Dashboard shows with Review card alongside My CV and Job Prep

- [ ] **Step 2: Test Review Dashboard**

Click "Review" card → Review Dashboard shows with two modes:
- Technical Questions (6 topics, all questions shown as "New")
- Career Questions (mycareer topic, all shown as "New")

- [ ] **Step 3: Test a review session**

Click "Study New" on Technical → Review session starts:
- Question displayed, answer hidden
- Click "Show Answer" → answer appears + rating buttons
- Click a rating → next card, progress bar updates
- After all cards → summary screen with breakdown bars
- Click "Done" → back to review dashboard, counts updated

- [ ] **Step 4: Test persistence**

Refresh the page → due counts should reflect previous session's schedules

- [ ] **Step 5: Test SRS badges on question cards**

Go to any topic (e.g., Backend) → cards should show "Due", "New", or "3d" badges

- [ ] **Step 6: Commit final integration**

```bash
git add -A
git commit -m "feat(srs): complete spaced repetition integration with dual modes"
```
