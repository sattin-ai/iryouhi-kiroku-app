/** 画面を切り替えているあいだに出す表示 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4">
      <p role="status" className="text-sm text-zinc-500">
        読み込み中…
      </p>
    </main>
  );
}
