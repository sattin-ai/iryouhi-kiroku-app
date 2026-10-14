import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "ページが見つかりません" };

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
        <h1 className="text-base font-semibold">ページが見つかりません</h1>
        <p className="text-zinc-700">URL が間違っているか、ページが移動した可能性があります。</p>
        <Link
          href="/"
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white"
        >
          入力画面へ
        </Link>
      </div>
    </main>
  );
}
