import { ParsedResume, InterviewQuestion, FeedbackReport, BulletRewrite, TemplateOption } from "../types";

// A truly blank profile — the real starting point before the AI runs.
export const emptyResume: ParsedResume = {
  name: "",
  title: "",
  contact: { email: "", phone: "", location: "", linkedin: "", github: "" },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  suggestedTags: [],
  suggestedSkills: [],
};

export const defaultResume: ParsedResume = {
  name: "Aditi Sharma",
  title: "Senior Frontend Engineer",
  contact: {
    email: "aditi.sharma@example.com",
    phone: "+1 (415) 890-2341",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/aditi-sharma-dev",
    github: "github.com/aditi-sharma",
  },
  summary:
    "Product-minded Senior Frontend Engineer with 5+ years of experience architecting resilient, accessible web platforms. Specialized in React, TypeScript, Next.js, and client-side performance engineering for distributed cloud applications.",
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "GraphQL",
    "Micro-Frontends",
    "System Design",
    "Tailwind CSS",
    "Web Performance (CWV)",
    "State Management (Zustand)",
    "CI/CD & Testing",
    "Accessibility (a11y)",
  ],
  experience: [
    {
      id: "exp-1",
      role: "Senior Frontend Engineer",
      company: "Veloce Cloud Platforms",
      dates: "2022 — Present",
      location: "San Francisco, CA",
      bullets: [
        "Led cross-functional migration of core legacy monolith to module-federated micro-frontends, reducing application bundle size by 32% and team deployment lead times from 4 days to 45 minutes.",
        "Engineered real-time collaborative workspace with WebSockets and optimistic UI caching, supporting 25,000+ daily concurrent sessions with 99.98% uptime.",
        "Introduced automated Core Web Vitals telemetry in CI/CD pipeline, improving Largest Contentful Paint (LCP) from 3.8s to 1.1s across global regions.",
      ],
    },
    {
      id: "exp-2",
      role: "Frontend Software Engineer",
      company: "Aura Fintech Systems",
      dates: "2020 — 2022",
      location: "New York, NY",
      bullets: [
        "Built responsive payment reconciliation dashboards processing $18M+ in monthly transaction flow using React, TypeScript, and TanStack Query.",
        "Architected reusable design system component library adopted by 8 product squads, achieving 100% WCAG 2.1 AA compliance.",
        "Reduced client-side hydration errors by 70% by transitioning data fetching to server-side static regeneration pipelines.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science & Engineering",
      institution: "University of California, Berkeley",
      dates: "2016 — 2020",
      gpa: "3.84 / 4.0",
    },
  ],
};

export const defaultTargetRole = "Senior Frontend Engineer @ Stripe";
export const defaultTargetJD =
  "Seeking an experienced Senior Frontend Engineer to build robust, high-availability developer tools and dashboard interfaces. Must demonstrate deep expertise in TypeScript, modern React architectures, micro-frontends, resilience under latency, and web performance optimization.";

export const defaultQuestions: InterviewQuestion[] = [
  {
    id: "q-1",
    order: 1,
    type: "resume-specific",
    text: "In your resume, you noted that you migrated a monolithic app to micro-frontends at Veloce. What specific criteria did you use to split domain boundaries, and how did you isolate shared state between micro-apps?",
    expectedKeywords: ["domain boundaries", "module federation", "shared state", "event bus", "decoupling"],
  },
  {
    id: "q-2",
    order: 2,
    type: "role-specific",
    text: "For a high-throughput financial interface like Stripe's payment console, how do you architect optimistic UI updates while ensuring idempotency and graceful error rollback when network dropouts occur?",
    expectedKeywords: ["optimistic updates", "idempotency key", "rollback", "reconciliation", "offline queue"],
  },
  {
    id: "q-3",
    order: 3,
    type: "resume-specific",
    text: "You mentioned dropping Largest Contentful Paint (LCP) from 3.8s down to 1.1s. What concrete profiling tools and browser metrics revealed the bottlenecks, and what code changes had the greatest impact?",
    expectedKeywords: ["LCP", "DevTools", "critical CSS", "image priority", "code splitting", "profiling"],
  },
  {
    id: "q-4",
    order: 4,
    type: "behavioral",
    text: "Describe a high-stakes technical disagreement you had with an architect or product lead regarding architectural trade-offs. How did you structure your argument and arrive at a consensus?",
    expectedKeywords: ["disagreement", "data-driven", "consensus", "trade-offs", "stakeholders"],
  },
  {
    id: "q-5",
    order: 5,
    type: "behavioral",
    text: "Tell me about a critical regression or production outage that slipped through your staging and automated testing suites. What was the post-mortem process, and what prevention guardrails did you institute?",
    expectedKeywords: ["outage", "post-mortem", "blameless", "guardrails", "monitoring", "telemetry"],
  },
];

export const defaultAnswers: Record<string, string> = {
  "q-1":
    "We decoupled domains based on business ownership and deployment autonomy rather than technical layers. For shared state, we strictly avoided global cross-app stores. Instead, we established lightweight custom event buses with strictly typed JSON payloads for cross-boundary messaging, and shared common dependencies like React via Webpack 5 Module Federation shared singletons.",
  "q-2":
    "We assign deterministic client-generated idempotency keys to every mutation. When the user initiates a payment action, we update the local cache optimistically and render an in-flight status with undo capability. If the backend fails or times out, we replay or rollback using snapshot state with clear, contextual user notifications.",
  "q-3":
    "Using Chrome DevTools Performance panel and WebPageTest, we discovered our hero elements were blocked by uncompressed web fonts and heavy polyfills in the main bundle. We implemented fetchpriority='high', font preloading with zero layout shifts, and route-based dynamic code-splitting, slashing first-chunk payload by 400KB.",
  "q-4":
    "Our product lead wanted to adopt a proprietary UI library to move fast, but it had severe accessibility gaps and zero keyboard navigation. I created a benchmark matrix comparing speed of implementation against long-term compliance debt, and demonstrated that building accessible compound primitives with Tailwind and Radix was only 3 days longer but zero-debt.",
  "q-5":
    "A subtle race condition in our WebSocket reconnection logic caused sporadic duplicate transaction notices during network reconnection storms. I led a blameless post-mortem, identified our lack of automated jitter and backoff stress testing, and authored integration tests replicating packet loss while adding server-side deduplication keys.",
};

export const defaultFeedback: FeedbackReport = {
  overallScore: 89,
  percentile: 94,
  summary:
    "Aditi demonstrated exceptional technical rigor, clear articulation, and deep structural awareness of modern frontend scalability. Answers were strongly grounded in concrete metrics, architectural trade-offs, and production engineering practices matching Stripe's engineering rubric.",
  strengths: [
    "Precise explanation of domain boundaries and module federation without relying on fragile global stores.",
    "Strong command of browser performance primitives (fetchpriority, font preloading, critical rendering path).",
    "Data-backed communication style when negotiating technical trade-offs with cross-functional partners.",
  ],
  growthAreas: [
    "Could elaborate further on server-driven UI fallbacks during edge network partitions.",
    "Incorporate automated accessibility regression tests (axe-core) directly into the CI guardrail discussion.",
  ],
  verifiedHash: "sha256-8f3a9e224bc1076f8a9e0134bc98f",
  categories: [
    {
      name: "communication",
      label: "Communication & Articulation",
      score: 91,
      evidence:
        "Structured answers using the STAR format with concise, authoritative technical vocabulary throughout questions 1 and 4.",
      suggestion:
        "Keep responses equally succinct when describing multi-tier architectural diagrams to preserve interviewer pacing.",
    },
    {
      name: "technical_relevance",
      label: "Technical Depth & Systems",
      score: 93,
      evidence:
        "Directly addressed idempotency keys, Webpack 5 module federation singletons, and Chrome DevTools CPU throttling in question 3.",
      suggestion:
        "Highlight your experience with distributed tracing (e.g., OpenTelemetry) to show end-to-end full-stack observability.",
    },
    {
      name: "clarity_confidence",
      label: "Clarity & Decisiveness",
      score: 86,
      evidence:
        "Answered confidently regarding post-mortem philosophy and demonstrated honest accountability during the outage walkthrough in question 5.",
      suggestion:
        "Preemptively offer to dive deeper into edge cases before concluding your answers.",
    },
    {
      name: "resume_role_fit",
      label: "Resume & Role Alignment",
      score: 87,
      evidence:
        "Every response corroborated bullet points on Veloce and Aura systems, directly proving the 32% bundle cut and 99.98% uptime claims.",
      suggestion:
        "Explicitly connect your experience building payment reconciliation UI with Stripe's merchant developer tooling standards.",
    },
  ],
};

export const defaultRewrites: BulletRewrite[] = [
  {
    id: "rw-1",
    experienceId: "exp-1",
    company: "Veloce Cloud Platforms",
    role: "Senior Frontend Engineer",
    original:
      "Led cross-functional migration of core legacy monolith to module-federated micro-frontends, reducing application bundle size by 32% and team deployment lead times from 4 days to 45 minutes.",
    suggested:
      "Spearheaded micro-frontend migration via Webpack 5 Module Federation across 4 squads, cutting client bundle size by 32% (400KB) and shrinking deployment turnaround from 4 days to 45 minutes with zero downtime.",
    rationale:
      "Quantifies the exact byte payload reduction discussed in Question 3 and emphasizes squad leadership.",
    status: "accepted",
  },
  {
    id: "rw-2",
    experienceId: "exp-1",
    company: "Veloce Cloud Platforms",
    role: "Senior Frontend Engineer",
    original:
      "Engineered real-time collaborative workspace with WebSockets and optimistic UI caching, supporting 25,000+ daily concurrent sessions with 99.98% uptime.",
    suggested:
      "Architected WebSocket-driven real-time canvas with deterministic client-side idempotency and CRDT conflict resolution, sustaining 25,000+ peak concurrent users at 99.98% availability.",
    rationale:
      "Directly mirrors your excellent explanation of idempotency and rollback state during Question 2.",
    status: "accepted",
  },
  {
    id: "rw-3",
    experienceId: "exp-2",
    company: "Aura Fintech Systems",
    role: "Frontend Software Engineer",
    original:
      "Architected reusable design system component library adopted by 8 product squads, achieving 100% WCAG 2.1 AA compliance.",
    suggested:
      "Authored accessible design system component library (TypeScript, Tailwind) adopted by 8 engineering teams, enforcing automated axe-core CI gating and reaching 100% WCAG 2.1 AA compliance.",
    rationale:
      "Infuses the accessibility CI guardrails surfaced as an improvement recommendation in your feedback report.",
    status: "pending",
  },
  {
    id: "rw-4",
    experienceId: "exp-2",
    company: "Aura Fintech Systems",
    role: "Frontend Software Engineer",
    original:
      "Built responsive payment reconciliation dashboards processing $18M+ in monthly transaction flow using React, TypeScript, and TanStack Query.",
    suggested:
      "Delivered high-throughput payment reconciliation dashboard managing $18M+ monthly volume, integrating optimistic mutation rollbacks and sub-200ms transaction filtering.",
    rationale:
      "Highlights high-throughput financial interface mastery tailored directly for Stripe's core mission.",
    status: "pending",
  },
];

export const templateOptions: TemplateOption[] = [
  {
    id: "modern-atelier",
    name: "Atelier Minimal",
    description: "Crisp black borders, elegant Caslon serif headers, and high-contrast editorial hierarchy.",
    styleTag: "Recommended for Tech & Design",
  },
  {
    id: "classic-executive",
    name: "Executive Clean",
    description: "Single-column corporate format with clean divider rules and ATS-optimized typographic flow.",
    styleTag: "ATS Optimized & Formal",
  },
];
