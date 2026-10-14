"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "入力" },
  { href: "/list", label: "一覧" },
  { href: "/total", label: "合計" },
  { href: "/settings", label: "設定" },
];

function isCurrent(pathname: string, href: string) {
  // 編集画面（/list/[id]/edit）を開いているときは「一覧」を選択中にする
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** 入力・一覧・合計・設定の4画面に共通のメニュー */
export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav aria-label="メニュー" className="mx-auto flex w-full max-w-md">
        {ITEMS.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={
                current
                  ? "flex-1 border-b-2 border-zinc-900 py-3 text-center text-sm font-semibold text-zinc-900"
                  : "flex-1 border-b-2 border-transparent py-3 text-center text-sm text-zinc-500"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
