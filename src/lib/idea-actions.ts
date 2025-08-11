"use server";

import { revalidatePath } from "next/cache";
import createClient from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function addIdea(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to add an idea.",
    };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  // Default tags, bisa dikembangkan nanti
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
    console.error("Supabase error:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  // Revalidate path untuk refresh data di dashboard
  revalidatePath("/dashboard");

  return {
    success: true,
    error: null,
  };
}
