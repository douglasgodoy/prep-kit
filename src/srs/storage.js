const STORAGE_KEY = "iprep_srs_data";
const STATS_KEY = "iprep_srs_stats";

export function loadSRSData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSRSData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateQuestionSRS(questionId, updates) {
  const data = loadSRSData();
  data[questionId] = { ...data[questionId], ...updates };
  saveSRSData(data);
  return data;
}

export function resetQuestionSRS(questionId) {
  const data = loadSRSData();
  delete data[questionId];
  saveSRSData(data);
  return data;
}

export function resetAllSRS() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STATS_KEY);
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { streak: 0, lastStudyDate: null, dailyCounts: {} };
  } catch {
    return { streak: 0, lastStudyDate: null, dailyCounts: {} };
  }
}

export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordSession(cardsReviewed) {
  const stats = loadStats();
  const today = new Date().toISOString().slice(0, 10);
  stats.dailyCounts[today] = (stats.dailyCounts[today] || 0) + cardsReviewed;
  if (stats.lastStudyDate) {
    const lastDate = new Date(stats.lastStudyDate);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.streak += 1;
    } else if (diffDays > 1) {
      stats.streak = 1;
    }
  } else {
    stats.streak = 1;
  }
  stats.lastStudyDate = today;
  saveStats(stats);
  return stats;
}

export function exportData() {
  return JSON.stringify({
    srs: loadSRSData(),
    stats: loadStats(),
    exportDate: new Date().toISOString(),
  }, null, 2);
}

export function importData(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (parsed.srs) saveSRSData(parsed.srs);
  if (parsed.stats) saveStats(parsed.stats);
}
