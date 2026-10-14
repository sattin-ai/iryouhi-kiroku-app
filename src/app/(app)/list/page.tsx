import type { Metadata } from "next";
import Link from "next/link";
import { YearTabs } from "@/components/year-tabs";
import { todayInTokyo } from "@/lib/date";
import { selectYear, yearOptions } from "@/lib/years";
import { formatMonthHeading } from "@/lib/format";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { MonthTable, type ListRow as Row } from "./month-table";

export const metadata: Metadata = { title: "一覧表" };

export default async function ListPage({ searchParams }: PageProps<"/list">) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medical_expenses")
    .select("id, paid_on, payee, amount, family_members(name)")
    .eq("user_id", user.id)
    .order("paid_on", { ascending: true })
    .order("created_at", { ascending: true });

  const rows: Row[] = (data ?? []).map((r) => {
    // 外部キーをたどった結果は、型の上では配列の場合もあるので両方に対応する
    const member = Array.isArray(r.family_members)
      ? r.family_members[0]
      : r.family_members;
    return {
      id: r.id,
      paid_on: r.paid_on,
      payee: r.payee,
      amount: r.amount,
      memberName: member?.name ?? "",
    };
  });

  // 年の切り替え：記録がある年と今年を、新しい順に並べる
  const thisYear = todayInTokyo().slice(0, 4);
  const years = yearOptions(rows.map((r) => r.paid_on), thisYear);
  const { year: yearParam } = await searchParams;
  const selectedYear = selectYear(yearParam, years, thisYear);

  // 選んだ年の記録を月ごとにまとめる（rows は日付の古い順に並んでいる）
  const months = new Map<string, Row[]>();
  for (const row of rows) {
    if (!row.paid_on.startsWith(selectedYear)) continue;
    const key = row.paid_on.slice(0, 7);
    const list = months.get(key) ?? [];
    list.push(row);
    months.set(key, list);
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <h1 className="text-xl font-semibold">一覧表</h1>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          読み込めませんでした。ページを再読み込みしてください。
        </p>
      ) : rows.length === 0 ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <p>まだ記録がありません。</p>
          <Link
            href="/"
            className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white"
          >
            記録する
          </Link>
        </div>
      ) : (
        <>
          <YearTabs years={years} selected={selectedYear} basePath="/list" />

          {months.size === 0 ? (
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-sm">
              {selectedYear}年の記録はありません。
            </p>
          ) : (
            [...months].map(([month, items]) => (
              <section key={month} className="mt-6">
                <h2 className="text-base font-semibold">{formatMonthHeading(month)}</h2>
                <div className="mt-2">
                  <MonthTable rows={items} />
                </div>
              </section>
            ))
          )}
        </>
      )}
    </main>
  );
}
