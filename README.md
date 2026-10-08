# 医療費記録アプリ

確定申告のときに医療費の合計をすぐに入力できるようにするための記録アプリ。
詳しい要件は [requirements.md](./requirements.md) を参照。

## 技術構成

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase（Postgres + Auth + RLS）
- Vercel（ホスティング）

## セットアップ

1. 依存パッケージをインストール
   ```bash
   npm install
   ```
2. `.env.example` を `.env.local` にコピーし、Supabase の値を入れる
   ```bash
   cp .env.example .env.local
   ```
3. Supabase の SQL Editor で [`supabase/schema.sql`](./supabase/schema.sql) を実行してテーブルと RLS を作成する
4. 開発サーバーを起動
   ```bash
   npm run dev
   ```
   [http://localhost:3000](http://localhost:3000) で確認できる。

## ディレクトリ構成（抜粋）

```
src/app/              ページ（App Router）
src/lib/supabase/     Supabase クライアント（client.ts: ブラウザ用 / server.ts: サーバー用）
supabase/schema.sql   テーブル定義・RLS
```
