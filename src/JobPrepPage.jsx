import { useState } from "react";
import { uid } from "./data.js";
import QACard from "./QACard.jsx";
import { useI18n } from "./i18n/I18nContext.jsx";

function buildJobPrepPrompt(jobDescription) {
  return `You are a senior technical interviewer. Based on the following job description, generate 10 high-quality technical interview questions with detailed answers that a recruiter or technical interviewer would likely ask a candidate.

Job Description:
${jobDescription}

Requirements:
- Mix of behavioral, technical, and system design questions
- Questions should be specific to the technologies and responsibilities mentioned in the JD
- Answers should be detailed (3-5 sentences), practical, and demonstrate senior-level understanding
- Include questions about: specific technologies mentioned, architectural decisions, team collaboration, and problem-solving scenarios
- Rate each question's likelihood of being asked from 1-10

Respond ONLY with a valid JSON array. No preamble, no markdown, no backticks.
Format:
[
  {
    "subtopic": "category like 'Technical Deep-Dive' or 'System Design' or 'Behavioral'",
    "question": "...",
    "answer": "...",
    "popularity": 8
  }
]`;
}

export default function JobPrepPage({ topics, onAddQuestions, onBack }) {
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [results, setResults] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const { t } = useI18n();

  async function handleGenerate() {
    if (!jobDescription.trim()) return;
    setGenerating(true);
    setGenError("");
    setResults([]);
    setSaved(false);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: buildJobPrepPrompt(jobDescription),
            },
          ],
        }),
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "[]";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const newQs = parsed.map((q) => ({
        id: uid(),
        subtopic: q.subtopic || "General",
        question: q.question,
        answer: q.answer,
        popularity: q.popularity || 5,
      }));
      // Sort by popularity descending
      newQs.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      setResults(newQs);
    } catch (e) {
      setGenError(t("modal.generationFailed"));
      console.error(e);
    }
    setGenerating(false);
  }

  function handleSaveToTopic() {
    if (saved || results.length === 0) return;
    const careerTopic = topics.find((tp) => tp.id === "mycareer");
    if (careerTopic) {
      onAddQuestions("mycareer", results);
      setSaved(true);
    }
  }

  return (
    <div className="jobprep">
      <button className="question-list__back" onClick={onBack}>
        {t("questionList.back")}
      </button>

      <div className="jobprep__header">
        <h1 className="jobprep__title">{t("jobprep.title")}</h1>
        <p className="jobprep__subtitle">
          {t("jobprep.subtitle")}
        </p>
      </div>

      <div className="jobprep__form">
        <div className="jobprep__field">
          <label className="field-label">{t("jobprep.jobTitle")}</label>
          <input
            className="field-input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={t("jobprep.jobTitlePlaceholder")}
          />
        </div>
        <div className="jobprep__field">
          <label className="field-label">{t("jobprep.jobDescription")}</label>
          <textarea
            className="field-textarea jobprep__textarea"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t("jobprep.jobDescPlaceholder")}
            rows={10}
          />
        </div>
        <button
          className={`gen-btn gen-btn--full ${generating ? "gen-btn--loading" : ""}`}
          onClick={handleGenerate}
          disabled={generating || !jobDescription.trim()}
        >
          {generating ? (
            <>
              <span className="gen-btn__spinner" /> {t("jobprep.generating")}
            </>
          ) : (
            t("jobprep.generateBtn")
          )}
        </button>
        {genError && <div className="jobprep__error">{genError}</div>}
      </div>

      {results.length > 0 && (
        <div className="jobprep__results">
          <div className="jobprep__results-header">
            <div>
              <h2 className="jobprep__results-title">
                {jobTitle
                  ? t("jobprep.questionsFor", { title: jobTitle })
                  : t("jobprep.generatedQuestions")}
              </h2>
              <span className="jobprep__results-count">
                {results.length} {t("jobprep.sortedBy")}
              </span>
            </div>
            <button className="btn btn--accent" onClick={handleSaveToTopic} disabled={saved}>
              {saved ? "✓ " + t("jobprep.saved") : t("jobprep.saveToCareer")}
            </button>
          </div>

          <div className="cards">
            {results.map((q, i) => (
              <div key={q.id} className="jobprep__card-wrapper">
                <div className="jobprep__popularity">
                  <div
                    className="jobprep__popularity-bar"
                    style={{ width: `${(q.popularity || 5) * 10}%` }}
                  />
                  <span className="jobprep__popularity-label">
                    {q.popularity}/10
                  </span>
                </div>
                <QACard
                  item={q}
                  index={i}
                  topicColor="#a855f7"
                  delay={i * 50}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
