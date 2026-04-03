import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client for client components.
 * Uses auth cookies to keep sessions cross-device.
 */
let client:
  | ReturnType<typeof createBrowserClient>
  | null = null;

function env() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/**
 * Lazily create the Supabase client.
 * Returns null when env vars are missing (so `next build` still works).
 */
export function getSupabaseClient() {
  if (client) return client;
  const { url, anonKey } = env();
  if (!url || !anonKey) return null;
  client = createBrowserClient(url, anonKey);
  return client;
}


