import Link from "next/link";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { ActivityProvider } from "./activity";
import { AddForm } from "./add-form";
import { MemberRow } from "./member-row";

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
      <Link href="/" className="text-sm text-zinc-600 underline">
        ← トップへ戻る
      </Link>
      <h1 className="mt-3 text-xl font-semibold">設定（家族の登録）</h1>
      <p className="mt-1 text-sm text-zinc-600">
        記録するときに「医療を受けた人」として選べる名前です。
      </p>

      <ActivityProvider>
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
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
    </main>
  );
}
