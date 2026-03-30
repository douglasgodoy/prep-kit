import { useState } from "react";
import { buildPrompt, uid } from "./data.js";

export default function ActionModal({ topics, onAddQuestions, onClose }) {
  const [tab, setTab] = useState("generate"); // "generate" | "manual"
  const [targetTopic, setTargetTopic] = useState(topics[0]?.id || "");
  const [genSubtopic, setGenSubtopic] = useState("");
  const [genCount, setGenCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [manualQ, setManualQ] = useState({ subtopic: "", question: "", answer: "" });
  const [success, setSuccess] = useState("");

  const selectedTopic = topics.find((t) => t.id === targetTopic);

  async function handleGenerate() {
    if (!genSubtopic.trim() || !selectedTopic) return;
    setGenerating(true);
    setGenError("");
    setSuccess("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: buildPrompt(selectedTopic.label, genSubtopic, genCount),
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
        subtopic: genSubtopic,
        question: q.question,
        answer: q.answer,
      }));
      onAddQuestions(targetTopic, newQs);
      setSuccess(`Added ${newQs.length} questions to ${selectedTopic.label}`);
    } catch (e) {
      setGenError("Generation failed — check console for details.");
      console.error(e);
    }
    setGenerating(false);
  }

  function handleManualAdd() {
    if (!manualQ.question.trim() || !manualQ.answer.trim()) return;
    const newQ = {
      id: uid(),
      subtopic: manualQ.subtopic || "General",
      question: manualQ.question,
      answer: manualQ.answer,
    };
    onAddQuestions(targetTopic, [newQ]);
    setManualQ({ subtopic: "", question: "", answer: "" });
    setSuccess(`Added question to ${selectedTopic?.label}`);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__tabs">
            <button
              className={`modal__tab ${tab === "generate" ? "modal__tab--active" : ""}`}
              onClick={() => { setTab("generate"); setSuccess(""); }}
            >
              <span className="modal__tab-icon">✦</span>
              AI Generate
            </button>
            <button
              className={`modal__tab ${tab === "manual" ? "modal__tab--active" : ""}`}
              onClick={() => { setTab("manual"); setSuccess(""); }}
            >
              <span className="modal__tab-icon">+</span>
              Manual Add
            </button>
          </div>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        {/* topic selector — shared by both tabs */}
        <div className="modal__field">
          <label className="field-label">Target Topic</label>
          <div className="topic-selector">
            {topics.map((t) => (
              <button
                key={t.id}
                className={`topic-selector__btn ${targetTopic === t.id ? "topic-selector__btn--active" : ""}`}
                style={{
                  borderColor: targetTopic === t.id ? t.color : undefined,
                  color: targetTopic === t.id ? t.color : undefined,
                }}
                onClick={() => setTargetTopic(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "generate" ? (
          <div className="modal__body">
            <div className="modal__row">
              <div className="modal__field modal__field--grow">
                <label className="field-label">Subtopic</label>
                <input
                  className="field-input"
                  value={genSubtopic}
                  onChange={(e) => setGenSubtopic(e.target.value)}
                  placeholder="e.g. Design Patterns"
                />
              </div>
              <div className="modal__field">
                <label className="field-label">Count</label>
                <select
                  className="field-select"
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                >
                  {[2, 3, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className={`gen-btn gen-btn--full ${generating ? "gen-btn--loading" : ""}`}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <span className="gen-btn__spinner" /> : "Generate Questions"}
            </button>
            {genError && <div className="modal__error">{genError}</div>}
          </div>
        ) : (
          <div className="modal__body">
            <div className="modal__field">
              <label className="field-label">Subtopic</label>
              <input
                className="field-input"
                value={manualQ.subtopic}
                onChange={(e) => setManualQ((p) => ({ ...p, subtopic: e.target.value }))}
                placeholder="e.g. Design Patterns"
              />
            </div>
            <div className="modal__field">
              <label className="field-label">Question</label>
              <input
                className="field-input"
                value={manualQ.question}
                onChange={(e) => setManualQ((p) => ({ ...p, question: e.target.value }))}
                placeholder="What is…?"
              />
            </div>
            <div className="modal__field">
              <label className="field-label">Answer</label>
              <textarea
                className="field-textarea"
                value={manualQ.answer}
                onChange={(e) => setManualQ((p) => ({ ...p, answer: e.target.value }))}
                placeholder="Detailed answer…"
                rows={4}
              />
            </div>
            <button className="gen-btn gen-btn--full" onClick={handleManualAdd}>
              Add Question
            </button>
          </div>
        )}

        {success && <div className="modal__success">{success}</div>}
      </div>
    </div>
  );
}
