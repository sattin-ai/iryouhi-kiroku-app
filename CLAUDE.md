# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

医療費記録アプリ — a personal app for recording medical expenses so the yearly total can be entered on the Japanese tax return (確定申告). The spec, feature IDs (F-00〜F-09) and page list live in `requirements.md`; read it before adding features. UI text and code comments are in Japanese.

## 作業ルール

1. 新しいSTEPを始めるときは、Plan Modeで計画を見せて、私の承認を得てから実装する
2. 1つの機能ができたら、私が本番で動作確認してから次のSTEPへ進む
3. 説明は日本語で書き、専門用語にはかんたんな言い換えを添える
4. 作るものの内容は requirements.md を正とする。要件にないことを足すときは、計画の中で「要件にない判断」として分けて示す

## Commands

```bash
npm run dev     # http://localhost:3000 (loads .env.local)
npm run lint    # ESLint
npm run build   # production build + TypeScript check
```

There is no test suite. Verify changes with `lint` + `build`, and for auth-gated pages check that a logged-out request redirects (e.g. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/settings` → `307 .../login`). Logged-in behavior can only be checked by the user (Google OAuth).

Deployment: pushing to `main` on GitHub (`sattin-ai/iryouhi-kiroku-app`, **public repo**) auto-deploys to Vercel at https://iryouhi-kiroku-app.vercel.app. Never put real medical records in the repo, screenshots, or sample data — use fictional data only (requirement in `requirements.md`).

## Next.js version caveat

This is Next.js 16 with breaking changes from older versions (see `AGENTS.md`). Read the bundled docs in `node_modules/next/dist/docs/` before using a Next.js API. Notably, `middleware.ts` is renamed to **`proxy.ts`** (exported function `proxy`). `cacheComponents` is intentionally disabled in `next.config.ts` because every page is per-user and dynamic.

## Architecture

**Stack:** Next.js App Router + TypeScript + Tailwind v4, Supabase (Postgres + Auth with Google), Vercel.

**Auth is enforced in three layers — keep all three when adding pages or mutations:**
1. `src/proxy.ts` → `src/lib/supabase/proxy.ts` (`updateSession`): refreshes the Supabase session cookie on every request and redirects logged-out users to `/login` (public paths: `/login`, `/auth/*`). Optimistic check only.
2. `src/lib/supabase/dal.ts` (`requireUser`): call at the top of every page and every Server Action that touches data; redirects to `/login` if there is no user.
3. Postgres RLS in `supabase/schema.sql`: every table has `user_id` and policies restricting all operations to `auth.uid() = user_id`. Inserts must set `user_id` to `requireUser().id`. Queries also add `.eq("user_id", user.id)` explicitly.

Supabase clients: `src/lib/supabase/server.ts` for Server Components/Actions/Route Handlers, `src/lib/supabase/client.ts` for the browser (only used for starting the OAuth redirect in `src/app/login/login-button.tsx`). OAuth returns to `src/app/auth/callback/route.ts`, which exchanges the code for a session.

**Data model** (`supabase/schema.sql`, applied manually in the Supabase SQL Editor — schema changes require the user to run SQL themselves):
- `family_members` — the people expenses are for (managed on `/settings`, F-09).
- `medical_expenses` — one row per receipt: `paid_on`, `payee`, `amount`, `reimbursement` (default 0). `family_member_id` is `on delete restrict`, so deleting a family member that has records fails with Postgres error code `23503`; the app catches that code to show a message instead of deleting.
- `reimbursement` stores the amount actually received and may exceed `amount` (e.g. hospitalization benefits). Tax rules only allow deducting it up to that record's own cost, so totals use `min(reimbursement, amount)` per record — always go through `summarizeExpenses()` in `src/lib/totals.ts` rather than summing columns directly. `/list` and `/total` share the year switcher (`src/lib/years.ts`, `src/components/year-tabs.tsx`).

**Mutation/form pattern** (see `src/app/settings/`): Server Actions in a colocated `actions.ts` return a `FormState` (`{ ok, error, value, key }`), consumed by Client Components via `useActionState`. All validation happens in the action. On error the action returns the submitted `value` plus a fresh `key`; the input uses `key={state.key}` + `defaultValue={state.value}` so it remounts with the user's input preserved (React 19 resets forms after an action). Successful mutations call `revalidatePath(...)`. `ActivityProvider` / `useActivity` (`src/components/activity.tsx`, used on `/` and `/settings`) track the most recent interaction so a stale error or success message hides once any other input or form submission happens.

The expense form (`src/app/_expenses/`, a `_`-prefixed folder so it is not a route) is shared between `/` (create, F-01) and the upcoming edit page (F-04): `validation.ts` holds `parseExpenseForm`, `expense-form.tsx` takes the Server Action as a prop. "Today" must come from `todayInTokyo()` (`src/lib/date.ts`) because Vercel runs in UTC. Because FK checks bypass RLS, actions must verify `family_member_id` belongs to the current user before writing.

## Environment

`.env.local` (gitignored; template in `.env.example`) needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The same values are set in Vercel. The Google OAuth client secret lives only in the Supabase dashboard.
