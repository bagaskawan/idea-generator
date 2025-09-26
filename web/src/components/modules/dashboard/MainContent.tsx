"use client";

import { ProjectCard } from "@/components/modules/dashboard/ProjectCard";
import { AddNewIdeaCard } from "../idea-generate/AddNewIdeaCard";
import EmptyState from "@/components/modules/dashboard/EmptyState";
import {
  AnimatedGrid,
  AnimatedGridItem,
} from "@/components/modules/dashboard/AnimatedGrid";
import { ProjectData } from "@/types";
// Import 'isValid' untuk pemeriksaan tanggal yang andal
import { formatDistanceToNow, isValid } from "date-fns";

export default function MainContent({ projects }: { projects: ProjectData[] }) {
  if (!projects || projects.length === 0) {
    return <EmptyState />;
  }

  // Fungsi helper untuk memformat tanggal dengan aman
  const getSafeLastActivity = (
    createdAt: Date | string | undefined | null
  ): string => {
    // Jika createdAt tidak ada, kembalikan string default
    if (!createdAt) {
      return "No creation date";
    }

    const date = new Date(createdAt);

    // Periksa apakah tanggal yang dihasilkan valid
    if (!isValid(date)) {
      console.warn("Invalid date value received for project:", createdAt);
      return "Invalid date";
    }

    return `Created ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  return (
    <AnimatedGrid>
      <AnimatedGridItem>
        <AddNewIdeaCard />
      </AnimatedGridItem>
      {projects.map((project) => (
        <AnimatedGridItem key={project.id}>
          <ProjectCard
            id={project.id}
            title={project.title}
            description={project.problem_statement}
            type="default"
            tags={project.tags || ["New"]}
            // Gunakan fungsi helper yang sudah aman
            lastActivity={getSafeLastActivity(project.created_at)}
            avatars={[]}
            isStarred={false}
          />
        </AnimatedGridItem>
      ))}
    </AnimatedGrid>
  );
}
