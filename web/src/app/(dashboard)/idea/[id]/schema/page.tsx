import createClient from "@/lib/db/server";
import { notFound } from "next/navigation";
import SchemaView from "@/components/modules/idea-detail/DatabaseSchema/SchemaView";

type SchemaPageProps = {
  params: {
    id: string;
  };
};

// Halaman ini mengambil data awal di server
export default async function SchemaPage({ params }: SchemaPageProps) {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      content,
      project_data (*)
    `
    )
    .eq("id", params.id)
    .single();

  if (!project) {
    notFound();
  }
  const { data: savedSchema } = await supabase
    .from("database_schemas")
    .select("schema_data")
    .eq("project_id", params.id)
    .single();

  return (
    <div className="h-[calc(100vh-80px)] w-full">
      <SchemaView
        project={project}
        initialSchema={savedSchema?.schema_data || null}
      />
    </div>
  );
}
