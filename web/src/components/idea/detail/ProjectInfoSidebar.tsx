"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconMapper } from "@/components/styles/IconMapper";
import { ProjectData } from "@/utils/types";
import { FileText, Users, BarChart3, Wrench, ChevronRight } from "lucide-react";

interface ProjectInfoSidebarProps {
  project: ProjectData;
}

export default function ProjectInfoSidebar({
  project,
}: ProjectInfoSidebarProps) {
  const kuantitatifMetrics =
    project.success_metrics?.filter((m) => m.type === "Kuantitatif") || [];
  const kualitatifMetrics =
    project.success_metrics?.filter((m) => m.type === "Kualitatif") || [];

  return (
    <aside className="space-y-6">
      <Card className="border-none shadow-none bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-primary" />
            Problem Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {project.problem_statement || "Belum didefinisikan."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {project.target_audience && project.target_audience.length > 0 ? (
            project.target_audience.map((audience, index) => (
              <div key={index} className="flex items-start gap-3">
                <IconMapper
                  iconName={audience.icon}
                  className="w-4 h-4 text-muted-foreground mt-1 shrink-0"
                />
                <span className="text-muted-foreground">{audience.text}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum didefinisikan.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {kuantitatifMetrics.length > 0 && (
            <div>
              <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                Kuantitatif
              </h4>
              <ul className="space-y-2">
                {kuantitatifMetrics.map((metric, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />{" "}
                    <span>{metric.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {kualitatifMetrics.length > 0 && (
            <div>
              <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                Kualitatif
              </h4>
              <ul className="space-y-2">
                {kualitatifMetrics.map((metric, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />{" "}
                    <span>{metric.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {kualitatifMetrics.length === 0 &&
            kuantitatifMetrics.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum didefinisikan.
              </p>
            )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="w-5 h-5 text-primary" />
            Tech Stack
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {project.tech_stack && project.tech_stack.length > 0 ? (
            project.tech_stack.map((tech, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {tech}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum didefinisikan.
            </p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
