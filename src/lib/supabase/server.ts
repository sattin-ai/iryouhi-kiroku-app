import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component / Server Action / Route Handler で使う Supabase クライアント。
 * cookies() が読み取り専用の場所（Server Component）から呼ばれた場合、
 * setAll は失敗する可能性があるが、middleware がセッションを更新するため無視してよい。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component から呼ばれた場合はここで無視する。
            // セッションの更新は middleware が担う。
          }
        },
      },
    },
  );
}
