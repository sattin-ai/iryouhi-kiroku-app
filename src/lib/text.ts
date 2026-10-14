/**
 * 支払先や家族の名前の文字をそろえる。変換するのは次の3つだけ。
 * 1. 全角の英字・数字 → 半角（Ａ→A、２→2）
 * 2. 半角カタカナ → 全角カタカナ（ｶﾞｰﾃﾞﾝ→ガーデン）
 * 3. 全角スペース → 半角スペース。続いたスペースは1つにし、前後の空白は取り除く
 *
 * まとめて変換する NFKC 正規化は使わない。
 * ㈱→(株)、①→1、（）→() のように、領収書の表記から離れるため。
 */
export function normalizeText(value: string): string {
  return (
    value
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      // 半角カタカナのまとまりだけを NFKC で全角にする（濁点 ﾞ も1文字にまとまる）
      .replace(/[｡-ﾟ]+/g, (s) => s.normalize("NFKC"))
      .replace(/[\s　]+/g, " ")
      .trim()
  );
}
