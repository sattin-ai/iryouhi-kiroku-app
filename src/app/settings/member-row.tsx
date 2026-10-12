"use client";

import { useActionState, useState } from "react";
import {
  deleteFamilyMember,
  updateFamilyMember,
  type FormState,
} from "./actions";
import { useActivity } from "@/components/activity";

const initialState: FormState = {};

type Props = { id: string; name: string };

export function MemberRow({ id, name }: Props) {
  const [editing, setEditing] = useState(false);
  const updateActivity = useActivity();
  const deleteActivity = useActivity();

  const [updateState, updateAction, updating] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await updateFamilyMember(prev, formData);
      if (result.ok) setEditing(false);
      return result;
    },
    initialState,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteFamilyMember,
    initialState,
  );

  if (editing) {
    // 前回の保存が失敗したまま別の操作をした場合は、元の名前から編集し直す
    const draft =
      updateActivity.isLatest && updateState.value != null
        ? updateState.value
        : name;

    return (
      <li className="py-3">
        <form
          action={updateAction}
          onSubmit={updateActivity.claim}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="id" value={id} />
          <div className="flex gap-2">
            <input
              key={updateState.key}
              name="name"
              defaultValue={draft}
              onChange={updateActivity.touch}
              aria-label="名前"
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2"
            />
            <button
              type="submit"
              disabled={updating}
              className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => {
                updateActivity.touch();
                setEditing(false);
              }}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              キャンセル
            </button>
          </div>
          {updateState.error && updateActivity.isLatest && (
            <p className="text-sm text-red-600">{updateState.error}</p>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className="py-3">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate">{name}</span>
        <button
          type="button"
          onClick={() => {
            updateActivity.touch();
            setEditing(true);
          }}
          className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
        >
          修正
        </button>
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm(`「${name}」を削除しますか？`)) {
              e.preventDefault();
              return;
            }
            deleteActivity.claim();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={deleting}
            className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-60"
          >
            削除
          </button>
        </form>
      </div>
      {deleteState.error && deleteActivity.isLatest && (
        <p className="mt-1 text-sm text-red-600">{deleteState.error}</p>
      )}
    </li>
  );
}
