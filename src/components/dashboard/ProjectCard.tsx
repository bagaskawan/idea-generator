"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ProjectCardProps } from "@/utils/dashboard/data";
import { Badge } from "@/components/ui/badge";
import { getTagColor } from "@/utils/dashboard/tag-label";

export const ProjectCard = ({
  type,
  title,
  description,
  isFloating,
  tags,
}: ProjectCardProps) => {
  const cardClasses = cn(
    "bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col aspect-square lg:aspect-auto",
    isFloating && "relative transform-gpu scale-105 shadow-xl -rotate-2"
  );

  return (
    <Card className={cardClasses}>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-3xl tracking-tight text-card-foreground">
            {title}
          </h3>
        </div>

        {type === "default" && description && (
          <div className="mt-6 text-muted-foreground text-sm space-y-1">
            {description.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn("border-transparent", getTagColor(tag))}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
