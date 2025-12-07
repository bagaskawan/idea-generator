import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Badge } from "@/components/shared/ui/badge";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { ProjectData } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface IdeaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProjectData | null;
}

export default function IdeaDetailModal({
  isOpen,
  onClose,
  item,
}: IdeaDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl">{item.title}</DialogTitle>
            <Badge variant={item.status === "Done" ? "default" : "secondary"}>
              {item.status}
            </Badge>
          </div>
          <DialogDescription>
            Created{" "}
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
            })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Problem Statement
              </h3>
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {item.problem_statement || "No description provided."}
              </p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {item.tech_stack && item.tech_stack.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {item.target_audience && item.target_audience.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Target Audience
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {item.target_audience.map((audience, idx) => (
                    <li key={idx} className="text-gray-900 dark:text-gray-100">
                      {audience.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
