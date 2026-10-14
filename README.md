# 医療費記録アプリ

確定申告のときに医療費の合計をすぐに入力できるようにするための記録アプリ。
詳しい要件は [requirements.md](./requirements.md) を参照。

> 公開リポジトリのため、スクリーンショットやサンプルデータには実際の記録を使わず、架空のデータを使う。

## 技術構成

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase（Postgres + Auth + RLS）
- Vercel（ホスティング）

## セットアップ

1. 依存パッケージをインストール
   ```bash
   npm install
   ```
2. Supabase でプロジェクトを作成し、「Project Settings > API」の URL と anon key を `.env.local` に入れる
   ```bash
   cp .env.example .env.local
   ```
3. Supabase の SQL Editor で [`supabase/schema.sql`](./supabase/schema.sql) を実行してテーブルと RLS を作成する
4. Google ログインを設定する
   1. Google Cloud Console で OAuth 同意画面（外部）と、OAuth クライアント ID（ウェブ アプリケーション）を作成する
   2. 承認済みのリダイレクト URI に `https://<プロジェクトID>.supabase.co/auth/v1/callback` を追加する
   3. Supabase の「Authentication > Sign In / Providers > Google」を有効にし、クライアント ID とシークレットを入れる（シークレットは Supabase にだけ入れ、リポジトリには置かない）
   4. Supabase の「Authentication > URL Configuration」で、Site URL に本番の URL を、Redirect URLs に次の2つを入れる
      - `http://localhost:3000/auth/callback`
      - `https://<本番のドメイン>/auth/callback`
5. 開発サーバーを起動
   ```bash
   npm run dev
   ```
   [http://localhost:3000](http://localhost:3000) で確認できる。
6. Vercel に GitHub リポジトリをつなぎ、環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を登録する。以後は `main` に push すると本番に反映される

Supabase の無料プランは、しばらく使わないと一時停止する。止まったら Supabase の管理画面で再開する。

## ディレクトリ構成（抜粋）

```
src/app/(app)/        ログイン後の画面（入力・一覧・合計・設定・編集）と共通メニュー
src/app/_expenses/    記録のフォーム・入力チェック・保存処理（入力画面と編集画面で共通）
src/app/login/        ログイン画面
src/lib/              日付・金額の表示、合計の計算、文字の変換など
src/lib/supabase/     Supabase クライアントとログイン確認
supabase/schema.sql   テーブル定義・RLS
```
