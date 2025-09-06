// src/components/dashboard/MainContent.tsx
"use client";

import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { AddNewIdeaCard } from "../idea/AddNewIdeaCard";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  AnimatedGrid,
  AnimatedGridItem,
} from "@/components/dashboard/AnimatedGrid";
import { DataItem } from "@/utils/types";
import { formatDistanceToNow } from "date-fns";

export default function MainContent({ projects }: { projects: DataItem[] }) {
  if (!projects || projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <AnimatedGrid>
      <AnimatedGridItem>
        <AddNewIdeaCard />
      </AnimatedGridItem>
      {projects.map((project) => (
        <AnimatedGridItem key={project.id}>
          <ProjectCard
            id={project.id}
            title={project.name}
            description={project.description}
            type="default"
            tags={project.tags || ["New"]}
            lastActivity={`Created ${formatDistanceToNow(
              new Date(project.createdAt),
              {
                addSuffix: true,
              }
            )}`}
            avatars={[]}
            isStarred={false}
          />
        </AnimatedGridItem>
      ))}
    </AnimatedGrid>
  );
}
