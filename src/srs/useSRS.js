import { useState, useCallback } from "react";
import { sm2, createDefaultSRSData, getIntervalPreview } from "./sm2.js";
import { loadSRSData, updateQuestionSRS, recordSession, loadStats } from "./storage.js";
import { buildQueues, MODES } from "./queue.js";

export { MODES };

export function useSRS(topics) {
  const [srsData, setSrsData] = useState(() => loadSRSData());
  const [stats, setStats] = useState(() => loadStats());

  const getQueues = useCallback(
    (mode) => buildQueues(topics, mode),
    [topics]
  );

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

  const endSession = useCallback((cardsReviewed) => {
    const newStats = recordSession(cardsReviewed);
    setStats({ ...newStats });
    return newStats;
  }, []);

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

  const getIntervalPreviews = useCallback((questionId) => {
    const srs = srsData[questionId] || createDefaultSRSData(questionId);
    return [0, 1, 2, 3, 4, 5].map((q) => ({
      quality: q,
      label: getIntervalPreview(q, srs.repetition, srs.easinessFactor, srs.interval),
    }));
  }, [srsData]);

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
