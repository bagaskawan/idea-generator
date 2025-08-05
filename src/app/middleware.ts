// app/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  // Jika user belum login dan mencoba akses route terproteksi
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika user sudah login dan mencoba akses halaman auth (login/register)
  if (session && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/profile/setup", "/login"],
};
