import { AppNav } from "@/components/app-nav";

/**
 * ログイン後の画面（入力・一覧・合計・設定・編集）に共通の枠。
 * (app) のように丸かっこで囲んだフォルダは URL に含まれない。
 * ログインの確認は、各ページと Server Action の requireUser() で行う（ここでは行わない）。
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
