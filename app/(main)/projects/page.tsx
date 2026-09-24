import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import Link from "next/link";
import { getUserProjects } from "@/actions/projects";
import {
  accentPillClass,
  displayHeadingClass,
  Glow,
  SectionLabel,
} from "@/components/reusable";
import { cn } from "@/lib/utils";

const pillClass = cn(
  accentPillClass,
  "inline-flex h-10 items-center gap-1.5 px-5 text-sm font-semibold",
);

// Sits under the page's lavender glow (the landing CTA's), with the accent
// pill. A glow of its own would leave a seam where it meets the page glow.
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-db-border bg-db-surface">
        <Zap className="size-5 text-db-muted" />
      </div>
      <p className="mb-1 text-base font-medium text-db-text">No projects yet</p>
      <p className="mb-8 max-w-sm text-balance text-sm leading-relaxed text-db-muted">
        Head to the homepage and describe what you want to build.
      </p>
      <Link href="/" className={pillClass}>
        Start building
      </Link>
    </div>
  );
}

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const projects = await getUserProjects();

  return (
    <div className="relative isolate min-h-[calc(100dvh-4rem)] px-4 py-10">
      <Glow tone="lavender" className="h-[60vh]" />
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Your apps</SectionLabel>
            <h1 className={displayHeadingClass}>Projects</h1>
            <p className="mt-3 text-sm text-db-muted">
              All your AI-generated apps in one place.
            </p>
          </div>
          <Link href="/" className={cn(pillClass, "shrink-0")}>
            <Zap className="size-3.5 fill-current" />
            New project
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectCard projects={projects} />
        )}
      </div>
    </div>
  );
}
