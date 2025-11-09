import createClient from "@/lib/db/server";
import { notFound } from "next/navigation";
import SchemaView from "@/components/modules/idea-detail/DatabaseSchema/SchemaView";
import { FullProject, SchemaResponse } from "@/types";

type SchemaPageProps = {
  params: {
    id: string;
  };
};

// Halaman ini mengambil data awal di server
export default async function SchemaPage({ params }: SchemaPageProps) {
  const supabase = await createClient();
  const { id } = await params;
  console.log(id);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  //get data workbench_content
  const { data: workbenchData } = await supabase
    .from("workbench_content")
    .select("content")
    .eq("project_id", id)
    .single();

  const fullProjectData = {
    ...project,
    workbenchContent: workbenchData?.content as { markdown: string } | null,
  };

  const { data: schemaData, error: schemaError } = await supabase
    .from("database_schemas")
    .select("schema: schema_data")
    .eq("project_id", id)
    .single();

  const initialSchema = schemaError ? null : (schemaData as SchemaResponse);

  return (
    <div className="h-[calc(100vh-80px)] w-full">
      <SchemaView
        project={project as FullProject}
        initialSchema={initialSchema}
      />
    </div>
  );
}
