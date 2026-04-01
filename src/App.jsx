import { useState, useEffect, useRef } from "react";
import { SEED_TOPICS } from "./data.js";
import Dashboard from "./Dashboard.jsx";
import QuestionList from "./QuestionList.jsx";
import SearchResults from "./SearchResults.jsx";
import ActionModal from "./ActionModal.jsx";
import CVPage from "./CVPage.jsx";
import JobPrepPage from "./JobPrepPage.jsx";
import ReviewDashboard from "./ReviewDashboard.jsx";
import ReviewSession from "./ReviewSession.jsx";
import { useSRS } from "./srs/useSRS.js";
import { useI18n } from "./i18n/I18nContext.jsx";
import "./App.css";

const TOPICS_STORAGE_KEY = "iprep_topics";

export default function App() {
  const [topics, setTopics] = useState(() => {
    try {
      const saved = localStorage.getItem(TOPICS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED_TOPICS;
    } catch {
      return SEED_TOPICS;
    }
  });
  const [view, setView] = useState("dashboard");
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reviewMode, setReviewMode] = useState(null);
  const [reviewSessionType, setReviewSessionType] = useState(null);
  const searchRef = useRef(null);
  const srs = useSRS(topics);
  const { locale, t, changeLocale } = useI18n();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  const activeTopic = topics.find((t) => t.id === activeTopicId);

  function handleSelectTopic(id) {
    if (id === "__cv__") {
      setView("cv");
      setSearchQuery("");
      return;
    }
    if (id === "__jobprep__") {
      setView("jobprep");
      setSearchQuery("");
      return;
    }
    if (id === "__review__") {
      setView("reviewdash");
      setSearchQuery("");
      return;
    }
    if (id === "__management__") {
      setView("management");
      setSearchQuery("");
      return;
    }
    setActiveTopicId(id);
    setSearchQuery("");
    setView("topic");
  }

  function handleBack() {
    setActiveTopicId(null);
    setSearchQuery("");
    setView("dashboard");
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      setView("search");
    } else if (activeTopicId) {
      setView("topic");
    } else {
      setView("dashboard");
    }
  }

  function handleSearchClear() {
    setSearchQuery("");
    if (activeTopicId) {
      setView("topic");
    } else {
      setView("dashboard");
    }
    searchRef.current?.focus();
  }

  function handleAddQuestions(topicId, newQuestions) {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, questions: [...t.questions, ...newQuestions] }
          : t
      )
    );
  }

  function handleEditQuestion(topicId, questionId, updatedFields) {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              questions: t.questions.map((q) =>
                q.id === questionId ? { ...q, ...updatedFields } : q
              ),
            }
          : t
      )
    );
  }

  function handleDeleteQuestion(topicId, questionId) {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, questions: t.questions.filter((q) => q.id !== questionId) }
          : t
      )
    );
    srs.removeQuestion(questionId);
  }

  function handleStartReview(mode, sessionType) {
    setReviewMode(mode);
    setReviewSessionType(sessionType);
    setView("reviewsession");
  }

  function handleFinishReview() {
    setReviewMode(null);
    setReviewSessionType(null);
    setView("reviewdash");
  }

  const totalQuestions = topics.reduce((s, t) => s + t.questions.length, 0);

  return (
    <div className={`app ${mounted ? "app--mounted" : ""}`}>
      <div className="grain" />

      {/* ── header ── */}
      <header className="header">
        <button className="header__brand" onClick={handleBack}>
          <div className="header__logo">IP</div>
          <div className="header__titles">
            <div className="header__eyebrow">{t("header.eyebrow")}</div>
            <div className="header__title">{t("header.title")}</div>
          </div>
        </button>

        <div className="header__search">
          <span className="header__search-icon">⌕</span>
          <input
            ref={searchRef}
            className="header__search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t("header.search")}
          />
          {searchQuery && (
            <button className="header__search-clear" onClick={handleSearchClear}>
              ×
            </button>
          )}
        </div>

        <button
          className="header__lang"
          onClick={() => changeLocale(locale === "en" ? "pt-BR" : "en")}
        >
          {locale === "en" ? "PT" : "EN"}
        </button>

        <div className="header__meta">
          <span className="header__dot" />
          {totalQuestions} {t("header.questions")}
        </div>
      </header>

      {/* ── content ── */}
      <div className="content">
        {view === "dashboard" && (
          <Dashboard topics={topics} onSelectTopic={handleSelectTopic} />
        )}
        {view === "topic" && activeTopic && (
          <QuestionList topic={activeTopic} onBack={handleBack} getStatus={srs.getStatus} />
        )}
        {view === "search" && (
          <SearchResults query={searchQuery} topics={topics} />
        )}
        {view === "cv" && (
          <CVPage onBack={handleBack} />
        )}
        {view === "jobprep" && (
          <JobPrepPage topics={topics} onAddQuestions={handleAddQuestions} onBack={handleBack} />
        )}
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
      </div>

      {/* ── FAB ── */}
      <button className="fab" onClick={() => setModalOpen(true)} title="Add questions">
        <span className="fab__icon">+</span>
      </button>

      {/* ── modal ── */}
      {modalOpen && (
        <ActionModal
          topics={topics}
          onAddQuestions={handleAddQuestions}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
