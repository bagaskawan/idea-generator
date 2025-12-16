"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { IconMapper } from "@/components/modules/idea-detail/IconMapper";
import {
  Plus,
  CornerUpLeft,
  FileText,
  Users,
  BarChart3,
  Wrench,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { GeneratedBlueprint } from "@/types";

// BlockNote
import { BlockNoteView } from "@blocknote/mantine";
import { useBlocknoteEditor } from "@/hooks/util/useBlocknoteEditor";
import { useBlocknoteTheme } from "@/hooks/util/useBlockNoteTheme";
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import { Separator } from "@/components/shared/ui/separator";

interface ResultStepProps {
  blueprint: GeneratedBlueprint;
  onSave: () => void;
  onRestart: () => void;
  isSaving: boolean;
}

// Komponen kecil untuk menjaga kode tetap DRY (Don't Repeat Yourself)
const InfoSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="text-lg font-semibold flex items-center gap-3 text-foreground mb-4">
      {icon}
      {title}
    </h3>
    <div className="text-muted-foreground pl-8">{children}</div>
  </div>
);

export const ResultStep = ({
  blueprint,
  onSave,
  onRestart,
  isSaving,
}: ResultStepProps) => {
  const editor = useBlocknoteEditor();
  const theme = useBlocknoteTheme();
  const { projectData, workbenchContent } = blueprint;

  useEffect(() => {
    const loadContent = async () => {
      if (editor && workbenchContent) {
        const blocks = await editor.tryParseMarkdownToBlocks(workbenchContent);
        editor.replaceBlocks(editor.topLevelBlocks, blocks);
      }
    };
    loadContent();
  }, [editor, workbenchContent]);

  return (
    <div className="animate-in fade-in-50 mt-16 mb-24 max-w-5xl mx-auto">
      {/* 1. Header Utama */}
      <header className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          AI Generated Blueprint
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          {projectData.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your project blueprint is ready. Review the details below and save it
          to your collection.
        </p>
      </header>

      {/* 2. Project Summary Section */}
      <div className="space-y-12 bg-card/50  rounded-xl p-8 md:p-12">
        {/* Problem Statement */}
        <InfoSection
          title="Problem Statement"
          icon={<FileText className="w-5 h-5 text-primary" />}
        >
          <p className="leading-relaxed">{projectData.problem_statement}</p>
        </InfoSection>

        <Separator />

        {/* Grid untuk Info Ringkas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          <InfoSection
            title="Target Audience"
            icon={<Users className="w-5 h-5 text-primary" />}
          >
            <ul className="space-y-3">
              {projectData.target_audience.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <IconMapper iconName={a.icon} className="w-5 h-5 mt-1" />
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          </InfoSection>

          <InfoSection
            title="Success Metrics"
            icon={<BarChart3 className="w-5 h-5 text-primary" />}
          >
            <ul className="space-y-3">
              {projectData.success_metrics.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
                  <span>{m.text}</span>
                </li>
              ))}
            </ul>
          </InfoSection>
        </div>

        <Separator />

        {/* Tech Stack */}
        <InfoSection
          title="Tech Stack"
          icon={<Wrench className="w-5 h-5 text-primary" />}
        >
          <div className="flex flex-wrap gap-2">
            {projectData.tech_stack.map((tech, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-base px-3 py-1"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </InfoSection>
      </div>

      {/* 3. Workbench Content (Editor) */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Project Workbench
        </h2>
        <div className=" bg-card p-2 min-h-[300px]">
          {editor && (
            <BlockNoteView editor={editor} editable={false} theme={theme} />
          )}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="mt-16 py-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="lg"
          className="rounded-full px-8 py-6 text-base"
        >
          <Plus className="w-5 h-5 mr-2" /> Save to Collection
        </Button>
        <Button
          variant="outline"
          onClick={onRestart}
          disabled={isSaving}
          size="lg"
          className="rounded-full px-8 py-6 text-base"
        >
          <CornerUpLeft className="w-5 h-5 mr-2" /> Generate Another
        </Button>
      </div>
    </div>
  );
};
