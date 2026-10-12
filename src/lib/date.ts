/**
 * 日本時間の「今日」を YYYY-MM-DD で返す。
 * Vercel のサーバーは UTC で動くため、タイムゾーンを明示しないと
 * 日本時間の 0〜9 時に前日の日付になってしまう。
 */
export function todayInTokyo(): string {
  // sv-SE ロケールは YYYY-MM-DD 形式で日付を出力する
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** YYYY-MM-DD 形式で、実在する日付なら true */
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}
