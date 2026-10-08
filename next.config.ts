import path from "node:path";
import type { NextConfig } from "next";

// このアプリは全ページがログイン必須・ユーザー専用データのため、
// 静的キャッシュの恩恵が薄い実験的機能（cacheComponents 等）は無効のままにしている。
const nextConfig: NextConfig = {
  turbopack: {
    // ユーザーのホームディレクトリ直下に無関係な package-lock.json があると
    // Turbopack がそこをルートと誤認するため、明示的に固定する。
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
