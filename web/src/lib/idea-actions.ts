"use server";

import { revalidatePath } from "next/cache";
import createClient from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Fungsi untuk menambah ide (sudah ada)
export async function addIdea(formData: FormData) {
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
export async function deleteIdea(id: string) {
  // const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };

  const { error } = await supabase
    .from("projects")
    .delete()
    .match({ id: id, user_id: user.id });
  if (error) {
    console.error("Supabase delete error:", error);
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
