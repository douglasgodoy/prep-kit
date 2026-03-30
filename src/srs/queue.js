import { isDue, isNew, createDefaultSRSData } from "./sm2.js";
import { loadSRSData } from "./storage.js";

export const MODES = {
  TECHNICAL: "technical",
  CAREER: "career",
};

const CAREER_TOPIC_IDS = ["mycareer"];

export function topicBelongsToMode(topicId, mode) {
  if (mode === MODES.CAREER) return CAREER_TOPIC_IDS.includes(topicId);
  return !CAREER_TOPIC_IDS.includes(topicId);
}

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

export function buildQueues(topics, mode, maxNew = 20) {
  const srsData = loadSRSData();
  const questions = getQuestionsForMode(topics, mode);
  const due = [];
  const newCards = [];
  let totalReviewed = 0;

  for (const q of questions) {
    const srs = srsData[q.id] || createDefaultSRSData(q.id);
    if (isNew(srs)) {
      newCards.push({ ...q, srs });
    } else if (isDue(srs)) {
      due.push({ ...q, srs });
    }
    if (srs.lastReviewDate) totalReviewed++;
  }

  due.sort((a, b) => new Date(a.srs.nextReviewDate) - new Date(b.srs.nextReviewDate));
  const limitedNew = newCards.slice(0, maxNew);

  const maturity = { learning: 0, young: 0, mature: 0 };
  for (const q of questions) {
    const srs = srsData[q.id];
    if (!srs || !srs.lastReviewDate) continue;
    if (srs.interval < 7) maturity.learning++;
    else if (srs.interval <= 30) maturity.young++;
    else maturity.mature++;
  }

  let correctCount = 0;
  let totalRated = 0;
  for (const q of questions) {
    const srs = srsData[q.id];
    if (srs && srs.quality !== null) {
      totalRated++;
      if (srs.quality >= 3) correctCount++;
    }
  }

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
      totalCards: questions.length,
      totalReviewed,
      dueCount: due.length,
      newCount: limitedNew.length,
      retention: totalRated > 0 ? Math.round((correctCount / totalRated) * 100) : 0,
      maturity,
      forecast,
    },
  };
}
