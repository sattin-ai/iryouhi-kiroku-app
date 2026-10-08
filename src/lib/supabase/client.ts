import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ（Client Component）側で使う Supabase クライアント。
 * 呼び出すたびに生成するが、内部でシングルトン的に扱われる。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
