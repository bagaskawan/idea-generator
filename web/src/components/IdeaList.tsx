import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Trash2, Eye, Lightbulb } from "lucide-react";
import { ProjectData } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface IdeaListProps {
  data: ProjectData[];
  deleteItem: (id: string) => void;
  showDetails: (item: ProjectData) => void;
  developIdea: (item: ProjectData) => void;
}

export default function IdeaList({
  data,
  deleteItem,
  showDetails,
  developIdea,
}: IdeaListProps) {
  if (data.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">No ideas yet. Start by adding one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item) => (
        <Card key={item.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="line-clamp-1">{item.title}</CardTitle>
              <Badge variant={item.status === "Done" ? "default" : "secondary"}>
                {item.status}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {item.problem_statement || "No description provided."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-wrap gap-2">
              {item.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Created{" "}
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
              })}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteItem(item.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => developIdea(item)}
              className="gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Develop
            </Button>
            <Button
              size="sm"
              onClick={() => showDetails(item)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
