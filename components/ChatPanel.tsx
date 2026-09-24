"use client";

import React, { useEffect, useRef, useState } from "react";
import RisingSunMark from "@/components/brand/RisingSunMark";
import { Message, StatusStep } from "@/types/workspace";
import {
  accentPillClass,
  focusRingClass,
  focusRingWithinClass,
  secondaryPillClass,
} from "./reusable";
import PricingModal from "./PricingModal";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

import {
  ArrowUp,
  Check,
  Loader2,
  Paperclip,
  Sparkles,
  Square,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface ChatPanelProps {
  messages: Message[];
  isGenerating: boolean;
  isImproving: boolean;
  statusLog: StatusStep[];
  credits: number;
  initialPrompt: string | null;
  onGenerate: (prompt: string, imageUrl?: string) => Promise<void>;
  userId: string;
  workspaceId: string | null;
  appTitle: string | null;
  onStop: () => void;
}

// The assistant's avatar: the Daybreak mark on a raised tile.
const AssistantAvatar = () => (
  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-db-surface-raised">
    <RisingSunMark className="size-4" />
  </div>
);

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

const ChatPanel = ({
  messages,
  isGenerating,
  isImproving,
  statusLog,
  credits,
  initialPrompt,
  onGenerate,
  userId,
  workspaceId,
  onStop,
  appTitle,
}: ChatPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useUser();

  const [input, setInput] = useState("");
  const [peindingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasAutoSubmittedRef = useRef(false);
  const noCredits = credits <= 0;
  const canSubmit =
    input.trim().length > 0 && !isGenerating && !isImproving && !noCredits;

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating || isImproving || noCredits) return;
    setInput("");
    setPendingImageUrl(null);

    await onGenerate(trimmed, peindingImageUrl ?? undefined);
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isGenerating, isImproving]);

  useEffect(() => {
    if (!initialPrompt || hasAutoSubmittedRef.current || messages.length > 0)
      return;
    hasAutoSubmittedRef.current = true;
    onGenerate(initialPrompt);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setIsUploading(true);

    try {
      const ext = file.name.split(".").pop();

      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file and restart the dev server.",
        );
      }

      const path = `${userId}/${workspaceId ?? "new"}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("workspace-images")
        .upload(path, file, { upsert: true });

      if (error) throw error;
      const { data } = supabase.storage
        .from("workspace-images")
        .getPublicUrl(path);
      setPendingImageUrl(data.publicUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const lastMsg = messages[messages.length - 1];
  const isStreamingAssistant = isImproving && lastMsg?.role === "assistant";

  return (
    <div className="flex w-[320px] shrink-0 flex-col border-r border-db-border bg-db-surface/40">
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-db-border px-4 py-3",
          focusRingWithinClass,
        )}
      >
        <span className="min-w-0 truncate font-display text-[15px] font-medium tracking-[-0.01em] text-db-text">
          {appTitle}
        </span>
        <PricingModal reason={noCredits ? "credits" : "upgrade"}>
          <span
            className={cn(
              secondaryPillClass,
              "inline-flex h-8 items-center gap-1.5 px-3 text-[13px] font-medium whitespace-nowrap",
              noCredits &&
                "border-db-danger/40 text-db-danger hover:border-db-danger/70",
            )}
          >
            <Zap
              className={cn(
                "size-3",
                noCredits ? "text-db-danger" : "fill-db-accent text-db-accent",
              )}
            />
            {noCredits
              ? "No credits. Upgrade"
              : `${credits} credit${credits !== 1 ? "s" : ""}`}
          </span>
        </PricingModal>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden"
      >
        {messages.length === 0 && !isGenerating && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-xs text-db-text-dim">
              Describe what you want to build
            </p>
          </div>
        )}
        <div className="space-y-4">
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const isLiveStream = isLast && isStreamingAssistant;

            return (
              <div key={i}>
                {msg.role === "user" ? (
                  <div className="flex items-start justify-end gap-2">
                    <div className="max-w-[85%] space-y-1.5">
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="uploaded"
                          className="max-h-40 w-full rounded-lg object-cover"
                        />
                      )}

                      <div className="rounded-2xl rounded-br-sm bg-db-surface-raised px-3.5 py-2.5">
                        <p className="text-[13px] leading-relaxed text-db-text wrap-break-word">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName ?? "You"}
                        className="mt-0.5 h-6 w-6 shrink-0 rounded-full"
                      />
                    ) : (
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-db-surface-raised text-[10px] font-semibold text-db-text">
                        {user?.firstName?.[0] ?? "U"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AssistantAvatar />
                    <div className="min-w-0 rounded-2xl rounded-tl-sm border border-db-border bg-db-surface px-3.5 py-2.5">
                      {isLiveStream && !msg.content ? (
                        // Empty placeholder — show Cline thinking indicator
                        <div className="flex items-center gap-2">
                          <Wand2 className="h-3 w-3 shrink-0 text-db-lavender motion-safe:animate-pulse" />
                          <span className="text-[12px] text-db-lavender motion-safe:animate-pulse">
                            Cline is thinking…
                          </span>
                        </div>
                      ) : isLiveStream && msg.content ? (
                        // Streaming thinking text — show raw (not markdown)
                        // with a blinking cursor at the end
                        <div>
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Wand2 className="h-3 w-3 shrink-0 text-db-lavender" />
                            <span className="text-[10px] font-medium uppercase tracking-wider text-db-lavender">
                              Agent reasoning
                            </span>
                          </div>
                          <p className="text-[12px] leading-relaxed text-db-text-dim wrap-break-word">
                            {msg.content}
                            <span className="ml-0.5 inline-block h-3 w-0.5 motion-safe:animate-[blink_1s_ease-in-out_infinite] bg-db-accent align-middle" />
                          </p>
                        </div>
                      ) : (
                        // Normal completed assistant message
                        <div className="prose prose-sm prose-invert max-w-none wrap-break-word text-[13px] leading-relaxed text-db-text [&_code]:rounded [&_code]:bg-db-surface-raised [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-db-accent [&_code]:text-xs [&_code]:break-all [&_li]:my-0.5 [&_p]:my-1 [&_pre]:overflow-x-auto! [&_pre]:whitespace-pre-wrap! [&_ul]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Status steps - shown while generating */}
          {isGenerating && (
            <div className="flex items-start gap-2">
              <AssistantAvatar />
              <div className="rounded-2xl rounded-tl-sm border border-db-border bg-db-surface px-3.5 py-3">
                <div className="space-y-2">
                  {statusLog.map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {step.status === "running" ? (
                          <Loader2 className="h-3 w-3 animate-spin text-db-accent" />
                        ) : (
                          <Check className="h-3 w-3 text-db-muted" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[12px] transition-colors duration-300",
                          step.status === "running"
                            ? "text-db-text"
                            : "text-db-text-dim",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {noCredits && (
        <div
          className={cn(
            "mx-3 mb-2 rounded-xl border border-db-danger/30 bg-db-surface px-4 py-3",
            focusRingWithinClass,
          )}
        >
          <p className="mb-2 text-[12px] font-medium text-db-danger">
            You&apos;ve used all your credits
          </p>
          <PricingModal reason="credits">
            <span
              className={cn(
                accentPillClass,
                "inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold",
              )}
            >
              <Sparkles className="h-3 w-3" />
              Upgrade Plan
            </span>
          </PricingModal>
        </div>
      )}

      <div className="border-t border-db-border px-3 pt-3 pb-2">
        {peindingImageUrl && (
          <div className="relative mb-2 w-fit">
            <img
              src={peindingImageUrl}
              alt="pending"
              className="h-16 w-16 rounded-lg object-cover"
            />
            <button
              onClick={() => setPendingImageUrl(null)}
              aria-label="Remove image"
              className={cn(
                "absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-db-base text-db-muted hover:text-db-text",
                focusRingClass,
              )}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        )}

        {/* The landing composer's glass: surface fill, inset border, the
            Daybreak radius, and the peach ring while the textarea has focus. */}
        <div
          className={cn(
            "rounded-db bg-db-surface inset-ring inset-ring-db-border transition-[opacity,box-shadow]",
            "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-3 has-[textarea:focus-visible]:outline-db-ring",
            isGenerating || isImproving || noCredits
              ? "opacity-60"
              : "hover:inset-ring-db-accent/40",
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating || isImproving || noCredits}
            aria-label="Ask AI to modify your app"
            placeholder={
              noCredits
                ? "Upgrade to keep building"
                : isImproving
                  ? "Cline is improving your app"
                  : isGenerating
                    ? "Generating"
                    : "Ask AI to modify"
            }
            rows={1}
            className="w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-[13px] text-db-text placeholder:text-db-muted focus:outline-none"
            style={{ maxHeight: 160 }}
          />

          <div className="flex items-center justify-between px-2.5 pb-2.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => fileRef.current?.click()}
              disabled={isGenerating || isImproving || isUploading || noCredits}
              aria-label="Attach image"
              className="rounded-full text-db-muted hover:bg-db-surface-raised hover:text-db-text disabled:opacity-40"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Paperclip className="h-3.5 w-3.5" />
              )}
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {isGenerating || isImproving ? (
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={onStop}
                aria-label="Stop generating"
                className="rounded-full active:scale-95"
              >
                <Square className="h-3 w-3 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="icon-sm"
                aria-label="Send"
                className={accentPillClass}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-db-text-dim">
          {isGenerating || isImproving
            ? "click ⬜ to stop generation"
            : "⏎ to send. shift + ⏎ for new line"}
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
