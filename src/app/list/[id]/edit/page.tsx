import Link from "next/link";
import { ActivityProvider } from "@/components/activity";
import { todayInTokyo } from "@/lib/date";
import { formatDayWithWeekday, formatYen } from "@/lib/format";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { deleteExpense, updateExpense } from "@/app/_expenses/actions";
import { ExpenseForm } from "@/app/_expenses/expense-form";
import { DeleteButton } from "./delete-button";

export default async function EditExpensePage({
  params,
}: PageProps<"/list/[id]/edit">) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  // 番号の形が正しくない場合も DB がエラーを返すので、見つからないときと同じ扱いにする
  const [{ data: expense }, { data: members }] = await Promise.all([
    supabase
      .from("medical_expenses")
      .select("id, family_member_id, paid_on, payee, amount, reimbursement")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("family_members")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  if (!expense) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-4">
        <h1 className="text-xl font-semibold">記録の編集</h1>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <p>記録が見つかりませんでした。すでに削除されている可能性があります。</p>
          <Link
            href="/list"
            className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white"
          >
            一覧へ戻る
          </Link>
        </div>
      </main>
    );
  }

  const listHref = `/list?year=${expense.paid_on.slice(0, 4)}`;
  const summary = `${formatDayWithWeekday(expense.paid_on)}　${expense.payee}　${formatYen(expense.amount)}`;

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <Link href={listHref} className="text-sm text-zinc-600 underline">
        ← 一覧へ戻る
      </Link>
      <h1 className="mt-3 text-xl font-semibold">記録の編集</h1>

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <ActivityProvider>
          <ExpenseForm
            members={members ?? []}
            today={todayInTokyo()}
            initialValues={{
              family_member_id: expense.family_member_id,
              paid_on: expense.paid_on,
              payee: expense.payee,
              amount: String(expense.amount),
              reimbursement: expense.reimbursement ? String(expense.reimbursement) : "",
            }}
            action={updateExpense.bind(null, expense.id)}
            submitLabel="保存する"
          />
        </ActivityProvider>
      </section>

      <section className="mt-8">
        <DeleteButton action={deleteExpense.bind(null, expense.id)} summary={summary} />
      </section>
    </main>
  );
}
