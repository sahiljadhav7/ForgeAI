"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteProject, ProjectSummary } from "@/actions/projects";
import { focusRingClass } from "@/components/reusable";
import { cn } from "@/lib/utils";

interface DeleteProjectModalProps {
  project: ProjectSummary;
}

// Renders its own trash-icon trigger, so the button always carries the
// "Delete {title}" accessible name. It sits above a card's full-size link.
export function DeleteProjectModal({ project }: DeleteProjectModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const title = project.title ?? "Untitled project";

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project deleted.");
        router.refresh();
      } catch {
        toast.error("Failed to delete project. Please try again.");
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Delete ${title}`}
        className={cn(
          "relative z-10 -m-1.5 shrink-0 cursor-pointer rounded-full p-1.5 text-db-muted transition-colors hover:text-db-danger",
          focusRingClass,
        )}
      >
        <Trash2 className="size-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Delete project?
          </DialogTitle>
          <DialogDescription>
            “{title}” will be permanently deleted. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <DialogClose
            render={
              <Button variant="outline" className="rounded-full px-4" />
            }
          >
            Cancel
          </DialogClose>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full bg-db-danger px-4 font-semibold text-db-base hover:bg-db-danger/90"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
