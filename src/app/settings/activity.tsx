"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * 設定画面の中で「最後に操作が起きた番号」を共有する。
 * 各フォームは自分が送信したときの番号を覚えておき、
 * ほかの操作（入力・別の行の修正や削除など）で番号が進んだら古いエラーを隠す。
 */
const ActivityContext = createContext<{
  activity: number;
  bump: () => number;
} | null>(null);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const counter = useRef(0);
  const [activity, setActivity] = useState(0);
  const bump = useCallback(() => {
    counter.current += 1;
    setActivity(counter.current);
    return counter.current;
  }, []);

  return (
    <ActivityContext.Provider value={{ activity, bump }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity は ActivityProvider の中で使う");
  const { activity, bump } = ctx;
  const [mine, setMine] = useState<number | null>(null);

  return {
    // 自分のフォームを送信するときに呼ぶ
    claim: () => setMine(bump()),
    // 送信以外の操作（入力・ボタン操作）で呼ぶ。ほかのエラーが消える
    touch: () => {
      bump();
    },
    // 自分の送信がいちばん新しい操作なら true（エラーを表示してよい）
    isLatest: mine !== null && mine === activity,
  };
}
