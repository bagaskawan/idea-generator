// src/middleware.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Membuat response awal yang akan diteruskan
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Membuat klien Supabase di lingkungan middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Jika set cookie dipanggil, perbarui request dan response cookies
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Jika remove cookie dipanggil, hapus dari request dan response
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  // Daftar rute yang dapat diakses tanpa login
  const publicRoutes = ["/", "/login", "/auth/callback"];

  // Cek apakah rute saat ini adalah rute yang dilindungi
  const isProtectedRoute = !publicRoutes.includes(pathname);

  // Jika pengguna belum login dan mencoba mengakses rute yang dilindungi
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika pengguna sudah login dan mencoba mengakses halaman login
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali untuk:
     * - rute API
     * - _next/static (file statis)
     * - _next/image (file optimasi gambar)
     * - favicon.ico (file favicon)
     * - Semua file di dalam /public dengan ekstensi (misalnya .svg, .png, .jpg)
     */
    "/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)",
  ],
};
