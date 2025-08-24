// src/components/idea/IdeaDetailView.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { DataItem } from "@/utils/types";
import FullScreenLoading from "@/components/FullScreenLoading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Github,
  Link as LinkIcon,
  BrainCircuit,
  Calendar,
  Layers,
  Flag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { getTagColor } from "@/utils/dashboard/tag-label";
import { cn } from "@/lib/utils";

// BlockNote Imports
import {
  useCreateBlockNote,
  FormattingToolbarController,
  FormattingToolbar,
  BasicTextStyleButton,
  BlockTypeSelect,
  TextAlignButton,
  CreateLinkButton,
  ColorStyleButton,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { AIMenuButton } from "@/components/ai/AIMenuButton";

// Helper Functions
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "in progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-500/30";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-500/30";
    case "idea":
    default:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500/30";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-500/30";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-500/30";
    case "low":
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-500/30";
  }
};

type IdeaDetailViewProps = {
  id: string;
};

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const supabase = createClient();
  const router = useRouter();
  const [idea, setIdea] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to hold the description, which will trigger the editor update
  const [description, setDescription] = useState<string | null>(null);

  const editor = useCreateBlockNote();

  // Effect to fetch data when the component mounts or ID changes
  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;

      setLoading(true);
      setDescription(null); // Reset description on new ID
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw new Error(
            "Proyek tidak ditemukan atau Anda tidak memiliki akses."
          );
        }

        if (data) {
          const formattedData: DataItem = {
            id: data.id,
            name: data.title,
            description: data.description,
            createdAt: new Date(data.created_at),
            tags: data.tags || [],
            isStarred: data.is_starred || false,
            lastActivity: data.last_activity,
            status: data.status || "Idea",
            priority: data.priority || "Medium",
            tech_stack: data.tech_stack || [],
            cover_image_url: data.cover_image_url,
            repo_url: data.repo_url,
            live_url: data.live_url,
          };
          setIdea(formattedData);
          setDescription(data.description); // Set the description state
        } else {
          throw new Error("Proyek tidak ditemukan.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, supabase]);

  // Effect to update the editor when the description is available
  useEffect(() => {
    // Check that the editor & description are defined
    if (editor && description) {
      // Parse the markdown and update the editor
      const populateEditor = async () => {
        const blocks = await editor.tryParseMarkdownToBlocks(description);
        editor.replaceBlocks(editor.topLevelBlocks, blocks);
      };
      populateEditor();
    }
  }, [description, editor]);

  if (loading) return <FullScreenLoading text="Memuat detail ide..." />;
  if (error)
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  if (!idea)
    return <div className="text-center mt-20">Proyek tidak ditemukan.</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project</span>
        </Button>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold">{idea.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockNoteView
                editor={editor}
                editable={true}
                theme={"light"}
                formattingToolbar={false}
              >
                <FormattingToolbarController
                  formattingToolbar={() => (
                    <FormattingToolbar>
                      <BlockTypeSelect key={"blockTypeSelect"} />
                      <BasicTextStyleButton
                        key={"boldStyleButton"}
                        basicTextStyle={"bold"}
                      />
                      <BasicTextStyleButton
                        key={"italicStyleButton"}
                        basicTextStyle={"italic"}
                      />
                      <BasicTextStyleButton
                        key={"underlineStyleButton"}
                        basicTextStyle={"underline"}
                      />
                      <TextAlignButton
                        key={"textAlignLeftButton"}
                        textAlignment={"left"}
                      />
                      <TextAlignButton
                        key={"textAlignCenterButton"}
                        textAlignment={"center"}
                      />
                      <TextAlignButton
                        key={"textAlignRightButton"}
                        textAlignment={"right"}
                      />
                      <ColorStyleButton key={"colorStyleButton"} />
                      <CreateLinkButton key={"createLinkButton"} />
                      <AIMenuButton />
                    </FormattingToolbar>
                  )}
                />
              </BlockNoteView>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Status</span>
                <Badge
                  variant="outline"
                  className={cn("ml-auto", getStatusColor(idea.status))}
                >
                  {idea.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Flag className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Priority</span>
                <Badge
                  variant="outline"
                  className={cn("ml-auto", getPriorityColor(idea.priority))}
                >
                  {idea.priority}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Created</span>
                <span className="ml-auto text-muted-foreground text-sm">
                  {format(new Date(idea.createdAt), "dd MMM yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags & Tech</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {idea.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={getTagColor(tag)}>
                  {tag}
                </Badge>
              ))}
              {idea.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <BrainCircuit className="w-4 h-4 mr-2" />
                Elaborasi dengan AI
              </Button>
              {idea.repo_url && (
                <a
                  href={idea.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Github className="w-4 h-4 mr-2" />
                    Lihat Repositori
                  </Button>
                </a>
              )}
              {idea.live_url && (
                <a
                  href={idea.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Lihat Demo Live
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
