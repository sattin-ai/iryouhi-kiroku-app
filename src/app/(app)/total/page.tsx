import type { Metadata } from "next";
import Link from "next/link";
import { YearTabs } from "@/components/year-tabs";
import { todayInTokyo } from "@/lib/date";
import { formatYen } from "@/lib/format";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { summarizeExpenses } from "@/lib/totals";
import { selectYear, yearOptions } from "@/lib/years";

export const metadata: Metadata = { title: "年間合計" };

export default async function TotalPage({ searchParams }: PageProps<"/total">) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medical_expenses")
    .select("paid_on, amount, reimbursement")
    .eq("user_id", user.id);

  const records = data ?? [];
  const thisYear = todayInTokyo().slice(0, 4);
  const years = yearOptions(records.map((r) => r.paid_on), thisYear);
  const { year: yearParam } = await searchParams;
  const selectedYear = selectYear(yearParam, years, thisYear);

  const summary = summarizeExpenses(
    records.filter((r) => r.paid_on.startsWith(selectedYear)),
  );
  const excess = summary.received - summary.deducted;

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <h1 className="text-xl font-semibold">年間合計</h1>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          読み込めませんでした。ページを再読み込みしてください。
        </p>
      ) : records.length === 0 ? (
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
          <YearTabs years={years} selected={selectedYear} basePath="/total" />

          <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-semibold">{selectedYear}年（家族全員分）</h2>
              <p className="text-xs text-zinc-500">{summary.count}件の記録</p>
            </div>

            <dl className="mt-4 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-sm text-zinc-600">支払った合計</dt>
                <dd className="text-lg tabular-nums">{formatYen(summary.paid)}</dd>
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-sm text-zinc-600">補填の合計</dt>
                  <dd className="text-lg tabular-nums">{formatYen(summary.deducted)}</dd>
                </div>
                {excess > 0 && (
                  <p className="mt-1 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
                    実際に受け取った補填の合計は {formatYen(summary.received)} です。
                    支払った金額を超えた {formatYen(excess)} は差し引いていません。
                  </p>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-2 border-t border-zinc-200 pt-3">
                <dt className="font-medium">差し引いた金額</dt>
                <dd className="text-2xl font-bold tabular-nums">{formatYen(summary.net)}</dd>
              </div>
            </dl>

            {summary.count === 0 && (
              <p className="mt-4 text-sm text-zinc-600">この年の記録はありません。</p>
            )}
          </section>

          <Link
            href={`/list?year=${selectedYear}`}
            className="mt-4 inline-block text-sm underline"
          >
            この年の一覧を見る
          </Link>
        </>
      )}
    </main>
  );
}
