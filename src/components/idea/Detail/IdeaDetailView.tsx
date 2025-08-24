// src/components/idea/IdeaDetailView.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { DataItem } from "@/utils/types";
import FullScreenLoading from "@/components/FullScreenLoading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import "@blocknote/mantine/style.css";
import { AIMenuButton } from "@/components/ai/AIMenuButton";

type IdeaDetailViewProps = {
  id: string;
};

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const supabase = createClient();
  const router = useRouter();
  const [idea, setIdea] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useCreateBlockNote();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isRealtimeUpdate = useRef(false);

  // Fetch project data
  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, supabase]);

  // Always sync description into editor
  useEffect(() => {
    const syncEditor = async () => {
      if (!editor || !idea) return;

      const currentMarkdown = await editor.blocksToMarkdownLossy(
        editor.topLevelBlocks
      );
      // Jika editor kosong tapi DB ada description → isi ulang
      if (
        (!currentMarkdown || currentMarkdown.trim() === "") &&
        idea.description
      ) {
        const blocks = await editor.tryParseMarkdownToBlocks(idea.description);
        editor.replaceBlocks(editor.topLevelBlocks, blocks);
      }
    };

    syncEditor();
  }, [editor, idea]);

  // Save changes to Supabase
  useEffect(() => {
    if (!editor) return;

    const handleContentChange = () => {
      if (isRealtimeUpdate.current) return;

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        setIsSaving(true);
        const markdown = await editor.blocksToMarkdownLossy(
          editor.topLevelBlocks
        );

        const { error } = await supabase
          .from("projects")
          .update({
            description: markdown,
            last_activity: new Date().toISOString(),
          })
          .eq("id", id);

        setIsSaving(false);
        if (error) {
          toast.error("Failed to save changes.", {
            description: error.message,
          });
        } else {
          toast.success("Changes saved successfully!");
        }
      }, 1500);
    };

    const unsubscribe = editor.onEditorContentChange(handleContentChange);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      unsubscribe?.();
    };
  }, [editor, id, supabase]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!id || !supabase || !editor) return;

    const channel = supabase
      .channel(`project-description-update-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          const newDescription = payload.new.description as string;
          const currentMarkdown = await editor.blocksToMarkdownLossy(
            editor.topLevelBlocks
          );

          if (newDescription && newDescription !== currentMarkdown) {
            toast.info("Deskripsi diperbarui oleh pengguna lain.");

            isRealtimeUpdate.current = true;
            const blocks = await editor.tryParseMarkdownToBlocks(
              newDescription
            );
            editor.replaceBlocks(editor.topLevelBlocks, blocks);

            setTimeout(() => {
              isRealtimeUpdate.current = false;
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase, editor]);

  if (loading) return <FullScreenLoading text="Memuat detail ide..." />;
  if (error)
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  if (!idea)
    return <div className="text-center mt-20">Proyek tidak ditemukan.</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between mb-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Button>
      </header>

      <div className="w-full">
        {/* Editor Column */}
        <div className="space-y-8">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">{idea.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockNoteView
              editor={editor}
              editable={true}
              theme="light"
              formattingToolbar={false}
            >
              <FormattingToolbarController
                formattingToolbar={() => (
                  <FormattingToolbar>
                    <BlockTypeSelect key="blockTypeSelect" />
                    <BasicTextStyleButton
                      key="boldStyleButton"
                      basicTextStyle="bold"
                    />
                    <BasicTextStyleButton
                      key="italicStyleButton"
                      basicTextStyle="italic"
                    />
                    <BasicTextStyleButton
                      key="underlineStyleButton"
                      basicTextStyle="underline"
                    />
                    <TextAlignButton
                      key="textAlignLeftButton"
                      textAlignment="left"
                    />
                    <TextAlignButton
                      key="textAlignCenterButton"
                      textAlignment="center"
                    />
                    <TextAlignButton
                      key="textAlignRightButton"
                      textAlignment="right"
                    />
                    <ColorStyleButton key="colorStyleButton" />
                    <CreateLinkButton key="createLinkButton" />
                    <AIMenuButton />
                  </FormattingToolbar>
                )}
              />
            </BlockNoteView>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
