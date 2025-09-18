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
  uniqueSellingProposition: string;
  keyFeatures: {
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
    <Card className="flex flex-col h-full p-0">
      <div className="p-6 flex-grow">
        <CardHeader className="p-0">
          <CardTitle>{idea.projectName}</CardTitle>
          <CardDescription className="pt-2">
            {idea.uniqueSellingProposition}
          </CardDescription>
        </CardHeader>
      </div>
      <CardFooter className="p-0 mt-auto">
        <Button
          onClick={onSelect}
          disabled={isLoading}
          className="w-full rounded-t-none h-12 text-base group"
        >
          Buat Blueprint
          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
