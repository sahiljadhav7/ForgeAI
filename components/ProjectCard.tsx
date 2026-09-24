"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { ProjectSummary } from "@/actions/projects";
import { DeleteProjectModal } from "@/components/DeleteProjectModal";
import { focusRingClass } from "@/components/reusable";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  projects: ProjectSummary[];
}

export function ProjectCard({ projects }: ProjectCardProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const title = project.title ?? "Untitled project";
        const timeAgo = formatDistanceToNow(new Date(project.updatedAt), {
          addSuffix: true,
        });
        const msgCount = Math.floor(project.messageCount / 2);

        return (
          <div
            key={project.id}
            className="group relative flex flex-col rounded-db border border-db-border bg-db-surface p-5 transition-colors hover:border-db-accent/40 hover:bg-db-surface-raised"
          >
            {/* The whole card is the link; the delete button sits above it. */}
            <Link
              href={`/workspace?id=${project.id}`}
              className={cn("absolute inset-0 rounded-db", focusRingClass)}
              aria-label={`Open ${title}`}
            />

            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="line-clamp-1 text-[15px] font-medium leading-snug text-db-text">
                {title}
              </p>
              <DeleteProjectModal project={project} />
            </div>

            {project.firstPrompt && (
              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-db-muted">
                {project.firstPrompt}
              </p>
            )}

            <div className="mt-auto flex items-center gap-3 border-t border-db-border pt-3 text-sm text-db-muted">
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {msgCount} message{msgCount !== 1 ? "s" : ""}
              </span>
              <span>{timeAgo}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
