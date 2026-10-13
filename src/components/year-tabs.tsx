import Link from "next/link";

type Props = {
  years: string[];
  selected: string;
  /** リンク先のページ（"/list" や "/total"） */
  basePath: string;
};

/** 年の切り替えボタン。URL の ?year= で切り替える */
export function YearTabs({ years, selected, basePath }: Props) {
  return (
    <nav aria-label="年の切り替え" className="mt-4 flex flex-wrap gap-2">
      {years.map((y) => (
        <Link
          key={y}
          href={`${basePath}?year=${y}`}
          aria-current={y === selected ? "page" : undefined}
          className={
            y === selected
              ? "rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-white"
              : "rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm"
          }
        >
          {y}年
        </Link>
      ))}
    </nav>
  );
}
