"use client";

import { useActionState } from "react";
import { addFamilyMember, type FormState } from "./actions";

const initialState: FormState = {};

export function AddForm() {
  const [state, formAction, pending] = useActionState(addFamilyMember, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="new-name" className="text-sm font-medium">
        名前を追加
      </label>
      <div className="flex gap-2">
        <input
          // 送信のたびに作り直し、成功時は空・エラー時は入力内容を残す
          key={state.key}
          id="new-name"
          name="name"
          defaultValue={state.value ?? ""}
          placeholder="例：山田 花子"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          追加する
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
