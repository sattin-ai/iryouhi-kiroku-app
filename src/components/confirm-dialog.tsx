"use client";

import { useRef, type ReactNode } from "react";

type Props = {
  /** 小窓の見出し（例：この記録を削除しますか？） */
  title: string;
  /** 見出しの下に出す内容（例：対象の記録や名前） */
  detail?: string;
  /** 「はい」を押したときに送るフォームの処理（useActionState の dispatch） */
  action: (formData: FormData) => void;
  /** 処理中かどうか。処理中はボタンを押せなくする */
  pending: boolean;
  /** 小窓を開くボタンの文字と見た目 */
  triggerLabel: string;
  pendingLabel: string;
  triggerClassName: string;
  /** 「はい」を押した直後に呼ぶ（古いメッセージを隠すためなど） */
  onConfirm?: () => void;
  /** 「はい」のフォームに一緒に送る隠し項目 */
  children?: ReactNode;
};

/**
 * 「はい」「いいえ」で確認してから処理する小窓。
 * ブラウザ標準の confirm はボタンが「OK」「キャンセル」になるため、<dialog> で自作している。
 */
export function ConfirmDialog({
  title,
  detail,
  action,
  pending,
  triggerLabel,
  pendingLabel,
  triggerClassName,
  onConfirm,
  children,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => dialogRef.current?.showModal()}
        className={triggerClassName}
      >
        {pending ? pendingLabel : triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={title}
        className="m-auto w-[min(90vw,22rem)] rounded-2xl p-5 shadow-lg backdrop:bg-black/40"
      >
        <p className="font-semibold">{title}</p>
        {detail && <p className="mt-2 text-sm break-words text-zinc-700">{detail}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            いいえ
          </button>
          <form
            action={action}
            onSubmit={(e) => {
              if (pending) {
                e.preventDefault();
                return;
              }
              dialogRef.current?.close();
              onConfirm?.();
            }}
          >
            {children}
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              はい
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
