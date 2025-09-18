"use server";

import { revalidatePath } from "next/cache";
import createClient from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface GeneratedBlueprint {
  projectData: {
    title: string;
    problem_statement: string;
    target_audience: any;
    success_metrics: any;
    tech_stack: string[];
  };
  workbenchContent: string;
}

// Fungsi addIdea yang sudah diperbarui
export async function addIdea(blueprint: GeneratedBlueprint) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to add an idea." };
  }

  // 1. Insert ke tabel 'projects' (metadata)
  const { data: newProject, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: blueprint.projectData.title,
      problem_statement: blueprint.projectData.problem_statement,
      target_audience: blueprint.projectData.target_audience,
      success_metrics: blueprint.projectData.success_metrics,
      tech_stack: blueprint.projectData.tech_stack,
      tags: ["AI-Generated"],
    })
    .select()
    .single();

  if (projectError) {
    console.error("Supabase insert error (projects):", projectError);
    return { success: false, error: projectError.message };
  }

  const newProjectId = newProject.id;

  // 2. Insert ke tabel 'workbench_content' (konten naratif)
  const { error: workbenchError } = await supabase
    .from("workbench_content")
    .insert({
      project_id: newProjectId,
      // Simpan konten workbench sebagai JSON
      content: { markdown: blueprint.workbenchContent },
    });

  if (workbenchError) {
    console.error("Supabase insert error (workbench):", workbenchError);
    // Idealnya, Anda bisa menghapus proyek yang sudah dibuat jika langkah ini gagal (rollback)
    return { success: false, error: workbenchError.message };
  }

  revalidatePath("/dashboard");
  // Kembalikan ID proyek agar bisa redirect
  return { success: true, error: null, projectId: newProjectId };
}

// Fungsi untuk mengenerate ide dengan AI
export async function generateIdea(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to add an idea." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tags = ["New"];

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    title: title,
    description: description,
    tags: tags,
    is_starred: false,
    last_activity: new Date().toISOString(),
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, error: null };
}

// Fungsi untuk mengupdate Ide
export async function updateIdea(formData: FormData) {
  const cookie = cookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to edit an idea." };
  }
  const id = formData.get("id") as string;
}

/**
 * Menghapus sebuah ide berdasarkan ID.
 */
export async function deleteIdea(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const { error: workbenchError } = await supabase
      .from("workbench_content")
      .delete()
      .match({ project_id: projectId });

    if (workbenchError) {
      if (workbenchError.code !== "PGRST116") {
        throw new Error(
          `Failed to delete workbench content: ${workbenchError.message}`
        );
      }
    }

    const { error: versionsError } = await supabase
      .from("blueprint_versions")
      .delete()
      .match({ project_id: projectId });

    if (versionsError) {
      if (versionsError.code !== "PGRST116") {
        throw new Error(
          `Failed to delete blueprint versions: ${versionsError.message}`
        );
      }
    }

    const { error: projectError } = await supabase
      .from("projects")
      .delete()
      .match({ id: projectId, user_id: user.id });

    if (projectError) {
      throw new Error(`Failed to delete the project: ${projectError.message}`);
    }

    revalidatePath("/dashboard");
  } catch (error: any) {
    console.error("Failed during delete transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, error: null };
}

/**
 * (Untuk Nanti) Mengubah status favorit (star) sebuah ide.
 */
export async function toggleStar(id: string, currentState: boolean) {
  // const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };

  const { error } = await supabase
    .from("projects")
    .update({ is_starred: !currentState })
    .match({ id: id, user_id: user.id });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Memperbarui satu atau lebih field dari sebuah proyek.
 * Didesain untuk inline editing dari sidebar.
 * @param projectId - ID dari proyek yang akan diupdate.
 * @param fieldsToUpdate - Objek berisi field dan value baru.
 */
export async function updateProjectFields(
  projectId: string,
  fieldsToUpdate: { [key: string]: any }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // Validasi field yang boleh diubah untuk keamanan
  const allowedFields = [
    "problem_statement",
    "target_audience",
    "success_metrics",
    "tech_stack",
  ];

  const sanitizedFields: { [key: string]: any } = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(fieldsToUpdate, field)) {
      sanitizedFields[field] = fieldsToUpdate[field];
    }
  }

  if (Object.keys(sanitizedFields).length === 0) {
    return { success: false, error: "No valid fields to update." };
  }

  const { error } = await supabase
    .from("projects")
    .update(sanitizedFields)
    .match({ id: projectId, user_id: user.id });

  if (error) {
    console.error("Supabase update error:", error);
    return { success: false, error: error.message };
  }

  // ⛔️ HAPUS BARIS INI: revalidatePath(`/idea/${projectId}`);
  return { success: true };
}
