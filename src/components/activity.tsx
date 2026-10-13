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
 * 画面の中で「最後に操作が起きた番号」を共有する。
 * 各フォームは自分が送信したときの番号を覚えておき、
 * ほかの操作（入力・別の行の修正や削除など）で番号が進んだら古いメッセージを隠す。
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

/**
 * @param state そのフォームの useActionState の結果。
 *   送信した時点の結果を覚えておき、サーバーから新しい結果が届くまではメッセージを出さない。
 *   （送信中に前回のエラーが一瞬表示されるのを防ぐため）
 */
export function useActivity<S>(state: S) {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity は ActivityProvider の中で使う");
  const { activity, bump } = ctx;
  const [mine, setMine] = useState<{ token: number; stale: S } | null>(null);

  return {
    // 自分のフォームを送信するときに呼ぶ
    claim: () => setMine({ token: bump(), stale: state }),
    // 送信以外の操作（入力・ボタン操作）で呼ぶ。ほかのメッセージが消える
    touch: () => {
      bump();
    },
    // 自分の送信がいちばん新しい操作で、その返事が届いていれば true（メッセージを表示してよい）
    isLatest: mine !== null && mine.token === activity && mine.stale !== state,
  };
}
