"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { useActivity } from "@/components/activity";
import type {
  ExpenseField,
  ExpenseFormState,
  ExpenseValues,
} from "./validation";

type Member = { id: string; name: string };

type Props = {
  members: Member[];
  today: string;
  initialValues: ExpenseValues;
  action: (prev: ExpenseFormState, formData: FormData) => Promise<ExpenseFormState>;
  submitLabel: string;
  successMessage?: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 aria-[invalid=true]:border-red-500";

export function ExpenseForm({
  members,
  today,
  initialValues,
  action,
  submitLabel,
  successMessage,
}: Props) {
  const [showReimbursement, setShowReimbursement] = useState(
    initialValues.reimbursement !== "",
  );
  // 保存中かどうか。ボタンの無効化が画面に反映される前の素早い2回目の押下も止めるため、
  // 画面の再描画を待たずにすぐ切り替わる ref で持つ
  const submitting = useRef(false);

  const [state, formAction, pending] = useActionState(
    async (prev: ExpenseFormState, formData: FormData) => {
      try {
        const result = await action(prev, formData);
        // 保存できたら補填金額の欄を閉じる（入力欄を空に戻す）
        if (result.ok) setShowReimbursement(false);
        return result;
      } finally {
        submitting.current = false;
      }
    },
    {},
  );
  const { claim, touch, isLatest } = useActivity(state);

  const values = state.values ?? initialValues;
  // ほかの操作をしたあと・保存中は古いメッセージを出さない
  const errors = isLatest ? (state.errors ?? {}) : {};

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (submitting.current) {
          e.preventDefault();
          return;
        }
        submitting.current = true;
        claim();
      }}
      onChange={touch}
      noValidate
      className="flex flex-col gap-4"
    >
      {/* 送信のたびに入力欄を作り直し、values を反映させる */}
      <div key={state.key ?? 0} className="flex flex-col gap-4">
        <Field id="family_member_id" label="医療を受けた人" error={errors.family_member_id}>
          <select
            id="family_member_id"
            name="family_member_id"
            defaultValue={values.family_member_id}
            aria-invalid={Boolean(errors.family_member_id)}
            className={inputClass}
          >
            <option value="">選んでください</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="paid_on" label="日付" error={errors.paid_on}>
          <input
            id="paid_on"
            name="paid_on"
            type="date"
            max={today}
            defaultValue={values.paid_on}
            aria-invalid={Boolean(errors.paid_on)}
            className={inputClass}
          />
        </Field>

        <Field id="payee" label="支払先" error={errors.payee}>
          <input
            id="payee"
            name="payee"
            defaultValue={values.payee}
            placeholder="例：〇〇クリニック、△△薬局"
            aria-invalid={Boolean(errors.payee)}
            className={inputClass}
          />
        </Field>

        <Field id="amount" label="支払った金額（円）" error={errors.amount}>
          <input
            id="amount"
            name="amount"
            inputMode="numeric"
            defaultValue={values.amount}
            placeholder="例：1200"
            aria-invalid={Boolean(errors.amount)}
            className={inputClass}
          />
        </Field>

        {showReimbursement ? (
          <Field
            id="reimbursement"
            label="保険などで補填される金額（円・任意）"
            error={errors.reimbursement}
          >
            <input
              id="reimbursement"
              name="reimbursement"
              inputMode="numeric"
              defaultValue={values.reimbursement}
              placeholder="例：50000"
              aria-invalid={Boolean(errors.reimbursement)}
              className={inputClass}
            />
          </Field>
        ) : (
          <button
            type="button"
            onClick={() => {
              touch();
              setShowReimbursement(true);
            }}
            className="self-start text-sm text-zinc-700 underline"
          >
            ＋補填金額を入力
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-60"
      >
        {pending ? "保存中…" : submitLabel}
      </button>

      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      {state.ok && isLatest && successMessage && (
        <p role="status" className="text-sm text-green-700">
          {successMessage}
        </p>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: ExpenseField;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
