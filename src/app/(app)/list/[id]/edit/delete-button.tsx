"use client";

import { useActionState } from "react";
import type { DeleteState } from "@/app/_expenses/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Props = {
  /** deleteExpense.bind(null, id) で記録の番号を結び付けた Server Action */
  action: (prev: DeleteState) => Promise<DeleteState>;
  /** 確認の小窓に出す記録の内容（例：10/13（火） 〇〇クリニック 1,200円） */
  summary: string;
};

export function DeleteButton({ action, summary }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col gap-2">
      <ConfirmDialog
        title="この記録を削除しますか？"
        detail={summary}
        action={formAction}
        pending={pending}
        triggerLabel="削除"
        pendingLabel="削除中…"
        triggerClassName="rounded-lg border border-red-300 bg-white px-4 py-3 font-medium text-red-700 disabled:opacity-60"
      />
      {state.error && !pending && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
