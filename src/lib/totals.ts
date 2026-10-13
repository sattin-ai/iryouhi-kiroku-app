export type ExpenseAmounts = {
  amount: number;
  reimbursement: number;
};

export type ExpenseSummary = {
  /** 記録の件数 */
  count: number;
  /** 支払った合計 */
  paid: number;
  /** 実際に受け取った補填の合計（補填金額をそのまま足したもの） */
  received: number;
  /** 差し引きに使う補填の合計（1件ごとに支払った金額を上限にしたもの） */
  deducted: number;
  /** 差し引いた金額 ＝ paid − deducted（マイナスにはならない） */
  net: number;
};

/**
 * 記録をまとめて合計する。
 * 確定申告のルールでは、補填金額はその医療費の分までしか差し引かず、
 * 超えた分をほかの医療費から差し引くことはない。
 * そのため記録1件ごとに「補填金額」と「支払った金額」の小さいほうを使う。
 */
export function summarizeExpenses(records: ExpenseAmounts[]): ExpenseSummary {
  let paid = 0;
  let received = 0;
  let deducted = 0;
  for (const r of records) {
    paid += r.amount;
    received += r.reimbursement;
    deducted += Math.min(r.reimbursement, r.amount);
  }
  return { count: records.length, paid, received, deducted, net: paid - deducted };
}
