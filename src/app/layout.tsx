import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "医療費記録アプリ",
  description: "確定申告のための医療費記録アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  );
}
