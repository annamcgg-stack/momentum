import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/welcome", "/login", "/signup"];
const SETUP_ROUTE = "/setup";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // If env is missing, keep public pages accessible and guard protected pages.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isPublicRoute) return NextResponse.redirect(new URL("/welcome", req.url));
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>,
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options as any);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const onboardingComplete = Boolean(user?.user_metadata?.onboarding_complete);
  const isSetupRoute = pathname.startsWith(SETUP_ROUTE);

  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return res;
  }

  // Protected routes: everything else in this MVP.
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }

  // Keep first-run setup as a guided flow.
  if (!onboardingComplete && !isSetupRoute) {
    return NextResponse.redirect(new URL(SETUP_ROUTE, req.url));
  }
  if (onboardingComplete && isSetupRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Apply to all routes except:
     *  - Next.js internals
     *  - static files
     *  - favicon/robots
     *  - auth routes handled above
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

