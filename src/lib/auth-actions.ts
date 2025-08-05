"use server";

// import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import createClient from "@/utils/supabase/server";

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo:
        (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
        "/auth/callback",
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}

export async function signInWithGithub() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo:
        (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") +
        "/auth/callback",
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }
  redirect(data.url);
}
