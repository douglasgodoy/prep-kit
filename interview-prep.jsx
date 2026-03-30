import { useState, useEffect, useRef } from "react";

// ── seed data ──────────────────────────────────────────────────────────────
const SEED_TOPICS = [
  {
    id: "backend",
    label: "Backend Fundamentals",
    icon: "⚙️",
    color: "#00ff9d",
    questions: [
      {
        id: "b1",
        subtopic: "Design Patterns",
        question: "What is the Builder pattern?",
        answer:
          "Builder is a creational design pattern that lets you construct complex objects step by step. It separates object construction from its representation, so the same construction process can create different representations. In TypeScript/Node.js you'll often see it when building query objects, HTTP requests, or configuration objects — e.g. a QueryBuilder class with chainable methods like .where(), .limit(), .orderBy() that returns `this`, finishing with a terminal .build() or .execute() call.",
      },
      {
        id: "b2",
        subtopic: "Design Patterns",
        question: "What is the Singleton pattern?",
        answer:
          "Singleton ensures a class has only one instance and provides a global access point to it. In Node.js this is commonly used for database connection pools, loggers, or configuration managers. Because Node.js caches `require()` calls, a module that exports an instance is effectively a singleton. With ES modules or TypeScript, you can also use a static `getInstance()` method with a private constructor. Watch out for testing issues — singletons carry state between tests and can make mocking harder.",
      },
      {
        id: "b3",
        subtopic: "Design Patterns",
        question: "What is the difference between Builder and Factory patterns?",
        answer:
          "Factory (Factory Method / Abstract Factory) focuses on *which* object to create — it decides the type at runtime and returns a ready-to-use object in one call. Builder focuses on *how* to construct a complex object step-by-step, giving you fine-grained control over each part before the object is finalised. Use Factory when the object type varies; use Builder when the object has many optional configuration steps or a complex construction sequence.",
      },
    ],
  },
  {
    id: "typescript",
    label: "TypeScript",
    icon: "🔷",
    color: "#3178c6",
    questions: [
      {
        id: "t1",
        subtopic: "Type System",
        question: "What is the difference between `type` and `interface` in TypeScript?",
        answer:
          "`interface` is extendable (you can `extends` or do declaration merging), making it ideal for object shapes that may be augmented. `type` is more flexible — it can represent unions, intersections, primitives, tuples, and mapped types, but cannot be merged. Rule of thumb: use `interface` for public API shapes and class contracts; use `type` for unions, utility types, and aliases. In practice, both work for simple object shapes.",
      },
      {
        id: "t2",
        subtopic: "Generics",
        question: "What are generics and why are they useful?",
        answer:
          "Generics let you write reusable, type-safe code that works across multiple types without sacrificing type information. Instead of using `any`, you parameterise a function or class: `function identity<T>(arg: T): T`. The caller provides the concrete type and TypeScript enforces correctness throughout. Common use-cases: collections, API response wrappers (`ApiResponse<T>`), higher-order functions, and utility types like `Partial<T>` or `Record<K, V>`.",
      },
    ],
  },
  {
    id: "react",
    label: "React",
    icon: "⚛️",
    color: "#61dafb",
    questions: [
      {
        id: "r1",
        subtopic: "Hooks",
        question: "Explain the difference between `useEffect` and `useLayoutEffect`.",
        answer:
          "`useEffect` runs asynchronously *after* the browser has painted the screen, making it safe for data fetching, subscriptions, and side-effects that don't touch the DOM visually. `useLayoutEffect` runs synchronously *after* DOM mutations but *before* the browser paints — use it when you need to read layout (e.g. element dimensions) and synchronously re-render to avoid a visual flicker. In most cases `useEffect` is the right choice; reach for `useLayoutEffect` only when you observe flickering caused by a DOM measurement.",
      },
      {
        id: "r2",
        subtopic: "Performance",
        question: "What is React.memo and when should you use it?",
        answer:
          "`React.memo` is a higher-order component that memoises the rendered output of a functional component and skips re-rendering if its props haven't changed (shallow comparison). Use it for pure functional components that render often with the same props, especially in lists or expensive sub-trees. Don't apply it blindly — it adds memory overhead and comparison cost, so it only wins when re-renders are actually expensive or frequent. Pair it with `useCallback` to stabilise function props.",
      },
    ],
  },
  {
    id: "nodejs",
    label: "Node.js",
    icon: "🟢",
    color: "#68a063",
    questions: [
      {
        id: "n1",
        subtopic: "Event Loop",
        question: "How does the Node.js event loop work?",
        answer:
          "Node.js runs on a single-threaded event loop powered by libuv. The loop has phases: timers (setTimeout/setInterval callbacks), pending callbacks (deferred I/O errors), idle/prepare, poll (fetch new I/O events — blocks here if queue is empty), check (setImmediate), and close callbacks. `process.nextTick()` and Promise microtasks run between every phase transition, before the next phase starts. Understanding this prevents blocking bugs: never run heavy synchronous CPU work on the main thread — offload to worker_threads or child_process.",
      },
    ],
  },
];

// ── AI prompt builder ──────────────────────────────────────────────────────
function buildPrompt(topic, subtopic, count) {
  return `You are a senior software engineer preparing interview questions for developers specialising in TypeScript, React, and Node.js.

Generate exactly ${count} high-quality technical interview questions with detailed answers for the following:
- Topic: ${topic}
- Subtopic: ${subtopic}

Requirements:
- Questions should range from mid to senior level.
- Answers must be detailed (3–5 sentences minimum), accurate, and mention real-world usage.
- Include code snippets or examples where relevant (use plain text, no markdown fences).
- Cover different angles: conceptual understanding, practical usage, trade-offs.

Respond ONLY with a valid JSON array. No preamble, no markdown, no backticks.
Format:
[
  {
    "question": "...",
    "answer": "..."
  }
]`;
}

// ── tiny uid ───────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Card component ─────────────────────────────────────────────────────────
function QACard({ item, index }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div
      style={{
        background: revealed ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${revealed ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 8,
        padding: "20px 24px",
        marginBottom: 12,
        transition: "all 0.25s",
        cursor: "pointer",
      }}
      onClick={() => setRevealed((v) => !v)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            color: "#555",
            minWidth: 28,
            paddingTop: 2,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: "'Courier New', monospace",
              color: "#666",
              marginBottom: 6,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {item.subtopic}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#e8e8e8",
              lineHeight: 1.5,
              letterSpacing: "-0.01em",
            }}
          >
            {item.question}
          </div>
          {revealed && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13.5,
                color: "#b0b0b0",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {item.answer}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 12,
            color: revealed ? "#00ff9d" : "#444",
            minWidth: 20,
            textAlign: "right",
            paddingTop: 2,
            transition: "color 0.2s",
          }}
        >
          {revealed ? "▲" : "▼"}
        </span>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [topics, setTopics] = useState(SEED_TOPICS);
  const [activeTopicId, setActiveTopicId] = useState("backend");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genSubtopic, setGenSubtopic] = useState("Design Patterns");
  const [genCount, setGenCount] = useState(3);
  const [addOpen, setAddOpen] = useState(false);
  const [manualQ, setManualQ] = useState({ subtopic: "", question: "", answer: "" });

  const activeTopic = topics.find((t) => t.id === activeTopicId);

  // generate via Anthropic API
  async function handleGenerate() {
    if (!genSubtopic.trim()) return;
    setGenerating(true);
    setGenError("");
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
              content: buildPrompt(activeTopic.label, genSubtopic, genCount),
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
      setTopics((prev) =>
        prev.map((t) =>
          t.id === activeTopicId
            ? { ...t, questions: [...t.questions, ...newQs] }
            : t
        )
      );
    } catch (e) {
      setGenError("Failed to generate questions. Check console.");
      console.error(e);
    }
    setGenerating(false);
  }

  // manual add
  function handleManualAdd() {
    if (!manualQ.question.trim() || !manualQ.answer.trim()) return;
    const newQ = { id: uid(), subtopic: manualQ.subtopic || "General", ...manualQ };
    setTopics((prev) =>
      prev.map((t) =>
        t.id === activeTopicId ? { ...t, questions: [...t.questions, newQ] } : t
      )
    );
    setManualQ({ subtopic: "", question: "", answer: "" });
    setAddOpen(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        color: "#e8e8e8",
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── header ── */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(13,13,13,0.95)",
          backdropFilter: "blur(8px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⌨</span>
          <div>
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                color: "#555",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Tech Interview
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
              Prep Kit
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            color: "#444",
            letterSpacing: "0.1em",
          }}
        >
          TS · REACT · NODE
        </div>
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        {/* ── sidebar ── */}
        <nav
          style={{
            width: 220,
            borderRight: "1px solid rgba(255,255,255,0.07)",
            padding: "24px 0",
            flexShrink: 0,
          }}
        >
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTopicId(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 24px",
                background: activeTopicId === t.id ? "rgba(255,255,255,0.05)" : "transparent",
                border: "none",
                borderLeft: `3px solid ${activeTopicId === t.id ? t.color : "transparent"}`,
                color: activeTopicId === t.id ? "#fff" : "#666",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 13.5,
                fontFamily: "'Georgia', serif",
                transition: "all 0.15s",
              }}
            >
              <span>{t.icon}</span>
              <div>
                <div style={{ fontWeight: activeTopicId === t.id ? 600 : 400 }}>{t.label}</div>
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    color: activeTopicId === t.id ? t.color : "#444",
                    marginTop: 1,
                  }}
                >
                  {t.questions.length} questions
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* ── main ── */}
        <main style={{ flex: 1, padding: "28px 36px", maxWidth: 820 }}>
          {/* topic header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: activeTopic?.color,
                }}
              >
                {activeTopic?.icon} {activeTopic?.label}
              </h1>
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11,
                  color: "#555",
                }}
              >
                {activeTopic?.questions.length} Q&amp;As · click to reveal
              </span>
            </div>
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, ${activeTopic?.color}44, transparent)`,
              }}
            />
          </div>

          {/* questions */}
          {activeTopic?.questions.map((q, i) => (
            <QACard key={q.id} item={q} index={i} />
          ))}

          {/* ── AI generate panel ── */}
          <div
            style={{
              marginTop: 36,
              padding: "22px 24px",
              border: "1px dashed rgba(0,255,157,0.25)",
              borderRadius: 8,
              background: "rgba(0,255,157,0.03)",
            }}
          >
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                color: "#00ff9d",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              ✦ AI Question Generator
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    color: "#555",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Subtopic
                </label>
                <input
                  value={genSubtopic}
                  onChange={(e) => setGenSubtopic(e.target.value)}
                  placeholder="e.g. Design Patterns"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 5,
                    color: "#e8e8e8",
                    padding: "8px 12px",
                    fontSize: 13,
                    fontFamily: "'Courier New', monospace",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ minWidth: 90 }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    color: "#555",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Count
                </label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 5,
                    color: "#e8e8e8",
                    padding: "8px 10px",
                    fontSize: 13,
                    fontFamily: "'Courier New', monospace",
                    cursor: "pointer",
                    outline: "none",
                    width: "100%",
                  }}
                >
                  {[2, 3, 5].map((n) => (
                    <option key={n} value={n} style={{ background: "#1a1a1a" }}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  background: generating ? "rgba(0,255,157,0.1)" : "rgba(0,255,157,0.15)",
                  border: "1px solid rgba(0,255,157,0.4)",
                  borderRadius: 5,
                  color: "#00ff9d",
                  padding: "8px 20px",
                  fontSize: 13,
                  fontFamily: "'Courier New', monospace",
                  cursor: generating ? "not-allowed" : "pointer",
                  letterSpacing: "0.06em",
                  transition: "all 0.15s",
                }}
              >
                {generating ? "Generating…" : "Generate ↗"}
              </button>
            </div>
            {genError && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#ff6b6b",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {genError}
              </div>
            )}
          </div>

          {/* ── manual add ── */}
          <div style={{ marginTop: 16 }}>
            {!addOpen ? (
              <button
                onClick={() => setAddOpen(true)}
                style={{
                  background: "transparent",
                  border: "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  color: "#555",
                  padding: "9px 18px",
                  fontSize: 12,
                  fontFamily: "'Courier New', monospace",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  width: "100%",
                  transition: "all 0.15s",
                }}
              >
                + Add question manually
              </button>
            ) : (
              <div
                style={{
                  padding: "20px 22px",
                  border: "1px dashed rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 10,
                    color: "#555",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Manual Entry
                </div>
                {[
                  { key: "subtopic", label: "Subtopic", placeholder: "e.g. Design Patterns" },
                  { key: "question", label: "Question", placeholder: "What is…?" },
                  { key: "answer", label: "Answer", placeholder: "Detailed answer…", multi: true },
                ].map(({ key, label, placeholder, multi }) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "'Courier New', monospace",
                        fontSize: 10,
                        color: "#555",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                      }}
                    >
                      {label}
                    </label>
                    {multi ? (
                      <textarea
                        value={manualQ[key]}
                        onChange={(e) => setManualQ((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        rows={4}
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: 5,
                          color: "#e8e8e8",
                          padding: "8px 12px",
                          fontSize: 13,
                          fontFamily: "'Georgia', serif",
                          outline: "none",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    ) : (
                      <input
                        value={manualQ[key]}
                        onChange={(e) => setManualQ((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: 5,
                          color: "#e8e8e8",
                          padding: "8px 12px",
                          fontSize: 13,
                          fontFamily: "'Courier New', monospace",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleManualAdd}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 5,
                      color: "#e8e8e8",
                      padding: "8px 18px",
                      fontSize: 12,
                      fontFamily: "'Courier New', monospace",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setAddOpen(false)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 5,
                      color: "#555",
                      padding: "8px 14px",
                      fontSize: 12,
                      fontFamily: "'Courier New', monospace",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
