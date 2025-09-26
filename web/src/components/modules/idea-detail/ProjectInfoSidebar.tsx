"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { IconMapper } from "@/components/modules/idea-detail/IconMapper";
import { ProjectData } from "@/types";
import { FileText, Users, BarChart3, Wrench, ChevronRight } from "lucide-react";
import EditableSidebarField from "@/components/modules/idea-detail/EditableSidebarField";
import { updateProjectFields } from "@/lib/actions/idea-actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface ProjectInfoSidebarProps {
  project: ProjectData;
  onUpdate: () => void;
}

export default function ProjectInfoSidebar({
  project,
  onUpdate,
}: ProjectInfoSidebarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // const handleSaveField = async (fieldName: string, newValue: any) => {
  //   startTransition(async () => {
  //     const result = await updateProjectField(project.id, fieldName, newValue);
  //     if (result.success) {
  //       toast.success(`"${fieldName.replace("_", " ")}" has been updated.`);
  //       onUpdate();
  //     } else {
  //       toast.error(`Failed to update ${fieldName.replace("_", " ")}.`, {
  //         description: result.error,
  //       });
  //     }
  //   });
  // };

  const handleSave = (fieldName: string) => async (newValue: any) => {
    const result = await updateProjectFields(project.id, {
      [fieldName]: newValue,
    });
    if (result.success) {
      onUpdate();
    }
    return result;
  };

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
          <EditableSidebarField
            fieldName="Problem Statement"
            initialValue={project.problem_statement || ""}
            onSave={handleSave("problem_statement")}
            editAs="textarea"
            displayAs="text"
          />
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableSidebarField
            fieldName="Target Audience"
            initialValue={project.target_audience || []}
            onSave={handleSave("target_audience")}
            editAs="list"
            displayAs="list"
          />
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableSidebarField
            fieldName="Success Metrics"
            initialValue={project.success_metrics || []}
            onSave={handleSave("success_metrics")}
            editAs="list"
            displayAs="list"
          />
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="w-5 h-5 text-primary" />
            Tech Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableSidebarField
            fieldName="Tech Stack"
            initialValue={project.tech_stack || []}
            onSave={handleSave("tech_stack")}
            editAs="list"
            displayAs="badge"
          />
        </CardContent>
      </Card>
    </aside>
  );
}
