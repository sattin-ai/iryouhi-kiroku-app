"use client"; // エラー画面はブラウザで動く部品にする決まり

import { useEffect } from "react";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
        <h1 className="text-base font-semibold">うまく表示できませんでした</h1>
        <p className="mt-2 text-zinc-700">
          通信の状態を確かめて、もう一度読み込んでください。
        </p>
        <p className="mt-2 text-zinc-700">
          しばらく使っていなかった場合は、データベース（Supabase）が一時停止していることがあります。Supabase の管理画面で再開してから、もう一度お試しください。
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white"
        >
          もう一度読み込む
        </button>
      </div>
    </main>
  );
}
