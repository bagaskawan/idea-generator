"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Code2,
  FileCode,
  Rocket,
  Database,
  Shield,
  Cloud,
  Folder,
  Loader2,
  Wand2,
  Info,
  ChevronDown,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { GuideData, GuideTask, GuideCategory } from "@/types";

// ============================================
// ICON MAPPER
// ============================================

const iconMap: Record<string, React.ReactNode> = {
  rocket: <Rocket className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
  code2: <Code2 className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  cloud: <Cloud className="w-4 h-4" />,
  folder: <Folder className="w-4 h-4" />,
  file: <FileCode className="w-4 h-4" />,
  filecode: <FileCode className="w-4 h-4" />,
};

function getIcon(iconName?: string): React.ReactNode {
  if (!iconName) return <Folder className="w-4 h-4" />;
  return iconMap[iconName.toLowerCase()] || <Folder className="w-4 h-4" />;
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Terminal Block Component - macOS style
function TerminalBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Command copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-[#1a1a1a] my-4 shadow-lg">
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-zinc-500 font-medium">Terminal</span>
      </div>
      <div className="relative p-4">
        <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
          {content.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="text-emerald-400 select-none mr-2">$</span>
              <span>{line}</span>
            </div>
          ))}
        </pre>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-700 hover:bg-zinc-600"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-400" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Code Block Component
function CodeBlock({
  content,
  language,
  filename,
}: {
  content: string;
  language?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 my-4">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
            {filename}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span>Copy</span>
          </button>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-800 dark:text-zinc-200">
          <code>{content}</code>
        </pre>
        {!filename && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-400" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ProTip Block Component - New style matching design
function TipBlock({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-4 my-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <Info className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            ProTip
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {content.replace(/^💡\s*(Pro Tip:|ProTip:?)?\s*/i, "")}
          </p>
        </div>
      </div>
    </div>
  );
}

// Task Item Component - Updated with yellow highlight
function TaskItem({
  task,
  isActive,
  onClick,
  onToggleComplete,
}: {
  task: GuideTask;
  isActive: boolean;
  onClick: () => void;
  onToggleComplete: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group",
        isActive && "bg-yellow-50 dark:bg-yellow-900/20"
      )}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className="flex-shrink-0"
      >
        {task.is_completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : isActive ? (
          <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-400" />
        ) : (
          <Circle className="w-5 h-5 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            task.is_completed && "line-through text-zinc-400",
            isActive && "text-zinc-900 dark:text-zinc-100"
          )}
        >
          {task.title}
        </p>
      </div>
      {isActive && <ChevronRight className="w-4 h-4 text-yellow-500" />}
    </div>
  );
}

// Phase Section Component
function PhaseSection({
  category,
  categoryIndex,
  activeTask,
  onTaskClick,
  onToggleComplete,
}: {
  category: GuideCategory;
  categoryIndex: number;
  activeTask: GuideTask | null;
  onTaskClick: (task: GuideTask) => void;
  onToggleComplete: (task: GuideTask) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = category.tasks.filter((t) => t.is_completed).length;
  const totalCount = category.tasks.length;

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              "w-4 h-4 text-zinc-400 transition-transform",
              !isOpen && "-rotate-90"
            )}
          />
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
            PHASE {categoryIndex + 1}: {category.name.toUpperCase()}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            completedCount === totalCount
              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )}
        >
          {completedCount}/{totalCount}
        </Badge>
      </button>
      {isOpen && (
        <div className="mt-1 ml-3 space-y-0.5">
          {category.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isActive={activeTask?.id === task.id}
              onClick={() => onTaskClick(task)}
              onToggleComplete={() => onToggleComplete(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface GuideViewProps {
  projectId: string;
  workbenchContent?: string;
  initialGuide?: GuideData | null;
  projectTitle?: string;
}

export function GuideView({
  projectId,
  workbenchContent,
  initialGuide,
  projectTitle = "Project Guide",
}: GuideViewProps) {
  const [guideData, setGuideData] = useState<GuideData | null>(
    initialGuide || null
  );
  const [activeTask, setActiveTask] = useState<GuideTask | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialGuide);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>("Never");

  // Helper function to format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 5) return "just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Update relative time text periodically
  useEffect(() => {
    if (!lastUpdated) return;

    const updateText = () =>
      setLastUpdatedText(formatRelativeTime(lastUpdated));
    updateText();

    const interval = setInterval(updateText, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Get phase and step info for active task
  const activeTaskInfo = useMemo(() => {
    if (!activeTask || !guideData) return null;

    for (let phaseIdx = 0; phaseIdx < guideData.categories.length; phaseIdx++) {
      const category = guideData.categories[phaseIdx];
      const stepIdx = category.tasks.findIndex((t) => t.id === activeTask.id);
      if (stepIdx !== -1) {
        return {
          phase: phaseIdx + 1,
          step: stepIdx + 1,
          phaseName: category.name,
        };
      }
    }
    return null;
  }, [activeTask, guideData]);

  // Fetch guide on mount if not provided
  useEffect(() => {
    if (!initialGuide) {
      fetchGuide();
    }
  }, [projectId, initialGuide]);

  const fetchGuide = async () => {
    try {
      setIsLoading(true);
      const data = await api.getGuide(projectId);
      setGuideData(data);

      // Set lastUpdated from database
      if (data.last_updated) {
        setLastUpdated(new Date(data.last_updated));
      }
    } catch (error) {
      console.error("Failed to fetch guide:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateGuide = async () => {
    if (!workbenchContent) {
      toast.error("No blueprint content", {
        description: "Please add content to your workbench first.",
      });
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Generating implementation guide...", { id: "generate" });

      const data = await api.generateGuide(projectId, workbenchContent);
      setGuideData(data);

      toast.success("Guide generated!", {
        id: "generate",
        description: `Created ${data.total_tasks} tasks across ${data.categories.length} phases.`,
      });
    } catch (error) {
      console.error("Failed to generate guide:", error);
      toast.error("Failed to generate guide", { id: "generate" });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskComplete = async (task: GuideTask) => {
    const newCompleted = !task.is_completed;

    // Optimistic update
    setGuideData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        completed_tasks: prev.completed_tasks + (newCompleted ? 1 : -1),
        categories: prev.categories.map((cat) => ({
          ...cat,
          tasks: cat.tasks.map((t) =>
            t.id === task.id ? { ...t, is_completed: newCompleted } : t
          ),
        })),
      };
    });

    // Update active task if it's the same
    if (activeTask?.id === task.id) {
      setActiveTask((prev) =>
        prev ? { ...prev, is_completed: newCompleted } : prev
      );
    }

    try {
      await api.updateTaskProgress(task.id, projectId, newCompleted);
      setLastUpdated(new Date());
      if (newCompleted) {
        toast.success("Task completed! 🎉");
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error("Failed to update progress");
      // Revert on error
      setGuideData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          completed_tasks: prev.completed_tasks + (newCompleted ? -1 : 1),
          categories: prev.categories.map((cat) => ({
            ...cat,
            tasks: cat.tasks.map((t) =>
              t.id === task.id ? { ...t, is_completed: !newCompleted } : t
            ),
          })),
        };
      });
    }
  };

  // Calculate progress
  const progressPercent = useMemo(() => {
    if (!guideData || guideData.total_tasks === 0) return 0;
    return Math.round(
      (guideData.completed_tasks / guideData.total_tasks) * 100
    );
  }, [guideData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-zinc-500">Loading guide...</p>
        </div>
      </div>
    );
  }

  // Empty state - no guide yet
  if (!guideData || guideData.categories.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Wand2 className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
            Generate Implementation Guide
          </h2>
          <p className="text-zinc-500 mb-6">
            Transform your project blueprint into a step-by-step implementation
            guide with code snippets and best practices.
          </p>
          <Button
            onClick={handleGenerateGuide}
            disabled={isGenerating || !workbenchContent}
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Guide with AI
              </>
            )}
          </Button>
          {!workbenchContent && (
            <p className="text-xs text-zinc-400 mt-4">
              Add content to your blueprint workbench first.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* Top Header Bar - Spans Full Width */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {/* Left: Back to Canvas */}
        <Button
          variant="ghost"
          size="lg"
          className="gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Canvas</span>
        </Button>

        {/* Right: Last Saved */}
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>Last saved {lastUpdated ? lastUpdatedText : "–"}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Navigation */}
        <div className="w-[300px] border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-900">
          {/* Progress Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Course Progress
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {progressPercent}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">{projectTitle}</p>
            <Progress
              value={progressPercent}
              className="h-2 bg-zinc-200 dark:bg-zinc-700"
            />
            <p className="text-xs text-zinc-500 mt-2">
              {guideData.completed_tasks}/{guideData.total_tasks} Tasks
              Completed
            </p>
          </div>

          {/* Phase List */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              {guideData.categories.map((category, idx) => (
                <PhaseSection
                  key={category.id}
                  category={category}
                  categoryIndex={idx}
                  activeTask={activeTask}
                  onTaskClick={setActiveTask}
                  onToggleComplete={toggleTaskComplete}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Regenerate Button */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={handleGenerateGuide}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Regenerate Guide
            </Button>
          </div>
        </div>

        {/* Right Panel - Content Detail */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950">
          {activeTask ? (
            <>
              {/* Task Header */}
              <div className="p-8 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-start justify-between">
                  <div>
                    {activeTaskInfo && (
                      <Badge className="mb-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100">
                        PHASE {activeTaskInfo.phase} • STEP{" "}
                        {activeTaskInfo.step}
                      </Badge>
                    )}
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                      {activeTask.title}
                    </h1>
                    {activeTask.description && (
                      <p className="text-zinc-500 mt-2 max-w-2xl leading-relaxed">
                        {activeTask.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => toggleTaskComplete(activeTask)}
                    className={cn(
                      "flex-shrink-0 font-semibold",
                      activeTask.is_completed
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-yellow-400 hover:bg-yellow-500 text-zinc-900"
                    )}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {activeTask.is_completed ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>
              </div>

              {/* Task Content */}
              <ScrollArea className="flex-1">
                <div className="p-8 max-w-3xl">
                  {activeTask.content_blocks.map((block, index) => {
                    switch (block.type) {
                      case "text":
                        // Check if it starts with a number for section headings
                        const isHeading = /^\d+\.\s/.test(block.content);
                        if (isHeading) {
                          return (
                            <h2
                              key={block.id}
                              className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-3 first:mt-0"
                            >
                              {block.content}
                            </h2>
                          );
                        }
                        return (
                          <p
                            key={block.id}
                            className="text-zinc-600 dark:text-zinc-400 leading-relaxed my-4"
                          >
                            {block.content}
                          </p>
                        );
                      case "code":
                        return (
                          <CodeBlock
                            key={block.id}
                            content={block.content}
                            language={block.language}
                            filename={block.filename}
                          />
                        );
                      case "terminal":
                        return (
                          <TerminalBlock
                            key={block.id}
                            content={block.content}
                          />
                        );
                      case "tip":
                        return (
                          <TipBlock key={block.id} content={block.content} />
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </ScrollArea>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                  Ready to Build?
                </h2>
                <p className="text-zinc-500 mb-6">
                  Select a task from the left panel to get started with
                  step-by-step implementation instructions.
                </p>
                {guideData.categories[0]?.tasks[0] && (
                  <Button
                    onClick={() =>
                      setActiveTask(guideData.categories[0].tasks[0])
                    }
                    className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Start with First Task
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
