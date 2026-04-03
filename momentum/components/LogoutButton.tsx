"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/browserClient";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error("Supabase is not configured.");
        await supabase.auth.signOut();
        router.replace("/login");
      }}
      className={`rounded-xl border border-accent-muted/60 bg-white/70 px-3 py-2 text-xs font-medium text-ink hover:bg-white disabled:opacity-60 ${className ?? ""}`}
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}

