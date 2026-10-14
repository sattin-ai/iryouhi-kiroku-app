const yenFormatter = new Intl.NumberFormat("ja-JP");
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 1200 → "1,200円" */
export function formatYen(value: number): string {
  return `${yenFormatter.format(value)}円`;
}

/** "2026-10" → "2026年10月" */
export function formatMonthHeading(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  return `${y}年${m}月`;
}

/**
 * "2026-10-13" → "13（火）"
 * 一覧の表で使う。月は見出しに出ているので日だけにして、支払先の列を広くとる。
 */
export function formatDayOfMonth(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${d}（${weekday}）`;
}

/**
 * "2026-10-13" → "10/13（火）"
 * 曜日は Date.UTC で計算する。サーバーが UTC で動いていても日付がずれないようにするため。
 */
export function formatDayWithWeekday(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}/${d}（${weekday}）`;
}
