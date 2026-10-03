import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getAllProjectSlugs } from "@/data";

interface ProjectPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { caseStudy } = project;

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-[#EDEDED] antialiased">
      <div className="mx-auto max-w-5xl px-6 pt-24 pb-24 sm:px-10 sm:pt-32 sm:pb-32">
        {/* Navigation Breadcrumb */}
        <div className="mb-10 flex items-center gap-4 text-xs font-mono text-[#8B8B8F]">
          <Link href="/" className="hover:text-[#D9A441] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/works" className="hover:text-[#D9A441] transition-colors">
            Works
          </Link>
          <span>/</span>
          <span className="text-[#EDEDED]">{project.name}</span>
        </div>

        {/* Project Header */}
        <header className="border-b border-[#1F1F21] pb-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-[#8B8B8F]">{project.year}</span>
            <span className="rounded-full bg-[#18181B] px-3 py-1 text-xs font-mono text-[#D9A441]">
              {project.category}
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">
            {project.name}
          </h1>

          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-[#8B8B8F]">
            {project.tagline}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#1F1F21] pt-8 sm:grid-cols-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#8B8B8F]">Role</p>
              <p className="mt-1 text-sm font-medium">{project.role}</p>
            </div>
            {project.client && (
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[#8B8B8F]">Client</p>
                <p className="mt-1 text-sm font-medium">{project.client}</p>
              </div>
            )}
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#8B8B8F]">Timeline</p>
              <p className="mt-1 text-sm font-medium">{project.year}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#8B8B8F]">Primary Stack</p>
              <p className="mt-1 text-sm font-medium">{project.stack.slice(0, 2).join(", ")}</p>
            </div>
          </div>
        </header>

        {/* Metrics / Stats */}
        {project.stats && project.stats.length > 0 && (
          <section className="py-14 border-b border-[#1F1F21]">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {project.stats.map((stat) => (
                <div key={stat.label} className="border-l-2 border-[#D9A441] pl-5">
                  <p className="font-mono text-3xl font-medium text-[#EDEDED]">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-[#8B8B8F] font-mono">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Overview */}
        <section className="py-14 border-b border-[#1F1F21]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D9A441]">
            01. Overview
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[#8B8B8F] sm:text-lg">
            {caseStudy.overview}
          </p>
        </section>

        {/* Before vs After */}
        <section className="py-14 border-b border-[#1F1F21]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D9A441]">
            02. Context & Transformation
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div className="rounded-xl border border-[#27272A] bg-[#121214] p-6">
              <h3 className="font-mono text-sm text-[#EF4444] uppercase tracking-wider">
                Before / Legacy State
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {caseStudy.beforeAfter.before.map((item, idx) => (
                  <li key={idx} className="text-sm leading-relaxed text-[#8B8B8F] flex gap-2">
                    <span className="text-[#EF4444] select-none">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#27272A] bg-[#121214] p-6">
              <h3 className="font-mono text-sm text-[#10B981] uppercase tracking-wider">
                After / Delivered Impact
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {caseStudy.beforeAfter.after.map((item, idx) => (
                  <li key={idx} className="text-sm leading-relaxed text-[#8B8B8F] flex gap-2">
                    <span className="text-[#10B981] select-none">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Core Problems & Challenges */}
        <section className="py-14 border-b border-[#1F1F21]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D9A441]">
            03. The Challenges
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {caseStudy.problem.map((prob, idx) => (
              <div key={idx} className="flex gap-4 items-baseline">
                <span className="font-mono text-xs text-[#8B8B8F]">0{idx + 1}.</span>
                <p className="text-sm leading-relaxed text-[#8B8B8F]">{prob}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How I Faced Them */}
        <section className="py-14 border-b border-[#1F1F21]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D9A441]">
            04. How I Approached & Faced The Bottlenecks
          </h2>
          <div className="mt-6 flex flex-col gap-5">
            {caseStudy.howIFacedThem.map((approach, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#1F1F21] bg-[#101012] p-5 text-sm leading-relaxed text-[#8B8B8F]"
              >
                {approach}
              </div>
            ))}
          </div>
        </section>

        {/* Architectural Solutions */}
        <section className="py-14 border-b border-[#1F1F21]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D9A441]">
            05. Engineering Solutions
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {caseStudy.solutions.map((sol, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#1F1F21] p-5 text-sm text-[#8B8B8F] leading-relaxed"
              >
                <span className="font-mono text-xs text-[#D9A441] block mb-2">Solution 0{idx + 1}</span>
                {sol}
              </div>
            ))}
          </div>
        </section>

        {/* Why I Chose This Tech Stack */}
        <section className="py-14 border-b border-[#1F1F21]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D9A441]">
            06. Why I Chose The Tech Stack
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {caseStudy.whyIChoseTech.map((item) => (
              <div
                key={item.tech}
                className="grid gap-2 sm:grid-cols-[1fr_2.5fr] border-t border-[#1F1F21] pt-4"
              >
                <h3 className="text-sm font-medium text-[#EDEDED]">{item.tech}</h3>
                <p className="text-sm leading-relaxed text-[#8B8B8F]">{item.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Results & Key Learnings */}
        <section className="py-14">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#D9A441]">
            07. Results & Key Learnings
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {caseStudy.results.map((res, idx) => (
              <div key={idx} className="flex items-baseline gap-3 text-sm text-[#8B8B8F]">
                <span className="text-[#D9A441] font-mono text-xs">→</span>
                <span>{res}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-16 flex items-center justify-between border-t border-[#1F1F21] pt-8">
          <Link
            href="/works"
            className="text-xs font-mono text-[#8B8B8F] hover:text-[#D9A441] transition-colors"
          >
            ← Back to all works
          </Link>
          <Link
            href="/"
            className="text-xs font-mono text-[#8B8B8F] hover:text-[#D9A441] transition-colors"
          >
            Back to home ↑
          </Link>
        </div>
      </div>
    </main>
  );
}
