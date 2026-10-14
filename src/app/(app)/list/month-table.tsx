import Link from "next/link";
import { formatDayOfMonth, formatYen } from "@/lib/format";

export type ListRow = {
  id: string;
  paid_on: string;
  payee: string;
  amount: number;
  memberName: string;
};

/**
 * 1か月分の表。
 * table-fixed と colgroup で列の幅を割合で決めているので、
 * どの月の表でも列の位置がそろう（中身の長さで幅が変わらない）。
 * 幅はスマホ幅（約400px）で、6文字程度の支払先が1行に収まるように決めている。
 */
export function MonthTable({ rows }: { rows: ListRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full table-fixed text-[13px]">
        <colgroup>
          <col className="w-[17%]" />
          <col />
          <col className="w-[22%]" />
          <col className="w-[18%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead className="text-left text-xs text-zinc-500">
          <tr className="border-b border-zinc-200">
            <th scope="col" className="px-1.5 py-2 align-bottom font-medium">日付</th>
            <th scope="col" className="px-1.5 py-2 align-bottom font-medium">支払先</th>
            <th scope="col" className="px-1.5 py-2 text-right align-bottom font-medium">金額</th>
            <th scope="col" className="px-1.5 py-2 align-bottom leading-tight font-medium">
              {/* 狭い列に収まらないため、どの月でも同じ位置で2行に分ける */}
              医療を
              <br />
              受けた人
            </th>
            <th scope="col" className="px-1 py-2">
              <span className="sr-only">修正</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-1.5 py-2 whitespace-nowrap">{formatDayOfMonth(r.paid_on)}</td>
              <td className="px-1.5 py-2 break-keep wrap-anywhere">{r.payee}</td>
              <td className="px-1.5 py-2 text-right whitespace-nowrap tabular-nums">
                {formatYen(r.amount)}
              </td>
              <td className="px-1.5 py-2 break-keep wrap-anywhere">{r.memberName}</td>
              <td className="px-1 py-2 text-right">
                <Link
                  href={`/list/${r.id}/edit`}
                  className="inline-block rounded-md border border-zinc-300 px-1.5 py-1 text-xs whitespace-nowrap"
                >
                  修正
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
