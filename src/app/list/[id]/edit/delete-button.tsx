"use client";

import { useActionState, useRef } from "react";
import type { DeleteState } from "@/app/_expenses/actions";

type Props = {
  /** deleteExpense.bind(null, id) で記録の番号を結び付けた Server Action */
  action: (prev: DeleteState) => Promise<DeleteState>;
  /** 確認のポップアップに出す記録の内容（例：10/13（火） 〇〇クリニック 1,200円） */
  summary: string;
};

export function DeleteButton({ action, summary }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg border border-red-300 bg-white px-4 py-3 font-medium text-red-700 disabled:opacity-60"
      >
        {pending ? "削除中…" : "削除"}
      </button>
      {state.error && !pending && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      {/* ブラウザ標準の confirm は「OK」「キャンセル」になるため、「はい」「いいえ」の小窓を自作する */}
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        className="m-auto w-[min(90vw,22rem)] rounded-2xl p-5 shadow-lg backdrop:bg-black/40"
      >
        <h2 id="delete-dialog-title" className="font-semibold">
          この記録を削除しますか？
        </h2>
        <p className="mt-2 text-sm text-zinc-700">{summary}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            いいえ
          </button>
          <form
            action={formAction}
            onSubmit={(e) => {
              if (pending) {
                e.preventDefault();
                return;
              }
              dialogRef.current?.close();
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              はい
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
