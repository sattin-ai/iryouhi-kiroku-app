"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";

export type FormState = {
  ok?: boolean;
  error?: string;
  // エラー時に入力内容を残すための値と、入力欄を作り直すためのキー
  value?: string;
  key?: number;
};

const MAX_NAME_LENGTH = 30;

// Postgres の外部キー違反（記録で使われている家族を削除しようとした）
const FOREIGN_KEY_VIOLATION = "23503";

function validateName(raw: string): string | { error: string } {
  const name = raw.trim();
  if (!name) return { error: "名前を入力してください" };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `名前は${MAX_NAME_LENGTH}文字以内で入力してください` };
  }
  return name;
}

async function isDuplicate(userId: string, name: string, excludeId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("family_members")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.limit(1);
  return Boolean(data?.length);
}

export async function addFamilyMember(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const raw = String(formData.get("name") ?? "");
  const fail = (error: string): FormState => ({ error, value: raw, key: Date.now() });

  const name = validateName(raw);
  if (typeof name !== "string") return fail(name.error);
  if (await isDuplicate(user.id, name)) {
    return fail("同じ名前がすでに登録されています");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("family_members")
    .insert({ user_id: user.id, name });
  if (error) return fail("追加できませんでした。もう一度お試しください");

  revalidatePath("/settings");
  return { ok: true, value: "", key: Date.now() };
}

export async function updateFamilyMember(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("name") ?? "");
  const fail = (error: string): FormState => ({ error, value: raw, key: Date.now() });

  const name = validateName(raw);
  if (typeof name !== "string") return fail(name.error);
  if (await isDuplicate(user.id, name, id)) {
    return fail("同じ名前がすでに登録されています");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("family_members")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return fail("保存できませんでした。もう一度お試しください");

  revalidatePath("/settings");
  return { ok: true };
}

export async function deleteFamilyMember(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    if (error.code === FOREIGN_KEY_VIOLATION) {
      return { error: "この名前は記録で使われているため削除できません" };
    }
    return { error: "削除できませんでした。もう一度お試しください" };
  }

  revalidatePath("/settings");
  return { ok: true };
}
