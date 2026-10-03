export interface ProjectTechReason {
  tech: string;
  reason: string;
}

export interface ProjectStat {
  label: string;
  value: string;
}

export interface ProjectCaseStudy {
  overview: string;
  beforeAfter: {
    before: string[];
    after: string[];
  };
  problem: string[];
  howIFacedThem: string[];
  solutions: string[];
  whyIChoseTech: ProjectTechReason[];
  techUsed: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    servicesOrTools?: string[];
  };
  results: string[];
  keyLearnings?: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  year: string;
  role: string;
  client?: string;
  category: string;
  description: string;
  stack: string[];
  href?: string;
  githubUrl?: string;
  featured?: boolean;
  order: number;
  stats?: ProjectStat[];
  caseStudy: ProjectCaseStudy;
}

export const PROJECTS: Project[] = [
  {
    id: "medflow",
    slug: "medflow",
    name: "MedFlow",
    tagline: "Multi-tenant healthcare SaaS with hospital management & audit-ready RBAC",
    year: "2025",
    role: "Full Stack Engineer (Lead)",
    client: "Healthcare SaaS Platform",
    category: "Healthcare SaaS / Enterprise",
    description:
      "Multi-tenant healthcare SaaS — appointments, billing, pharmacy, radiology, subscriptions, and tenant-aware RBAC with full audit logging.",
    stack: ["Next.js", "TypeScript", "MongoDB", "PostgreSQL", "Tailwind CSS", "Prisma"],
    href: undefined,
    githubUrl: undefined,
    featured: true,
    order: 1,
    stats: [
      { label: "Department Modules", value: "6+" },
      { label: "API Response Time", value: "<120ms" },
      { label: "Wait Time Reduction", value: "45%" },
    ],
    caseStudy: {
      overview:
        "MedFlow is an enterprise-grade, multi-tenant healthcare operations platform designed to eliminate silos across hospital departments. It unifies patient appointments, pharmacy inventories, radiology reports, and financial billing into a single compliance-ready interface with strict tenant isolation.",
      beforeAfter: {
        before: [
          "Fragmented legacy software across hospital departments (pharmacy, billing, radiology operated as disconnected silos).",
          "Manual appointment scheduling leading to frequent double-bookings and patient frustration.",
          "Absence of tamper-proof audit trails for compliance with health data governance standards.",
        ],
        after: [
          "Unified multi-tenant dashboard unifying appointments, billing, pharmacy, and diagnostic reports under one portal.",
          "Tenant-isolated databases and granular role-based permissions preventing any cross-tenant data leakage.",
          "Sub-second record search and real-time appointment updates across all clinic locations.",
        ],
      },
      problem: [
        "Complex multi-tenancy requirements where distinct clinics required isolated tenant data, custom branding, and varying subscription tiers.",
        "Role-based access control (Superadmin, Clinic Admin, Doctor, Pharmacist, Radiologist, Receptionist) with strict least-privilege compliance.",
        "High transaction volume for patient queues and pharmacy inventory management requiring zero race conditions.",
      ],
      howIFacedThem: [
        "Architected tenant resolution middleware at the request layer using tenant subdomains and secure session headers.",
        "Implemented a hybrid persistence strategy: PostgreSQL with Prisma for structured relational records (billing, audit logs, appointments) with ACID guarantees, and MongoDB for dynamic medical records & report schemas.",
        "Engineered optimistic locking mechanisms for appointment booking slots and pharmacy medicine inventory to eliminate double-allocation issues.",
      ],
      solutions: [
        "Dynamic multi-tenant middleware resolving tenant context before API route execution.",
        "Fine-grained RBAC permission matrix enforced via custom decorators and database row-level security.",
        "Comprehensive audit logging tracking every read and write operation on patient health information.",
        "Real-time doctor appointment queue with push status notifications.",
      ],
      whyIChoseTech: [
        {
          tech: "Next.js App Router & TypeScript",
          reason:
            "End-to-end type safety from database models to client UI, combined with server components to minimize client-side bundle size for intensive dashboards.",
        },
        {
          tech: "PostgreSQL & Prisma",
          reason:
            "Strict schema constraints, ACID transactions for financial billing, and relational integrity across hospital wards.",
        },
        {
          tech: "MongoDB",
          reason:
            "Dynamic document schemas for varied medical diagnostic report templates and flexible imaging metadata.",
        },
        {
          tech: "Tailwind CSS & Shadcn UI",
          reason:
            "Accessible (WCAG compliant) interface components for medical staff working in high-pressure environments.",
        },
      ],
      techUsed: {
        frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Shadcn UI", "Lucide Icons"],
        backend: ["Next.js Server Actions", "Node.js", "REST APIs", "RBAC Middleware"],
        database: ["PostgreSQL", "Prisma ORM", "MongoDB", "Mongoose"],
        servicesOrTools: ["Docker", "JWT Authentication", "Audit Logger"],
      },
      results: [
        "Handled thousands of concurrent patient records with sub-100ms response times.",
        "Reduced clinic appointment wait times by 45% with digitized queue tracking.",
        "Zero recorded cross-tenant data leaks and passed comprehensive internal security audits.",
      ],
      keyLearnings: [
        "Handling healthcare data requires architecting for auditability and compliance from day one, not as an afterthought.",
        "A hybrid database architecture (Postgres + Mongo) delivers the best balance of transactional safety and document flexibility.",
      ],
    },
  },
  {
    id: "voltmeet",
    slug: "voltmeet",
    name: "VoltMeet",
    tagline: "High-performance real-time video conferencing platform",
    year: "2025",
    role: "Full Stack Engineer",
    client: "Product Prototype",
    category: "WebRTC / Video Conferencing",
    description:
      "Real-time video conferencing platform — scheduling, recordings, participant invitations, device switching, and group calls.",
    stack: ["Next.js", "TypeScript", "Stream.io", "MongoDB", "Tailwind CSS"],
    href: "#",
    githubUrl: undefined,
    featured: true,
    order: 2,
    stats: [
      { label: "Stream Latency", value: "<180ms" },
      { label: "Call Success Rate", value: "99.8%" },
      { label: "Max Grid Participants", value: "50+" },
    ],
    caseStudy: {
      overview:
        "VoltMeet is a low-latency video conferencing application engineered for friction-free remote communication. It supports instant room creation, scheduled video calls, dynamic participant grid layouts, cloud recordings, and on-the-fly audio/video device hot-swapping.",
      beforeAfter: {
        before: [
          "Users relied on cumbersome meeting software requiring heavy desktop installs and prolonged account sign-ups.",
          "Frequent meeting drops when switching between audio inputs/headsets during live calls.",
          "Complicated recording storage workflows without instant playback access.",
        ],
        after: [
          "Instant browser-based video meetings with one-click link sharing and zero download requirement.",
          "Hot-swappable audio/video device switching without stream drops or reconnection lags.",
          "Automated cloud recording storage with immediate post-meeting viewing and transcription.",
        ],
      },
      problem: [
        "Maintaining low-latency media stream synchronization across fluctuating network conditions and mobile connections.",
        "Handling browser device permissions (camera/mic), dynamic participant grid layouts, and active speaker spotlighting.",
        "Enforcing room security with password protection, participant waiting rooms, and moderator controls.",
      ],
      howIFacedThem: [
        "Leveraged Stream Video SDK integrated with custom WebRTC media handling for adaptive bitrate streaming.",
        "Built resilient custom React hooks for detecting media hardware changes (navigator.mediaDevices.ondevicechange) without restarting the peer connection.",
        "Engineered a responsive virtualized video grid calculating optimal tile aspect ratios based on viewport dimensions and participant count.",
      ],
      solutions: [
        "Dynamic speaker spotlight algorithm that detects audio levels in real time to elevate the active speaker.",
        "Host dashboard for muting participants, screen sharing permissions, and admit/reject lobby workflow.",
        "Meeting scheduler with calendar invites and direct deep-link routing.",
      ],
      whyIChoseTech: [
        {
          tech: "Stream.io Video SDK",
          reason:
            "Enterprise-grade global edge network ensuring sub-second WebRTC latency and reliable TURN/STUN infrastructure.",
        },
        {
          tech: "Next.js & TypeScript",
          reason:
            "Fast SSR for room landing pages combined with dynamic client components for media session handling.",
        },
        {
          tech: "MongoDB",
          reason:
            "Fast querying of user profiles, scheduled meetings, room states, and recording metadata.",
        },
        {
          tech: "Tailwind CSS",
          reason:
            "Lightweight utility-first styling for dark-mode conference room UI with minimal style bundle overhead.",
        },
      ],
      techUsed: {
        frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Stream Video React SDK"],
        backend: ["Next.js API Routes", "Stream Video Node SDK", "Node.js"],
        database: ["MongoDB", "Mongoose"],
        servicesOrTools: ["WebRTC", "Stream Edge Network", "Cloudflare"],
      },
      results: [
        "Achieved 99.8% call connection success rate across desktop and mobile browsers.",
        "Average stream latency under 180ms on standard broadband networks.",
        "Seamless device switching without call disruption.",
      ],
      keyLearnings: [
        "Handling edge cases in media hardware (disconnecting Bluetooth headsets during a live stream) requires defensive state handling.",
        "Virtualized video rendering is essential for keeping client CPU/GPU usage low during large calls.",
      ],
    },
  },
  {
    id: "synergy-cancer-platform",
    slug: "synergy-cancer-platform",
    name: "Synergy Cancer Platform",
    tagline: "Accessible healthcare appointment platform with WhatsApp workflows & RTL support",
    year: "2025",
    role: "Frontend & Integration Specialist",
    client: "Specialized Healthcare Provider",
    category: "Healthcare / Telemedicine",
    description:
      "Healthcare appointment platform with localization, admin dashboards, and WhatsApp-based notification workflows.",
    stack: ["Next.js", "MongoDB", "WhatsApp API", "i18n & RTL", "Tailwind CSS"],
    href: "#",
    githubUrl: undefined,
    featured: true,
    order: 3,
    stats: [
      { label: "No-Show Reduction", value: "60%" },
      { label: "Supported Locales", value: "EN + AR (RTL)" },
      { label: "Booking Completion", value: "92%" },
    ],
    caseStudy: {
      overview:
        "Synergy Cancer Platform is an accessible patient consultation and oncology appointment coordination system. Built with empathy for patients undergoing treatment, it features low-cognitive-load appointment flows, automated WhatsApp notifications, and comprehensive English/Arabic RTL localization.",
      beforeAfter: {
        before: [
          "Cancer patients and caregivers struggled with confusing phone booking systems and missing appointment schedules.",
          "High appointment no-show rates due to lack of immediate SMS/messaging reminders.",
          "Inaccessibility for non-English and Arabic-speaking patients who required RTL layouts.",
        ],
        after: [
          "Simple 3-step appointment booking interface tested for accessibility and low cognitive load.",
          "Instant WhatsApp confirmation messages and calendar reminder triggers directly to patient phones.",
          "Full bilingual English and Arabic RTL support with cultural nuances in typography and direction.",
        ],
      },
      problem: [
        "Ensuring accessibility for elderly or distressed patients who find complex digital interfaces overwhelming.",
        "Connecting web appointment bookings with the WhatsApp Business API for instant patient updates.",
        "Architecting bidirectional layout switching (LTR to RTL) without CSS breaking or manual duplicate stylesheets.",
      ],
      howIFacedThem: [
        "Adopted clean, high-contrast typography, generous click targets, and a guided multi-step form with persistent progress indicators.",
        "Created a webhook-driven serverless messaging microservice to dispatch WhatsApp notifications for booking confirmations, rescheduling, and doctor instructions.",
        "Utilized logical CSS properties (ms-, me-, start-, end-) and Next-intl locale routing to seamlessly mirror layouts in Arabic RTL mode.",
      ],
      solutions: [
        "Doctor schedule availability engine preventing booking overlaps.",
        "Admin dashboard for medical coordinators to review patient cases, triage urgency, and update appointment statuses.",
        "Automated WhatsApp communication loop with interactive reply buttons.",
      ],
      whyIChoseTech: [
        {
          tech: "Next.js & Next-intl",
          reason:
            "Native internationalization support with subpath routing and server-side locale detection.",
        },
        {
          tech: "WhatsApp Cloud API",
          reason:
            "Direct accessibility for patients who do not check emails frequently but rely heavily on WhatsApp.",
        },
        {
          tech: "MongoDB",
          reason:
            "Document storage for flexible doctor schedules, consultation notes, and localized content snippets.",
        },
        {
          tech: "Tailwind CSS with RTL",
          reason:
            "CSS logical properties built-in, enabling single codebase maintenance for both LTR and RTL layouts.",
        },
      ],
      techUsed: {
        frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Next-intl (RTL)"],
        backend: ["Next.js API Routes", "WhatsApp Cloud API", "Node.js"],
        database: ["MongoDB", "Mongoose"],
        servicesOrTools: ["Meta Graph API", "Webhooks", "Vercel"],
      },
      results: [
        "Decreased appointment no-show rate by over 60% through WhatsApp automated reminders.",
        "100% WCAG accessibility audit compliance across core booking flows.",
        "Positive patient feedback on ease of use during high-stress medical visits.",
      ],
      keyLearnings: [
        "WhatsApp integration significantly increases engagement and attendance in healthcare compared to standard emails.",
        "RTL design must be treated as a first-class citizen from the foundation, using CSS logical properties.",
      ],
    },
  },
];

// Helper functions for accessing projects data
export function getAllProjects(): Project[] {
  return [...PROJECTS].sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return PROJECTS.map((project) => project.slug);
}
