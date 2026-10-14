"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * 「医療を受けた人」が自分の家族か確かめる。
 * RLS は user_id しか確かめず、外部キーの確認は RLS を通らない。
 * 他人の家族の ID を送られても保存できてしまうため、書き込む前に必ず呼ぶ。
 */
async function isOwnFamilyMember(
  supabase: SupabaseClient,
  userId: string,
  familyMemberId: string,
) {
  const { data } = await supabase
    .from("family_members")
    .select("id")
    .eq("id", familyMemberId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

/** 記録を表示している画面をすべて最新にする */
function revalidateExpensePages() {
  revalidatePath("/");
  revalidatePath("/list");
  revalidatePath("/total");
}

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
  if (!(await isOwnFamilyMember(supabase, user.id, input.family_member_id))) {
    return fail({ family_member_id: "医療を受けた人を選び直してください" });
  }

  const { error } = await supabase
    .from("medical_expenses")
    .insert({ ...input, user_id: user.id });
  if (error) {
    return fail({ form: "記録できませんでした。もう一度お試しください" });
  }

  revalidateExpensePages();
  const empty: ExpenseValues = {
    family_member_id: "",
    paid_on: todayInTokyo(),
    payee: "",
    amount: "",
    reimbursement: "",
  };
  return { ok: true, values: empty, key: Date.now() };
}

/**
 * 記録を修正する。id は画面側で updateExpense.bind(null, id) として結び付ける。
 * 保存できたら、その記録の年の一覧に戻る。
 */
export async function updateExpense(
  id: string,
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
  if (!(await isOwnFamilyMember(supabase, user.id, input.family_member_id))) {
    return fail({ family_member_id: "医療を受けた人を選び直してください" });
  }

  const { data, error } = await supabase
    .from("medical_expenses")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error) {
    return fail({ form: "保存できませんでした。もう一度お試しください" });
  }
  if (!data?.length) {
    return fail({ form: "この記録は見つかりませんでした。一覧から開き直してください" });
  }

  revalidateExpensePages();
  // redirect は内部でエラーを投げて画面を移動させるため、try の外で呼ぶ
  redirect(`/list?year=${input.paid_on.slice(0, 4)}`);
}

export type DeleteState = { error?: string };

/**
 * 記録を削除する。id は画面側で deleteExpense.bind(null, id) として結び付ける。
 * 削除できたら、その記録の年の一覧に戻る。
 */
export async function deleteExpense(id: string): Promise<DeleteState> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("medical_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("paid_on");
  if (error) {
    return { error: "削除できませんでした。もう一度お試しください" };
  }
  if (!data?.length) {
    return { error: "この記録は見つかりませんでした。すでに削除されている可能性があります" };
  }

  revalidateExpensePages();
  redirect(`/list?year=${String(data[0].paid_on).slice(0, 4)}`);
}
