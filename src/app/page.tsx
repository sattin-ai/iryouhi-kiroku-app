import Link from "next/link";
import { ActivityProvider } from "@/components/activity";
import { todayInTokyo } from "@/lib/date";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { createExpense } from "./_expenses/actions";
import { ExpenseForm } from "./_expenses/expense-form";

export default async function Home() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("family_members")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const today = todayInTokyo();

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">領収書の入力</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/list" className="underline">
            一覧
          </Link>
          <Link href="/total" className="underline">
            合計
          </Link>
          <Link href="/settings" className="underline">
            設定
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-zinc-600 underline">
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        {error ? (
          <p className="text-sm text-red-600">
            読み込めませんでした。ページを再読み込みしてください。
          </p>
        ) : members.length === 0 ? (
          <div className="flex flex-col gap-3 text-sm">
            <p>
              記録を始める前に、医療を受けた人（家族）の名前を登録してください。
            </p>
            <Link
              href="/settings"
              className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white"
            >
              家族を登録する
            </Link>
          </div>
        ) : (
          <ActivityProvider>
            <ExpenseForm
              members={members}
              today={today}
              initialValues={{
                family_member_id: "",
                paid_on: today,
                payee: "",
                amount: "",
                reimbursement: "",
              }}
              action={createExpense}
              submitLabel="記録する"
              successMessage="記録しました"
            />
          </ActivityProvider>
        )}
      </section>
    </main>
  );
}
