import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI知圏 | AIと体系的に学ぶ質問集",
  description:
    "AI知圏は、AIと一緒に体系的な知識をたどるための質問プロンプト集です。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
