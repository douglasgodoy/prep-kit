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
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easinessFactor);
    }
    newRepetition = repetition + 1;
  } else {
    newRepetition = 0;
    newInterval = 1;
  }

  const newEF = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const clampedEF = Math.max(1.3, newEF);

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

export function isDue(srsData) {
  if (!srsData.nextReviewDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(srsData.nextReviewDate) <= today;
}

export function isNew(srsData) {
  return srsData.repetition === 0 && !srsData.lastReviewDate;
}

export function getIntervalPreview(quality, repetition, easinessFactor, interval) {
  const result = sm2(quality, repetition, easinessFactor, interval);
  const days = result.interval;
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
}
