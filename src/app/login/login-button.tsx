"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // 成功時は Google の画面へ移動するので、ここに来るのは失敗時だけ
    if (error) {
      setError("ログインを開始できませんでした。もう一度お試しください");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 font-medium shadow-sm hover:bg-zinc-50 disabled:opacity-60"
      >
        {loading ? "移動しています…" : "Googleでログイン"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
