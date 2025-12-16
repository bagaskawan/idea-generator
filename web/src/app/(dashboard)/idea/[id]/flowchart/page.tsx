import createClient from "@/lib/db/server";
import { notFound } from "next/navigation";
import { FlowchartView } from "@/components/modules/idea-detail/Flowchart/FlowchartView";
import { FullProject } from "@/types";

type FlowchartPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FlowchartPage({ params }: FlowchartPageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // Get project data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Get workbench content for blueprint context
  const { data: workbenchData } = await supabase
    .from("workbench_content")
    .select("content")
    .eq("project_id", id)
    .single();

  // Build blueprint context from project data
  const blueprintContext = `
Project: ${project.title}
Problem Statement: ${project.problem_statement || "Not specified"}
Tech Stack: ${project.tech_stack?.join(", ") || "Not specified"}

Blueprint Content:
${workbenchData?.content?.markdown || "No blueprint content yet"}
  `.trim();

  return (
    <div className="h-[calc(100vh-80px)] w-full">
      <FlowchartView projectId={id} blueprintContext={blueprintContext} />
    </div>
  );
}
