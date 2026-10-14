import type { Metadata } from "next";
import { LoginButton } from "./login-button";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">医療費記録アプリ</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Googleアカウントでログインしてください
        </p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            ログインに失敗しました。もう一度お試しください。
          </p>
        )}
        <div className="mt-6">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
