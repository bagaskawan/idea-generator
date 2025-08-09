"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { File, MoreHorizontal, Star } from "lucide-react";
import type { ProjectCardProps } from "@/utils/dashboard/data";

export const ProjectCard = ({
  type,
  title,
  description,
  avatars,
  lastActivity,
  isStarred,
  isFloating,
}: ProjectCardProps) => {
  const cardClasses = cn(
    "bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col aspect-square lg:aspect-auto",
    isFloating && "relative transform-gpu scale-105 shadow-xl -rotate-2"
  );

  return (
    <Card className={cardClasses}>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-card-foreground">{title}</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star
              className={cn(
                "w-5 h-5 cursor-pointer",
                isStarred && "text-yellow-400 fill-yellow-400"
              )}
            />
            <MoreHorizontal className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        {type === "default" && description && (
          <div className="mt-2 text-muted-foreground text-sm space-y-1">
            {description.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        {type === "internal" && (
          <div className="mt-3 flex gap-2">
            <File className="w-8 h-8 text-blue-500 dark:text-blue-400 fill-blue-100 dark:fill-blue-900/20" />
            <File className="w-8 h-8 text-orange-500 dark:text-orange-400 fill-orange-100 dark:fill-orange-900/20" />
            <File className="w-8 h-8 text-green-500 dark:text-green-400 fill-green-100 dark:fill-green-900/20" />
          </div>
        )}

        <div className="mt-auto pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {avatars.map((src, i) => (
                <Avatar key={i} className="w-8 h-8 border-2 border-card">
                  <AvatarImage src={`https://i.pravatar.cc/40?img=${i + 1}`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{lastActivity}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};