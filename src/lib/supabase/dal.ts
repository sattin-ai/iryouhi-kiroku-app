import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

/**
 * ログイン中のユーザーを返す。未ログインなら /login へリダイレクトする。
 * proxy.ts のチェックに加え、データを扱うページ・Server Action では必ずこれを通す。
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
});
