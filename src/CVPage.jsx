import { useState } from "react";
import { useI18n } from "./i18n/I18nContext.jsx";

const CAREER = {
  name: "Douglas Godoy Cardoso",
  title: "Senior Fullstack Engineer | AI Systems Specialist",
  summary:
    "Full-stack Senior Software Engineer with 7+ years building AI-powered applications, scalable distributed systems, and high-performance data pipelines. Proven expertise architecting production RAG systems with vector databases, LLM integration, and semantic retrieval achieving 85% accuracy improvement and 60% support reduction.",
  contact: {
    email: "douglasgodoy1998@hotmail.com",
    phone: "+55 (44) 99931-7317",
    linkedin: "linkedin.com/in/douglasgodoy",
    github: "github.com/douglasgodoy",
  },
  highlights: [
    { label: "Years of Experience", value: "7+", color: "#E8A838" },
    { label: "Daily Transactions", value: "$10M+", color: "#3178c6" },
    { label: "Accuracy Improvement", value: "85%", color: "#4ade80" },
    { label: "Feature Delivery", value: "3x Faster", color: "#61dafb" },
  ],
  skills: {
    "AI & Data": [
      "RAG (Retrieval-Augmented Generation)",
      "Vector Databases (pgVector, Qdrant)",
      "LLM Integration (GPT-4, Claude, Gemini)",
      "Embeddings & Semantic Search",
      "Prompt Engineering",
      "Anomaly Detection",
    ],
    "Languages & Frameworks": [
      "TypeScript",
      "JavaScript",
      "Node.js (NestJS, Express)",
      "React / Next.js",
      "Java",
      "Python",
      "Prisma ORM",
    ],
    "Data & Infrastructure": [
      "PostgreSQL",
      "MongoDB",
      "DynamoDB",
      "MySQL",
      "Redis",
      "Elasticsearch",
      "Kafka",
      "RabbitMQ",
      "GraphQL / REST / WebSockets",
    ],
    "Cloud & DevOps": [
      "AWS (Lambda, ECS, S3, RDS, SQS, SNS, CloudWatch)",
      "Docker & Kubernetes",
      "Terraform",
      "CI/CD (GitHub Actions, Vercel)",
      "Observability (CloudWatch, ELK)",
    ],
    "Testing & Practices": [
      "Jest / Vitest / React Testing Library",
      "Cypress / Playwright",
      "TDD",
      "Clean Architecture / SOLID / DDD",
      "Microservices & Event-Driven Architecture",
    ],
    "Mobile & Frontend": [
      "React Native / Flutter / Expo",
      "Tailwind CSS / Styled Components",
      "Shadcn/UI / Radix UI",
      "Framer Motion",
      "Storybook",
    ],
  },
  experience: [
    {
      company: "Lex Consultoria",
      role: "Tech Lead",
      period: "Aug 2025 - Present",
      color: "#E8A838",
      bullets: [
        "Built full-stack telemedicine platform with React frontend and Node.js backend integrating Jitsi video calls, real-time chat, and medical document upload serving 20,000+ employees",
        "Developed HR management system integrated with TOTVS ERP implementing RAG with OpenAI and pgVector for intelligent queries about salary, vacation, and organizational data",
        "Created anomaly detection system with Gemini for time-tracking analysis, automating alerts for managers and saving 20+ hours/week in manual review",
        "Implemented AI pipeline with Gemini API for automated medical consultation analysis, generating personalized reports for 500+ daily consultations",
      ],
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "pgVector", "RAG", "Jitsi", "Gemini API", "OpenAI API"],
    },
    {
      company: "TateAI",
      role: "Senior Fullstack Engineer (Part-time)",
      period: "May 2024 - Aug 2025",
      color: "#a855f7",
      bullets: [
        "Developed generative AI platform for agile backlog management that organizes, prioritizes, and documents user stories and epics, reducing ideation costs by 80%",
        "Responsible for complete React frontend architecture implementing real-time streaming for chat management with 1000+ concurrent connections",
        "Built meeting analysis module with automatic extraction of insights, summaries, and highlights using LLM integration",
        "Created backoffice dashboard with analytics data visualization and usage metrics",
      ],
      skills: ["React", "Node.js", "TypeScript", "Qdrant", "MongoDB", "LLM Integration", "Streaming"],
    },
    {
      company: "BTG Pactual",
      role: "Fullstack Software Engineer",
      period: "Apr 2024 - Aug 2025",
      color: "#3178c6",
      bullets: [
        "Developed web and backend applications with Node.js, Java, and Next.js focused on financial market systems processing $10M+ daily transactions",
        "Architected serverless projects with AWS Lambda, DynamoDB, MySQL, S3, SNS, SQS, and Kafka achieving 99.9% uptime",
        "Created and maintained global financial CRM using Next.js and Node.js, supporting Tech Lead in frontend decisions",
        "Led migration of legacy Java services to Node.js, reducing infrastructure costs by 35% and improving response times by 45%",
        "Mastered AI-assisted development (Claude Code, Copilot, Amazon Q) to ship features 3x faster",
      ],
      skills: ["TypeScript", "AWS", "Kubernetes", "Java", "Next.js", "Lambda", "Prisma", "PostgreSQL", "Kafka"],
    },
    {
      company: "FAVO",
      role: "Senior Software Engineer",
      period: "Jan 2022 - Feb 2024",
      color: "#68a063",
      bullets: [
        "Developed microservices in TypeScript with AWS infrastructure serving 100,000+ daily requests with 99.95% availability",
        "Integrated financial systems using MongoDB, DynamoDB, and serverless architecture processing $5M+ monthly transactions",
        "Built e-commerce platform with Flutter and Next.js/React Native frontend serving 6,000+ active users",
        "Led technical approaches for backend solutions, optimizing core functions and achieving 60% latency reduction",
        "Optimized core user flows achieving 35% improvement in conversion rates through A/B testing",
      ],
      skills: ["TypeScript", "AWS Lambda", "DynamoDB", "MongoDB", "Flutter", "React Native", "Next.js"],
    },
    {
      company: "Concrete/Accenture",
      role: "Fullstack Engineer",
      period: "Jun 2021 - Jan 2022",
      color: "#61dafb",
      bullets: [
        "Developed APIs and authentication systems using Node.js and AWS services for enterprise clients",
        "Improved authentication scope security, implementing OAuth 2.0 and JWT best practices",
        "Maintained and supported multilingual website with i18n support for global audience",
      ],
      skills: ["TypeScript", "AWS", "Cognito", "Lambda", "S3", "SQS", "API Gateway"],
    },
    {
      company: "Pontaltech",
      role: "Backend Engineer",
      period: "Aug 2020 - Jun 2021",
      color: "#f97316",
      bullets: [
        "Developed backend solutions with Node.js and PHP for high-performance messaging systems",
        "Built microservices using RabbitMQ and AWS SQS for asynchronous communication handling 50,000+ messages/hour",
      ],
      skills: ["Node.js", "PHP", "RabbitMQ", "AWS SQS", "SNS", "EC2"],
    },
    {
      company: "Coopertech",
      role: "Frontend Developer",
      period: "Jul 2019 - Aug 2020",
      color: "#ec4899",
      bullets: [
        "Developed responsive web interfaces using React and JavaScript with focus on performance optimization",
        "Applied functional programming principles to create maintainable and testable frontend components",
      ],
      skills: ["React", "JavaScript", "CSS", "Functional Programming"],
    },
  ],
  projects: [
    {
      name: "Widt",
      description: "AI-Powered Productivity SaaS",
      link: "widt.dagc-development.org",
      bullets: [
        "Built automatic activity tracking platform generating structured work reports for managers without interrupting employee workflow",
        "Implemented local data processing for privacy with automated delivery via email and Slack using Claude API",
      ],
      skills: ["Electron", "React", "Node.js", "Claude API"],
    },
  ],
};

function SkillTag({ label }) {
  return <span className="cv-skill-tag">{label}</span>;
}

function TimelineItem({ job, isLast }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="timeline-item">
      <div className="timeline-item__line">
        <div className="timeline-item__dot" style={{ background: job.color }} />
        {!isLast && <div className="timeline-item__connector" />}
      </div>
      <div
        className={`timeline-item__card ${expanded ? "timeline-item__card--open" : ""}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="timeline-item__header">
          <div>
            <div className="timeline-item__company" style={{ color: job.color }}>
              {job.company}
            </div>
            <div className="timeline-item__role">{job.role}</div>
          </div>
          <div className="timeline-item__period">{job.period}</div>
        </div>
        {expanded && (
          <div className="timeline-item__details">
            <ul className="timeline-item__bullets">
              {job.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <div className="timeline-item__skills">
              {job.skills.map((s) => (
                <SkillTag key={s} label={s} />
              ))}
            </div>
          </div>
        )}
        <span className={`timeline-item__toggle ${expanded ? "timeline-item__toggle--up" : ""}`}>
          ↓
        </span>
      </div>
    </div>
  );
}

export default function CVPage({ onBack }) {
  const [activeSection, setActiveSection] = useState("overview");
  const { t } = useI18n();

  const sections = [
    { id: "overview", label: t("cv.overview") },
    { id: "experience", label: t("cv.experience") },
    { id: "skills", label: t("cv.skills") },
    { id: "projects", label: t("cv.projects") },
  ];

  return (
    <div className="cv-page">
      <button className="question-list__back" onClick={onBack}>
        {t("questionList.back")}
      </button>

      {/* hero */}
      <div className="cv-hero">
        <div className="cv-hero__initials">DGC</div>
        <div>
          <h1 className="cv-hero__name">{CAREER.name}</h1>
          <p className="cv-hero__title">{CAREER.title}</p>
          <div className="cv-hero__links">
            <a className="cv-hero__link" href={`mailto:${CAREER.contact.email}`}>
              {CAREER.contact.email}
            </a>
            <span className="cv-hero__sep">|</span>
            <a className="cv-hero__link" href={`https://${CAREER.contact.linkedin}`} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <span className="cv-hero__sep">|</span>
            <a className="cv-hero__link" href={`https://${CAREER.contact.github}`} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* highlights */}
      <div className="cv-highlights">
        {CAREER.highlights.map((h) => (
          <div key={h.label} className="cv-highlight">
            <div className="cv-highlight__value" style={{ color: h.color }}>
              {h.value}
            </div>
            <div className="cv-highlight__label">{h.label}</div>
          </div>
        ))}
      </div>

      {/* summary */}
      <div className="cv-summary">
        <p>{CAREER.summary}</p>
      </div>

      {/* section tabs */}
      <div className="cv-tabs">
        {sections.map((s) => (
          <button
            key={s.id}
            className={`cv-tab ${activeSection === s.id ? "cv-tab--active" : ""}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* overview */}
      {activeSection === "overview" && (
        <div className="cv-section">
          <h2 className="cv-section__title">{t("cv.careerTimeline")}</h2>
          <div className="timeline">
            {CAREER.experience.map((job, i) => (
              <TimelineItem
                key={job.company}
                job={job}
                isLast={i === CAREER.experience.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* experience */}
      {activeSection === "experience" && (
        <div className="cv-section">
          <h2 className="cv-section__title">{t("cv.professionalExperience")}</h2>
          {CAREER.experience.map((job) => (
            <div key={job.company} className="cv-exp-card">
              <div className="cv-exp-card__header">
                <div>
                  <div className="cv-exp-card__company" style={{ color: job.color }}>
                    {job.company}
                  </div>
                  <div className="cv-exp-card__role">{job.role}</div>
                </div>
                <div className="cv-exp-card__period">{job.period}</div>
              </div>
              <ul className="cv-exp-card__bullets">
                {job.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="cv-exp-card__skills">
                {job.skills.map((s) => (
                  <SkillTag key={s} label={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* skills */}
      {activeSection === "skills" && (
        <div className="cv-section">
          <h2 className="cv-section__title">{t("cv.technicalSkills")}</h2>
          <div className="cv-skills-grid">
            {Object.entries(CAREER.skills).map(([category, items]) => (
              <div key={category} className="cv-skill-group">
                <div className="cv-skill-group__title">{category}</div>
                <div className="cv-skill-group__items">
                  {items.map((s) => (
                    <SkillTag key={s} label={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* projects */}
      {activeSection === "projects" && (
        <div className="cv-section">
          <h2 className="cv-section__title">{t("cv.projects")}</h2>
          {CAREER.projects.map((p) => (
            <div key={p.name} className="cv-exp-card">
              <div className="cv-exp-card__header">
                <div>
                  <div className="cv-exp-card__company" style={{ color: "#E8A838" }}>
                    {p.name}
                  </div>
                  <div className="cv-exp-card__role">{p.description}</div>
                </div>
                {p.link && (
                  <a
                    className="cv-project-link"
                    href={`https://${p.link}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.link}
                  </a>
                )}
              </div>
              <ul className="cv-exp-card__bullets">
                {p.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="cv-exp-card__skills">
                {p.skills.map((s) => (
                  <SkillTag key={s} label={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
