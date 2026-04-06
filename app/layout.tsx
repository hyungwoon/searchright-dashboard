import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SearcHRight Analytics Dashboard",
  description: "GA4 analytics dashboard for SearcHRight",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head />
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
