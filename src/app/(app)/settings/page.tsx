import type { Metadata } from "next";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { ActivityProvider } from "@/components/activity";
import { signOut } from "@/app/actions/auth";
import { AddForm } from "./add-form";
import { MemberRow } from "./member-row";

export const metadata: Metadata = { title: "設定" };

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("family_members")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <h1 className="text-xl font-semibold">設定</h1>

      <h2 className="mt-4 font-semibold">家族の登録</h2>
      <p className="mt-1 text-sm text-zinc-600">
        記録するときに「医療を受けた人」として選べる名前です。
      </p>

      <ActivityProvider>
        <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <AddForm />
        </section>

        <section className="mt-4 rounded-2xl bg-white px-4 shadow-sm">
          {error ? (
            <p className="py-4 text-sm text-red-600">
              読み込めませんでした。ページを再読み込みしてください。
            </p>
          ) : members.length === 0 ? (
            <p className="py-4 text-sm text-zinc-600">
              まだ登録されていません。上の欄から追加してください。
            </p>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {members.map((m) => (
                <MemberRow key={m.id} id={m.id} name={m.name} />
              ))}
            </ul>
          )}
        </section>
      </ActivityProvider>

      <section className="mt-10 border-t border-zinc-200 pt-4">
        <h2 className="font-semibold">アカウント</h2>
        <p className="mt-1 text-sm text-zinc-600">{user.email} でログインしています。</p>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm"
          >
            ログアウト
          </button>
        </form>
      </section>
    </main>
  );
}
