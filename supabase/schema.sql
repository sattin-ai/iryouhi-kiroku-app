-- 医療費記録アプリ：テーブル定義 + RLS（Row Level Security）
-- Supabase の SQL Editor でこのファイルの内容をそのまま実行する。

-- =========================================
-- 1. family_members（医療を受けた人）
-- =========================================
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists family_members_user_id_idx
  on public.family_members (user_id);

alter table public.family_members enable row level security;

create policy "家族：本人の行だけ select"
  on public.family_members for select
  using (auth.uid() = user_id);

create policy "家族：本人の行だけ insert"
  on public.family_members for insert
  with check (auth.uid() = user_id);

create policy "家族：本人の行だけ update"
  on public.family_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "家族：本人の行だけ delete"
  on public.family_members for delete
  using (auth.uid() = user_id);

-- =========================================
-- 2. medical_expenses（医療費の記録）
-- =========================================
create table if not exists public.medical_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  family_member_id uuid not null references public.family_members (id) on delete restrict,
  paid_on date not null,
  payee text not null,
  amount integer not null check (amount >= 0),
  reimbursement integer not null default 0 check (reimbursement >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- family_member_id は on delete restrict にしているため、
-- 記録で使われている家族は削除できない（F-09: 削除せずメッセージを表示する）。
-- アプリ側はこの外部キー制約のエラーを検知してメッセージを表示する。

create index if not exists medical_expenses_user_id_paid_on_idx
  on public.medical_expenses (user_id, paid_on);

alter table public.medical_expenses enable row level security;

create policy "記録：本人の行だけ select"
  on public.medical_expenses for select
  using (auth.uid() = user_id);

create policy "記録：本人の行だけ insert"
  on public.medical_expenses for insert
  with check (auth.uid() = user_id);

create policy "記録：本人の行だけ update"
  on public.medical_expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "記録：本人の行だけ delete"
  on public.medical_expenses for delete
  using (auth.uid() = user_id);

-- updated_at を更新時に自動で今の時刻にする
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists medical_expenses_set_updated_at on public.medical_expenses;
create trigger medical_expenses_set_updated_at
  before update on public.medical_expenses
  for each row
  execute function public.set_updated_at();
