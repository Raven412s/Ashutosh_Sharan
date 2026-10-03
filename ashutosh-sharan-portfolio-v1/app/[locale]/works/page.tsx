import Link from "next/link";
import { getAllProjects } from "@/data";

export default function WorksPage() {
  const projects = getAllProjects();

  return (
    <main className="min-h-screen antialiased">
      <section className="mx-auto flex max-w-5xl flex-col px-6 pt-28 pb-20 sm:px-10 sm:pt-36">
        <Link
          href="/"
          className="font-mono text-xs text-[#8B8B8F] hover:text-[#D9A441] transition-colors mb-8 inline-block"
        >
          ← Back to home
        </Link>

        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Selected Works & Systems
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[#8B8B8F]">
          A deep dive into production applications, architecture choices, and client platforms.
        </p>

        <div className="mt-16 flex flex-col">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group border-t border-[#1F1F21] py-10 transition-colors hover:bg-[#131315]/50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#8B8B8F]">{project.year}</span>
                    <span className="text-xs font-mono text-[#D9A441] uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-medium">
                    <Link
                      href={`/works/${project.slug}`}
                      className="hover:text-[#D9A441] transition-colors"
                    >
                      {project.name}
                    </Link>
                  </h2>
                </div>

                <Link
                  href={`/works/${project.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#D9A441] hover:underline"
                >
                  View Case Study →
                </Link>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#8B8B8F]">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[#2A2A2D] px-3 py-1 text-xs text-[#8B8B8F]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
