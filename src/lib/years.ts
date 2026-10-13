/**
 * 年の切り替えボタンに出す年。記録がある年と今年を、新しい順に並べる。
 * @param dates 記録の日付（YYYY-MM-DD）
 * @param thisYear 今年（YYYY）
 */
export function yearOptions(dates: string[], thisYear: string): string[] {
  return [...new Set([thisYear, ...dates.map((d) => d.slice(0, 4))])]
    .sort()
    .reverse();
}

/**
 * URL の ?year= から表示する年を決める。
 * 選べる年に含まれていなければ今年にする。
 */
export function selectYear(
  param: string | string[] | undefined,
  options: string[],
  thisYear: string,
): string {
  return typeof param === "string" && options.includes(param) ? param : thisYear;
}
