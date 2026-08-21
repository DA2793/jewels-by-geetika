import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_EMAILS } from "@/lib/admin-emails";

// Server-side gate for the admin dashboard.
// The client-side check in the page remains for UX, but this is the real gate.
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const email = data?.user?.email || "";

  if (!data?.user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
