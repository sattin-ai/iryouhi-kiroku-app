import Link from "next/link";
import { requireUser } from "@/lib/supabase/dal";
import { signOut } from "@/app/actions/auth";

export default async function Home() {
  const user = await requireUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">医療費記録アプリ</h1>
      <p className="text-zinc-600">{user.email} でログイン中</p>
      <p className="text-sm text-zinc-500">（入力画面は STEP 3 で作ります）</p>
      <Link href="/settings" className="text-sm underline">
        設定（家族の登録）
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
        >
          ログアウト
        </button>
      </form>
    </main>
  );
}
