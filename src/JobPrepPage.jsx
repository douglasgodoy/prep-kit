import { useState } from "react";
import { uid } from "./data.js";
import QACard from "./QACard.jsx";

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

  async function handleGenerate() {
    if (!jobDescription.trim()) return;
    setGenerating(true);
    setGenError("");
    setResults([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
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
      const raw = data.content?.find((b) => b.type === "text")?.text || "[]";
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
      setGenError("Generation failed — check console for details.");
      console.error(e);
    }
    setGenerating(false);
  }

  function handleSaveToTopic() {
    // Save to "mycareer" topic if it exists, otherwise create a new one
    const careerTopic = topics.find((t) => t.id === "mycareer");
    if (careerTopic) {
      onAddQuestions("mycareer", results);
    }
  }

  return (
    <div className="jobprep">
      <button className="question-list__back" onClick={onBack}>
        ← Back
      </button>

      <div className="jobprep__header">
        <h1 className="jobprep__title">Job Prep</h1>
        <p className="jobprep__subtitle">
          Paste a job description below and get tailored interview questions that recruiters and technical interviewers are likely to ask.
        </p>
      </div>

      <div className="jobprep__form">
        <div className="jobprep__field">
          <label className="field-label">Job Title (optional)</label>
          <input
            className="field-input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Backend Engineer at Stripe"
          />
        </div>
        <div className="jobprep__field">
          <label className="field-label">Job Description</label>
          <textarea
            className="field-textarea jobprep__textarea"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
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
              <span className="gen-btn__spinner" /> Analyzing job description...
            </>
          ) : (
            "Generate Interview Questions"
          )}
        </button>
        {genError && <div className="jobprep__error">{genError}</div>}
      </div>

      {results.length > 0 && (
        <div className="jobprep__results">
          <div className="jobprep__results-header">
            <div>
              <h2 className="jobprep__results-title">
                {jobTitle ? `Questions for: ${jobTitle}` : "Generated Questions"}
              </h2>
              <span className="jobprep__results-count">
                {results.length} questions · sorted by likelihood
              </span>
            </div>
            <button className="btn btn--accent" onClick={handleSaveToTopic}>
              Save to My Career
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
