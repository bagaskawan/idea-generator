import createClient from "@/lib/db/server";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/modules/idea-detail/Guide/GuideView";

type GuidePageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuidePage({ params }: GuidePageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // Verify project exists
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, title")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch workbench content for context
  const { data: workbenchData } = await supabase
    .from("workbench_content")
    .select("content")
    .eq("project_id", id)
    .single();

  const workbenchContent = workbenchData?.content?.markdown || "";

  return (
    <div className="h-screen w-full overflow-hidden">
      <GuideView
        projectId={id}
        workbenchContent={workbenchContent}
        projectTitle={project.title}
      />
    </div>
  );
}
