"use client";

import { projects } from "@/utils/dashboard/data";
import { ProjectCard } from "@/components/dashboard/ProjectCard";

export default function MainContent() {
  return (
    <main>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </main>
  );
}
