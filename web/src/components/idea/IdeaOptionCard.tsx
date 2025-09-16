import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export type IdeaOption = {
  projectName: string;
  projectDescription: string;
  mvpFeatures: {
    featureName: string;
    description: string;
  }[];
};

interface IdeaOptionCardProps {
  idea: IdeaOption;
  onSelect: () => void;
  isLoading: boolean;
}

export function IdeaOptionCard({
  idea,
  onSelect,
  isLoading,
}: IdeaOptionCardProps) {
  return (
    <Card className="flex flex-col h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader>
        <CardTitle>{idea.projectName}</CardTitle>
        <CardDescription className="pt-2">
          {idea.projectDescription}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-end mt-auto pt-4">
        <div className="flex flex-wrap gap-2">
          {idea.mvpFeatures.map((mvpFeature, index) => (
            <Badge key={index} variant="secondary">
              {mvpFeature.featureName}
            </Badge>
          ))}
        </div>
        <Button onClick={onSelect} disabled={isLoading} size="sm">
          Buat Blueprint
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
