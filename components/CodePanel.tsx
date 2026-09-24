// CodePanel.tsx
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import {
  Eye,
  Code2,
  Download,
  AlertTriangle,
  Bot,
  Loader2,
  ArrowUp,
} from "lucide-react";
import { RingLoader } from "react-spinners";
import JSZip from "jszip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PricingModal from "@/components/PricingModal";
import {
  accentPillClass,
  focusRingClass,
  focusRingWithinClass,
  secondaryPillClass,
} from "@/components/reusable";
import { cn } from "@/lib/utils";
import { daybreakSandpackTheme } from "@/lib/sandpack-theme";
import { DB_LITERALS } from "@/lib/daybreak-literals";
import type { FileData, StatusStep } from "@/types/workspace";
import {
  EXPORT_README,
  buildExportPackageJson,
  exportZipFileName,
} from "@/lib/exportZip";

// ─── Placeholder ──────────────────────────────────────────────────────────────
// Runs inside the preview iframe, where the .daybreak tokens don't exist, so
// it takes the Sandpack theme's literals.

const PLACEHOLDER_FILES = {
  "/App.js": {
    code: `export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "${DB_LITERALS.base}",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", color: "${DB_LITERALS.muted}" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
        <p style={{ fontSize: 14 }}>Your app will appear here</p>
      </div>
    </div>
  );
}`,
  },
};

// ─── Base dependencies ────────────────────────────────────────────────────────

const BASE_DEPENDENCIES: Record<string, string> = {
  "react-is": "latest",
  "react-router-dom": "latest",
  "lucide-react": "latest",
  recharts: "latest",
  "date-fns": "latest",
  "framer-motion": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  zod: "latest",
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-dropdown-menu": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-tooltip": "latest",
  "@radix-ui/react-accordion": "latest",
  "@radix-ui/react-select": "latest",
  axios: "latest",
  clsx: "latest",
  "class-variance-authority": "latest",
  "tailwind-merge": "latest",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "preview" | "code";

interface CodePanelProps {
  fileData: FileData | null;
  isGenerating: boolean;
  statusLog: StatusStep[];
  onImprove: (userRequest: string) => Promise<void>;
  onFixError: (error: string) => Promise<void>;
  onFilePatch: (patches: FileData) => void;
  appTitle: string | null;
  isImproving: boolean;
  isProUser: boolean;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// Line tabs: muted when inactive, warm white with a peach underline when
// active. The underline sits on the bar's bottom border; it is positioned
// here because shadcn's `group-data-horizontal` variants never match Base
// UI's `data-orientation`. The focus ring (from TabsTrigger) is inset, since
// the tab fills the bar's height and an outset ring would be clipped by the
// global header.
const tabTriggerClass =
  "h-full px-3 text-db-muted hover:text-db-text data-active:text-db-text after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-db-accent focus-visible:-outline-offset-2";

// "Improve with Agent": a lavender→peach wash with a lavender edge.
const improveClass =
  "group relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-full border border-db-lavender/35 bg-linear-to-r from-db-lavender/12 to-db-accent/12 px-3 text-[13px] font-medium text-db-text transition-colors hover:border-db-accent/50 hover:from-db-lavender/20 hover:to-db-accent/20";

// A light band sweeping across the Improve button. It waits off to the left
// (clipped) when the user prefers reduced motion.
const shimmerClass =
  "pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-db-text/10 to-transparent motion-safe:animate-[shimmer_2.5s_infinite]";

const proBadgeClass =
  "rounded-full bg-db-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-db-on-accent";

// ─── SandpackInner ────────────────────────────────────────────────────────────
// Lives inside SandpackProvider so it can call useSandpack().
// Receives fileData as a prop and uses updateFile() to push code changes
// into the live Sandpack instance without remounting the provider.

function SandpackInner({
  isGenerating,
  statusLog,
  activeTab,
  setActiveTab,
  onImprove,
  onFixError,
  fileData,
  appTitle,
  isImproving,
  isProUser,
}: {
  isGenerating: boolean;
  statusLog: StatusStep[];
  activeTab: ActiveTab;
  setActiveTab: (t: ActiveTab) => void;
  onImprove: (userRequest: string) => Promise<void>;
  onFixError: (error: string) => Promise<void>;
  fileData: FileData | null;
  appTitle: string | null;
  isImproving: boolean;
  isProUser: boolean;
}) {
  const { sandpack, listen } = useSandpack();
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [improveInput, setImproveInput] = useState("");
  const [showImproveInput, setShowImproveInput] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Push file content updates into Sandpack without remounting.
  // This runs whenever fileData changes (e.g. after improve completes).
  // SandpackProvider key only changes when the file path set changes,
  // so this is the safe way to update existing file contents.
  const prevFilesRef = useRef<Record<string, { code: string }>>({});
  useEffect(() => {
    if (!fileData?.files) return;
    const prev = prevFilesRef.current;
    for (const [path, { code }] of Object.entries(fileData.files)) {
      if (prev[path]?.code !== code) {
        sandpack.updateFile(path, code);
      }
    }
    prevFilesRef.current = fileData.files;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData?.files]);

  // Listen for Sandpack runtime errors
  useEffect(() => {
    unsubscribeRef.current = listen((msg) => {
      if (
        msg.type === "action" &&
        "action" in msg &&
        msg.action === "show-error"
      ) {
        const errMsg =
          "message" in msg && typeof msg.message === "string"
            ? msg.message
            : "An error occurred in the preview.";
        setPreviewError(errMsg);
        return;
      }
      if (msg.type === "compile") {
        const errMsg =
          "message" in msg && typeof msg.message === "string"
            ? msg.message
            : "Compile error in preview.";
        setPreviewError(errMsg);
        return;
      }
      if (msg.type === "success") {
        setPreviewError(null);
      }
    });
    return () => unsubscribeRef.current?.();
  }, [listen]);

  useEffect(() => {
    if (isGenerating) setPreviewError(null);
  }, [isGenerating]);

  const handleImproveSubmit = async () => {
    const trimmed = improveInput.trim();
    if (!trimmed || isImproving || !onImprove) return;
    setImproveInput("");
    setShowImproveInput(false);
    await onImprove(trimmed);
  };

  // ── Export to ZIP ──────────────────────────────────────────────────────────
  const handleExportZip = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const filesToZip =
        Object.keys(sandpack.files).length > 0
          ? sandpack.files
          : (fileData?.files ?? {});

      const dependencies = {
        ...BASE_DEPENDENCIES,
        ...(fileData?.dependencies ?? {}),
      };

      const zip = new JSZip();

      const packageJson = buildExportPackageJson(dependencies);
      zip.file("package.json", JSON.stringify(packageJson, null, 2));

      zip.file(
        "public/index.html",
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Daybreak App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
            </html>`,
      );

      for (const [filePath, fileObj] of Object.entries(filesToZip)) {
        const code =
          typeof fileObj === "object" && fileObj !== null && "code" in fileObj
            ? (fileObj as { code: string }).code
            : "";
        const zipPath = filePath.startsWith("/")
          ? `src${filePath}`
          : `src/${filePath}`;
        zip.file(zipPath, code);
      }

      zip.file(
        "src/index.js",
        `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);`,
      );

      zip.file("README.md", EXPORT_README);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportZipFileName(appTitle);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const currentStepLabel =
    statusLog[statusLog.length - 1]?.label ?? "Generating…";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as ActiveTab)}
      className="flex h-full flex-col gap-0"
    >
      {/* Tabs + Actions bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-db-border bg-db-surface px-2">
        <TabsList
          variant="line"
          className="h-full gap-0 rounded-none bg-transparent p-0"
        >
          <TabsTrigger className={tabTriggerClass} value="code">
            <Code2 className="h-3.5 w-3.5" />
            Code
          </TabsTrigger>
          <TabsTrigger className={tabTriggerClass} value="preview">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-1.5">
          {/* ── Improve button ── */}
          {isProUser ? (
            showImproveInput ? (
              <div className="flex items-center gap-1.5">
                <div className="relative flex items-center">
                  <Bot className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-db-accent" />
                  <input
                    autoFocus
                    aria-label="What should I improve?"
                    value={improveInput}
                    onChange={(e) => setImproveInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleImproveSubmit().catch(() => {});
                      }
                      if (e.key === "Escape") setShowImproveInput(false);
                    }}
                    placeholder="What should I improve?"
                    className={cn(
                      "h-8 w-56 rounded-full border border-db-lavender/35 bg-linear-to-r from-db-lavender/10 to-db-accent/10 pl-8 pr-3 text-[13px] text-db-text transition-colors placeholder:text-db-muted focus:border-db-accent/60",
                      focusRingClass,
                    )}
                  />
                </div>
                <button
                  onClick={handleImproveSubmit}
                  disabled={!improveInput.trim() || isImproving}
                  aria-label="Send improvement"
                  className={cn(
                    accentPillClass,
                    "flex size-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {isImproving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowImproveInput(true)}
                disabled={isImproving || !fileData}
                className={cn(
                  improveClass,
                  "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  focusRingClass,
                )}
              >
                <span className={shimmerClass} />
                {isImproving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-db-accent" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-db-accent" />
                )}
                {isImproving ? "Improving…" : "Improve with Agent"}
                {!isImproving && <span className={proBadgeClass}>PRO</span>}
              </button>
            )
          ) : (
            // PricingModal renders its own trigger button, so the ring is
            // applied from the wrapper.
            <span className={focusRingWithinClass}>
              <PricingModal reason="upgrade">
                <span className={improveClass}>
                  <span className={shimmerClass} />
                  <Bot className="h-3.5 w-3.5 text-db-accent" />
                  Improve with Agent
                  <span className={proBadgeClass}>PRO</span>
                </span>
              </PricingModal>
            </span>
          )}

          <button
            onClick={handleExportZip}
            disabled={isExporting || !fileData}
            className={cn(
              secondaryPillClass,
              "inline-flex h-8 cursor-pointer items-center gap-1.5 px-3 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden h-full">
        {(isGenerating || isImproving) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-db-base/85 backdrop-blur-sm">
            <RingLoader
              color="var(--db-accent-solid)"
              size={64}
              speedMultiplier={0.8}
            />
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-sm font-medium text-db-text">
                {isImproving ? "Improving with Cline AI…" : currentStepLabel}
              </p>
              {/* --db-muted drops under 4.5:1 where the overlay covers a
                  light preview, so this line is dimmed warm white. */}
              <p className="text-xs text-db-text-dim">
                This usually takes 10–20 seconds
              </p>
            </div>
          </div>
        )}

        <SandpackLayout
          style={{
            height: "100vh",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          <TabsContent
            value="preview"
            keepMounted
            className="mt-0 h-full w-full"
          >
            <SandpackPreview
              style={{ height: "89%" }}
              showOpenInCodeSandbox={false}
            />
          </TabsContent>

          <TabsContent
            value="code"
            keepMounted
            className="mt-0 flex h-full w-full"
          >
            <SandpackFileExplorer
              style={{
                height: "90%",
                width: "180px",
                borderRight: "1px solid var(--db-border)",
              }}
            />
            <SandpackCodeEditor
              style={{ height: "90%", flex: 1 }}
              showTabs
              showLineNumbers
              showInlineErrors
              closableTabs
              readOnly
            />
          </TabsContent>
        </SandpackLayout>
      </div>

      {/* Preview error banner — uses onFixError (Gemini), not onImprove (Cline) */}
      {previewError &&
        !isGenerating &&
        !isImproving &&
        activeTab === "preview" && (
          <div className="absolute inset-x-0 bottom-0 z-20 border-t border-db-danger/40 bg-db-surface-solid p-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-db-danger" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-db-danger">
                  Preview error
                </p>
                <p className="break-all text-xs text-db-text-dim">
                  {previewError}
                </p>
              </div>
              <button
                onClick={() => onFixError(previewError)}
                className={cn(
                  accentPillClass,
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 px-3.5 text-[13px] font-medium",
                )}
              >
                <Bot className="h-3.5 w-3.5" />
                Fix with AI
              </button>
            </div>
          </div>
        )}
    </Tabs>
  );
}

// ─── CodePanel (outer) ────────────────────────────────────────────────────────

export function CodePanel({
  fileData,
  isGenerating,
  statusLog,
  onImprove,
  onFixError,
  onFilePatch: _onFilePatch,
  appTitle,
  isImproving,
  isProUser,
}: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");

  useEffect(() => {
    if (fileData) setActiveTab("preview");
  }, [fileData]);

  const files = fileData?.files ?? PLACEHOLDER_FILES;
  const dependencies = {
    ...BASE_DEPENDENCIES,
    ...(fileData?.dependencies ?? {}),
  };

  // Key only on file path set — NOT on file contents.
  // Content changes go through sandpack.updateFile() inside SandpackInner.
  // This prevents Sandpack from remounting when only code changes.
  const filePathKey = Object.keys(files).sort().join("|");

  return (
    // Relative, so the preview error bar pins to this panel's bottom edge
    // instead of spanning the viewport over the chat column.
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SandpackProvider
        key={filePathKey}
        template="react"
        theme={daybreakSandpackTheme}
        files={files}
        customSetup={{ dependencies }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          recompileMode: "delayed",
          recompileDelay: 500,
        }}
      >
        <SandpackInner
          isGenerating={isGenerating}
          statusLog={statusLog}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onImprove={onImprove}
          onFixError={onFixError}
          fileData={fileData}
          appTitle={appTitle}
          isImproving={isImproving}
          isProUser={isProUser}
        />
      </SandpackProvider>
    </div>
  );
}
