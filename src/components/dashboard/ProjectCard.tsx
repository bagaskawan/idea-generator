"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ProjectCardProps } from "@/utils/dashboard/data";
import { Badge } from "@/components/ui/badge";
import { getTagColor } from "@/utils/dashboard/tag-label";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export const ProjectCard = ({
  title,
  description,
  isFloating,
  tags,
  lastActivity,
}: ProjectCardProps) => {
  const cardClasses = cn(
    "bg-card rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex flex-col aspect-square lg:aspect-auto",
    isFloating && "relative transform-gpu scale-105 shadow-xl -rotate-2"
  );

  return (
    <Card className={cardClasses}>
      <div className="mt-4 px-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-3xl tracking-tight text-card-foreground">
            {title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {description && (
          <p className="mt-2 text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
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
        <div className="mt-auto w-full pt-6 flex justify-end items-center">
          <p className="text-xs text-muted-foreground">{lastActivity}</p>
        </div>
      </div>
    </Card>
  );
};
