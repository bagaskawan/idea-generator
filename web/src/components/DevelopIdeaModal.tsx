import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ProjectData } from "@/types";

interface DevelopIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProjectData | null;
  elaboration: string | null;
  isLoading: boolean;
}

export default function DevelopIdeaModal({
  isOpen,
  onClose,
  item,
  elaboration,
  isLoading,
}: DevelopIdeaModalProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Developing Idea: {item.title}</DialogTitle>
          <DialogDescription>
            AI-powered elaboration and insights for your idea.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating insights...</p>
            </div>
          ) : elaboration ? (
            <ScrollArea className="h-full pr-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{elaboration}</div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No elaboration available.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => {}}>Save to Notes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
