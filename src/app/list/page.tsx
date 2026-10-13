import Link from "next/link";
import { todayInTokyo } from "@/lib/date";
import { formatDayWithWeekday, formatMonthHeading, formatYen } from "@/lib/format";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  paid_on: string;
  payee: string;
  amount: number;
  memberName: string;
};

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
  const years = [...new Set([thisYear, ...rows.map((r) => r.paid_on.slice(0, 4))])]
    .sort()
    .reverse();
  const { year: yearParam } = await searchParams;
  const selectedYear =
    typeof yearParam === "string" && years.includes(yearParam) ? yearParam : thisYear;

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
      <Link href="/" className="text-sm text-zinc-600 underline">
        ← 入力へ戻る
      </Link>
      <h1 className="mt-3 text-xl font-semibold">一覧表</h1>

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
          <nav aria-label="年の切り替え" className="mt-4 flex flex-wrap gap-2">
            {years.map((y) => (
              <Link
                key={y}
                href={`/list?year=${y}`}
                aria-current={y === selectedYear ? "page" : undefined}
                className={
                  y === selectedYear
                    ? "rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-white"
                    : "rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm"
                }
              >
                {y}年
              </Link>
            ))}
          </nav>

          {months.size === 0 ? (
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-sm">
              {selectedYear}年の記録はありません。
            </p>
          ) : (
            [...months].map(([month, items]) => (
              <section key={month} className="mt-6">
                <h2 className="text-base font-semibold">{formatMonthHeading(month)}</h2>
                <div className="mt-2 overflow-x-auto rounded-2xl bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-zinc-500">
                      <tr className="border-b border-zinc-200">
                        <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap">日付</th>
                        <th scope="col" className="px-3 py-2 font-medium">支払先</th>
                        <th scope="col" className="px-3 py-2 text-right font-medium whitespace-nowrap">金額</th>
                        <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap">医療を受けた人</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {items.map((r) => (
                        <tr key={r.id}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {formatDayWithWeekday(r.paid_on)}
                          </td>
                          <td className="px-3 py-2 break-words">{r.payee}</td>
                          <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                            {formatYen(r.amount)}
                          </td>
                          <td className="px-3 py-2">{r.memberName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
          )}
        </>
      )}
    </main>
  );
}
