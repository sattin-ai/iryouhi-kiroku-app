import { isValidDateString } from "@/lib/date";

export const EXPENSE_FIELDS = [
  "family_member_id",
  "paid_on",
  "payee",
  "amount",
  "reimbursement",
] as const;

export type ExpenseField = (typeof EXPENSE_FIELDS)[number];

// 入力された文字列そのもの（エラー時にフォームへ戻すため）
export type ExpenseValues = Record<ExpenseField, string>;

// 項目ごとのエラーと、項目に属さないエラー（保存失敗など）
export type ExpenseErrors = Partial<Record<ExpenseField | "form", string>>;

export type ExpenseFormState = {
  ok?: boolean;
  errors?: ExpenseErrors;
  values?: ExpenseValues;
  // 送信のたびに変わる値。入力欄を作り直して values を反映させるために使う
  key?: number;
};

export type ExpenseInput = {
  family_member_id: string;
  paid_on: string;
  payee: string;
  amount: number;
  reimbursement: number;
};

export const MAX_PAYEE_LENGTH = 50;
export const MAX_YEN = 10_000_000;

/** 全角数字を半角に直し、カンマと空白を取り除く */
function normalizeNumber(raw: string): string {
  return raw
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[,，\s]/g, "");
}

/** 整数の円として読む。数字でなければ null */
function parseYen(raw: string): number | null {
  const s = normalizeNumber(raw);
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

export function readExpenseValues(formData: FormData): ExpenseValues {
  const values = {} as ExpenseValues;
  for (const field of EXPENSE_FIELDS) {
    values[field] = String(formData.get(field) ?? "");
  }
  return values;
}

/**
 * フォームの値をチェックして、保存できる形に整える。
 * 「医療を受けた人」が自分の家族かどうかは DB を見ないと分からないため、
 * 呼び出し側（Server Action）で確認する。
 */
export function parseExpenseForm(
  values: ExpenseValues,
  today: string,
): { ok: true; data: ExpenseInput } | { ok: false; errors: ExpenseErrors } {
  const errors: ExpenseErrors = {};

  const familyMemberId = values.family_member_id.trim();
  if (!familyMemberId) errors.family_member_id = "医療を受けた人を選んでください";

  const paidOn = values.paid_on.trim();
  if (!paidOn) {
    errors.paid_on = "日付を入力してください";
  } else if (!isValidDateString(paidOn)) {
    errors.paid_on = "日付が正しくありません";
  } else if (paidOn > today) {
    // YYYY-MM-DD 同士は文字列のまま大小を比べられる
    errors.paid_on = "未来の日付は選べません";
  }

  const payee = values.payee.trim();
  if (!payee) {
    errors.payee = "支払先を入力してください";
  } else if (payee.length > MAX_PAYEE_LENGTH) {
    errors.payee = `支払先は${MAX_PAYEE_LENGTH}文字以内で入力してください`;
  }

  let amount: number | null = null;
  if (!values.amount.trim()) {
    errors.amount = "金額を入力してください";
  } else {
    amount = parseYen(values.amount);
    if (amount === null) {
      errors.amount = "金額は数字で入力してください";
    } else if (amount < 1) {
      errors.amount = "金額は1円以上で入力してください";
    } else if (amount > MAX_YEN) {
      errors.amount = "金額は1,000万円以下で入力してください";
    }
  }

  let reimbursement = 0;
  if (values.reimbursement.trim()) {
    const parsed = parseYen(values.reimbursement);
    if (parsed === null) {
      errors.reimbursement = "補填金額は数字で入力してください";
    } else if (parsed > MAX_YEN) {
      errors.reimbursement = "補填金額は1,000万円以下で入力してください";
    } else {
      // 支払った金額より大きくてもよい（入院給付金など）。
      // 差し引くのはその医療費の分までなので、合計の計算（src/lib/totals.ts）で上限をかける

      reimbursement = parsed;
    }
  }

  if (Object.keys(errors).length > 0 || amount === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      family_member_id: familyMemberId,
      paid_on: paidOn,
      payee,
      amount,
      reimbursement,
    },
  };
}
