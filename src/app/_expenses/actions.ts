"use server";

import { revalidatePath } from "next/cache";
import { todayInTokyo } from "@/lib/date";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import {
  parseExpenseForm,
  readExpenseValues,
  type ExpenseErrors,
  type ExpenseFormState,
  type ExpenseValues,
} from "./validation";

export async function createExpense(
  _prev: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const user = await requireUser();
  const values = readExpenseValues(formData);
  const fail = (errors: ExpenseErrors): ExpenseFormState => ({
    errors,
    values,
    key: Date.now(),
  });

  const parsed = parseExpenseForm(values, todayInTokyo());
  if (!parsed.ok) return fail(parsed.errors);
  const input = parsed.data;

  const supabase = await createClient();

  // RLS は user_id しか確かめず、外部キーの確認は RLS を通らない。
  // 他人の家族の ID を送られても保存できてしまうため、ここで自分の家族か確認する。
  const { data: member } = await supabase
    .from("family_members")
    .select("id")
    .eq("id", input.family_member_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) {
    return fail({ family_member_id: "医療を受けた人を選び直してください" });
  }

  const { error } = await supabase
    .from("medical_expenses")
    .insert({ ...input, user_id: user.id });
  if (error) {
    return fail({ form: "記録できませんでした。もう一度お試しください" });
  }

  revalidatePath("/");
  const empty: ExpenseValues = {
    family_member_id: "",
    paid_on: todayInTokyo(),
    payee: "",
    amount: "",
    reimbursement: "",
  };
  return { ok: true, values: empty, key: Date.now() };
}
